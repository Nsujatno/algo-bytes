'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  DragStartEvent, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  DropAnimation,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core';
import { Challenge, CodeBlock } from '@/types/challenge';
import { DraggableBlock } from './draggable-block';
import { DropZone } from './drop-zone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RefreshCw, Play, CheckCircle2, AlertCircle, Lightbulb, Home, Share2 } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

interface ChallengeInterfaceProps {
  challenge: Challenge;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function ChallengeInterface({ challenge }: ChallengeInterfaceProps) {
  // State
  const [availableBlocks, setAvailableBlocks] = useState<CodeBlock[]>([]);
  const [workspace, setWorkspace] = useState<(CodeBlock | null)[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ correct: boolean; details: boolean[] } | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [slotIndentations, setSlotIndentations] = useState<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  // Click-to-place handler (Bidirectional)
  const handleBlockClick = (blockId: string) => {
    // 1. Check if block is in workspace (Return to pool)
    const workspaceIndex = workspace.findIndex(b => b?.id === blockId);
    if (workspaceIndex !== -1) {
        // Prevent moving locked blocks
        if (workspace[workspaceIndex]?.is_boilerplate) return;

        const blockToReturn = workspace[workspaceIndex];
        if (blockToReturn) {
            const newWorkspace = [...workspace];
            newWorkspace[workspaceIndex] = null;
            setWorkspace(newWorkspace);
            setAvailableBlocks(prev => [...prev, blockToReturn]);
        }
        return;
    }

    // 2. Check if block is in pool (Move to workspace)
    const firstEmptyIndex = workspace.findIndex(b => b === null);
    if (firstEmptyIndex !== -1) {
        const blockToMove = availableBlocks.find(b => b.id === blockId);
        if (blockToMove) {
            const newWorkspace = [...workspace];
            newWorkspace[firstEmptyIndex] = blockToMove;
            setWorkspace(newWorkspace);
            setAvailableBlocks(prev => prev.filter(b => b.id !== blockId));
        }
    }
  };

  // Initialize sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize state on mount
  useEffect(() => {
    const allBlocks = challenge.challenge_data.code_blocks;
    const items = allBlocks.map(b => ({ ...b })); // Clone
    const totalSlots = challenge.challenge_data.total_slots;
    
    // Compute Indentations for each slot based on the correct solution
    const indentations = new Array(totalSlots).fill(0);
    allBlocks.forEach(block => {
        if (block.correct_position !== undefined && block.correct_position < totalSlots) {
            indentations[block.correct_position] = block.indentation;
        }
    });
    setSlotIndentations(indentations);

    const boilerplateBlocks = items.filter(b => b.is_boilerplate);
    const draggableBlocks = [
        ...items.filter(b => !b.is_boilerplate),
        ...(challenge.challenge_data.decoy_blocks || [])
    ];

    const initialWorkspace = new Array(totalSlots).fill(null);
    boilerplateBlocks.forEach(block => {
        if (block.correct_position !== undefined && block.correct_position < totalSlots) {
            initialWorkspace[block.correct_position] = block;
        }
    });

    const shuffledPool = draggableBlocks.sort(() => Math.random() - 0.5);
    
    if (challenge.completed) {
        const perfectWorkspace = new Array(totalSlots).fill(null);
        const usedBlockIds = new Set<string>();
        
        allBlocks.forEach(block => {
            if (block.correct_position !== undefined && block.correct_position < totalSlots) {
                perfectWorkspace[block.correct_position] = block;
                usedBlockIds.add(block.id);
            }
        });

        setWorkspace(perfectWorkspace);
        setAvailableBlocks(shuffledPool.filter(b => !usedBlockIds.has(b.id)));
        setValidationResult({ correct: true, details: [] });
    } else {
        setAvailableBlocks(shuffledPool);
        setWorkspace(initialWorkspace);
        setValidationResult(null);
    }
  }, [challenge]);

  // Drag handlers
  function handleDragStart(event: DragStartEvent) {
    const block = event.active.data.current?.block as CodeBlock;
    if (block?.is_boilerplate) return; // Should not happen due to disabled prop, but safety check

    setActiveId(event.active.id as string);
    setValidationResult(null); 
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeBlockId = active.id as string;
    
    let draggedBlock: CodeBlock | undefined = availableBlocks.find(b => b.id === activeBlockId);
    let source: 'pool' | 'workspace' = draggedBlock ? 'pool' : 'workspace';
    let sourceIndex = -1;

    if (!draggedBlock) {
      sourceIndex = workspace.findIndex(b => b?.id === activeBlockId);
      if (sourceIndex !== -1) {
        draggedBlock = workspace[sourceIndex] as CodeBlock;
      }
    }

    if (!draggedBlock) {
      setActiveId(null);
      return;
    }

    if (!over) {
      if (source === 'workspace' && !draggedBlock.is_boilerplate) {
        const newWorkspace = [...workspace];
        newWorkspace[sourceIndex] = null;
        setWorkspace(newWorkspace);
        setAvailableBlocks([...availableBlocks, draggedBlock]);
      }
      setActiveId(null);
      return;
    }

    if (over.id.toString().startsWith('slot-')) {
      const targetIndex = parseInt(over.id.toString().replace('slot-', ''), 10);
      
      if (source === 'workspace' && sourceIndex === targetIndex) {
        setActiveId(null);
        return;
      }

      const newWorkspace = [...workspace];
      const existingBlockInTarget = newWorkspace[targetIndex];

      // Prevent dropping into a slot occupied by a locked boilerplate block
      if (existingBlockInTarget?.is_boilerplate) {
          setActiveId(null);
          return; 
      }

      // Handle the move
      if (source === 'pool') {
        setAvailableBlocks(availableBlocks.filter(b => b.id !== activeBlockId));
        
        if (existingBlockInTarget) {
          // If target has a block, move it back to pool
          setAvailableBlocks(prev => [...prev.filter(b => b.id !== activeBlockId), existingBlockInTarget]);
        }
        
        newWorkspace[targetIndex] = draggedBlock;
        setWorkspace(newWorkspace);
      } else {
        // Moving from one slot to another
        newWorkspace[sourceIndex] = null;
        
        if (existingBlockInTarget) {
          newWorkspace[sourceIndex] = existingBlockInTarget;
        }
        
        newWorkspace[targetIndex] = draggedBlock;
        setWorkspace(newWorkspace);
      }
    } 
    else if (over.id === 'pool-area') {
       if (source === 'workspace' && !draggedBlock.is_boilerplate) {
        const newWorkspace = [...workspace];
        newWorkspace[sourceIndex] = null;
        setWorkspace(newWorkspace);
        setAvailableBlocks([...availableBlocks, draggedBlock]);
       }
    }

    setActiveId(null);
  }

  // Validation Logic
  async function handleValidate() {
    if (isValidating) return;
    setIsValidating(true);
    
    try {
        const solution = workspace.map(b => b?.id);
        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

        const response = await fetch(`/api/challenges/${challenge.id}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                solution,
                time_taken: timeTaken
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setValidationResult({ 
                correct: data.correct, 
                details: data.results 
            });
            
            if (data.correct) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else {
            console.error('Validation failed:', data.error);
            // Handle error (maybe toast)
        }
    } catch (error) {
        console.error('Error validating:', error);
    } finally {
        setIsValidating(false);
    }
  }

  const activeBlock = 
    availableBlocks.find(b => b.id === activeId) || 
    workspace.find(b => b?.id === activeId);

  const { setNodeRef: setPoolRef, isOver: isPoolOver } = useDroppable({
    id: 'pool-area',
  });

  // Reset handler
  const handleReset = () => {
       const allBlocks = challenge.challenge_data.code_blocks;
       const items = allBlocks.map(b => ({ ...b }));
       const totalSlots = challenge.challenge_data.total_slots;
       
       const boilerplateBlocks = items.filter(b => b.is_boilerplate);
       const draggableBlocks = [
           ...items.filter(b => !b.is_boilerplate),
           ...(challenge.challenge_data.decoy_blocks || [])
       ];

       const initialWorkspace = new Array(totalSlots).fill(null);
       boilerplateBlocks.forEach(block => {
           if (block.correct_position !== undefined) {
               initialWorkspace[block.correct_position] = block;
           }
       });

       const shuffledPool = draggableBlocks.sort(() => Math.random() - 0.5);
       
       setAvailableBlocks(shuffledPool);
       setWorkspace(initialWorkspace);
       setValidationResult(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen max-w-[1600px] mx-auto p-4 gap-4">
        {/* Header */}
        <header className="flex items-center justify-between py-2 border-b border-border">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-muted/50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">{challenge.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono bg-muted/20 px-3 py-1 rounded">
               {availableBlocks.length} blocks left
            </div>
            <Button 
              onClick={validationResult?.correct ? () => router.push('/') : handleValidate}
              disabled={(!validationResult?.correct && workspace.some(b => b === null)) || isValidating} 
              className={cn(
                "gap-2 font-medium transition-all",
                validationResult?.correct ? "bg-green-500 hover:bg-green-600 text-white" : ""
              )}
            >
              {isValidating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : validationResult?.correct ? (
                <Home className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isValidating ? 'Checking...' : (validationResult?.correct ? 'Go to Dashboard' : 'Submit Solution')}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
          {/* Left: Problem Statement (Fixed width) */}
          <div className="w-[320px] bg-surface border border-border rounded-lg p-6 overflow-y-auto hidden lg:block shrink-0">
            <h2 className="text-lg font-bold mb-4">Problem</h2>
            <div className="text-muted-foreground mb-6 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{challenge.description}</ReactMarkdown>
            </div>
            
            <div className="space-y-6">
              {(() => {
                 const inputExamples = Array.isArray(challenge.challenge_data.input_example) 
                    ? challenge.challenge_data.input_example 
                    : [challenge.challenge_data.input_example];
                 const outputExamples = Array.isArray(challenge.challenge_data.output_example)
                    ? challenge.challenge_data.output_example
                    : [challenge.challenge_data.output_example];
                 
                 return inputExamples.map((inputEx, i) => (
                   <div key={i}>
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Example {i + 1}</h3>
                      <div className="flex flex-col gap-3 pl-3 border-l-2 border-muted/20">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium mb-1 block">Input</span>
                          <code className="block bg-background p-2 rounded text-sm font-mono text-purple-300 break-words whitespace-pre-wrap">
                            {inputEx}
                          </code>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-medium mb-1 block">Output</span>
                          <code className="block bg-background p-2 rounded text-sm font-mono text-green-300 break-words whitespace-pre-wrap">
                            {outputExamples[i] || ''}
                          </code>
                        </div>
                      </div>
                   </div>
                 ));
              })()}
            </div>

               {/* Hints Section */}
              <div className="pt-4 border-t border-border mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Hints
                  </h3>
                  {hintsRevealed < (challenge.challenge_data.hints?.length || 0) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setHintsRevealed(prev => prev + 1)}
                      className="h-7 text-xs"
                    >
                      Reveal Next
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {challenge.challenge_data.hints?.slice(0, hintsRevealed).map((hint, i) => (
                    <div key={i} className="bg-muted/10 p-3 rounded border border-border text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2">
                      <span className="font-bold text-foreground mr-2">{i + 1}.</span>
                      {hint}
                    </div>
                  ))}
                  {hintsRevealed === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Stuck? Reveal a hint to get some help.
                    </p>
                  )}
                </div>
              </div>
            </div>

          {/* Right Column: Workspace + Pool */}
          <div className="flex flex-col flex-1 gap-4 min-h-0">
              
              {/* Workspace (Scrollable) */}
              <div className="flex-1 flex flex-col items-center bg-background/50 rounded-lg border border-border/50 p-6 overflow-y-auto">
                <div className="w-full max-w-2xl space-y-2">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Solution Workspace</h2>
                     <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-muted-foreground hover:text-white">
                       <RefreshCw className="w-3 h-3 mr-1" /> Reset
                     </Button>
                  </div>

                  <div className="space-y-0.5 bg-surface p-4 rounded-lg border border-border min-h-[200px] h-auto font-mono shadow-inner text-sm overflow-hidden">
                    
                    <div className="flex flex-col">
                        {workspace.map((block, index) => (
                        <DropZone 
                            key={`slot-${index}`} 
                            id={`slot-${index}`} 
                            index={index} 
                            block={block || undefined}
                            isLocked={block?.is_boilerplate}
                            onBlockClick={handleBlockClick}
                            indentation={slotIndentations[index] || 0}
                        />
                        ))}
                    </div>
                  </div>
                  
                  {/* Validation Feedback */}
                  {validationResult && (
                    <div className={cn(
                      "mt-6 p-4 rounded-lg flex items-center gap-3 border",
                      validationResult.correct 
                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {validationResult.correct ? (

                        <>
                           <div className="flex-1 flex items-center gap-3">
                               <CheckCircle2 className="w-6 h-6" />
                               <div>
                                 <p className="font-bold">Challenge Solved!</p>
                                 <p className="text-sm opacity-90">Great job!</p>
                               </div>
                           </div>
                           {challenge.is_daily && (
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={() => {
                                     const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
                                     const streakText = challenge.streak_count ? `🔥 ${challenge.streak_count} day streak\n` : '';
                                     const text = `Algobytes Daily ${new Date().toLocaleDateString()}\n${challenge.title}\n⏱️ ${timeTaken}s\n${streakText}✅ Solved!`;
                                     navigator.clipboard.writeText(text);
                                     setIsCopied(true);
                                     setTimeout(() => setIsCopied(false), 2000);
                                 }} 
                                 className="gap-2 ml-4 bg-background/50 hover:bg-background/80 border-green-500/30 text-green-400 hover:text-green-300 min-w-[100px]"
                               >
                                   {isCopied ? "Copied!" : <>Share <Share2 className="w-3 h-3" /></>}
                               </Button>
                           )}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-6 h-6" />
                          <div>
                             <p className="font-bold">Incorrect Solution</p>
                             <p className="text-sm opacity-90">Some blocks are in the wrong position.</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Pool (Fixed height at bottom) */}
              <div className={cn(
                  "min-h-[100px] max-h-[300px] border rounded-lg flex flex-col shrink-0 overflow-hidden transition-colors h-auto",
                  isPoolOver ? "bg-surface/80 border-accent/50" : "bg-surface border-border"
              )}>
                 <div className="px-4 py-2 border-b border-border bg-surface/50 flex items-center justify-between">
                   <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Available Code Blocks</h3>
                   <span className="text-[10px] text-muted-foreground/70">
                     {isPoolOver ? "Drop to return to pool" : "Drag code from here"}
                   </span>
                 </div>
                 
                 <div 
                   ref={setPoolRef}
                   className="flex-1 overflow-y-auto p-4 content-start" 
                   id="pool-area"
                 >
                    {availableBlocks.length === 0 && !isPoolOver && (
                      <div className="text-center py-8 text-muted-foreground/50 text-xs font-mono">
                        // All blocks used
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                        {availableBlocks.map((block) => (
                          <div key={block.id} className="cursor-grab hover:bg-white/5 rounded border border-transparent hover:border-border transition-colors">
                              <DraggableBlock block={block} onClick={() => handleBlockClick(block.id)} />
                          </div>
                        ))}
                    </div>
                 </div>
              </div>

          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && activeBlock ? (
             <DraggableBlock block={activeBlock} isOverlay />
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}
