'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/types/challenge';
import { DraggableBlock } from './draggable-block';

interface DropZoneProps {
  id: string;
  index: number;
  block?: CodeBlock;
  isOver?: boolean;
  isLocked?: boolean;
  onBlockClick?: (id: string) => void;
  indentation?: number;
}

export function DropZone({ id, index, block, isLocked, onBlockClick, indentation }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { index },
    disabled: isLocked
  });

  return (
    <div className="flex items-start group min-h-[28px]">
      <div className="w-12 text-right font-mono text-xs text-[#858585] select-none pr-4 pt-1.5 leading-none">
        {index + 1}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "relative flex-1 rounded-sm transition-colors min-h-[28px] -ml-2 pl-2",
          isOver && !block && "bg-white/10 ring-1 ring-white/20",
          !block && "hover:bg-white/5",
          !block && "border-l-2 border-transparent",
          isOver && !block && "border-l-2 border-blue-500"
        )}
        style={{ paddingLeft: indentation ? `${(indentation * 20) + 8}px` : '8px' }} // 8px is original pl-2
      >
        {block ? (
          <div className="w-full">
            <DraggableBlock 
                block={block} 
                className="w-full" 
                disabled={isLocked} 
                onClick={onBlockClick ? () => onBlockClick(block.id) : undefined}
            />
          </div>
        ) : (
           <div className="h-full w-full flex items-center">
              <span className="opacity-0 group-hover:opacity-20 text-xs font-mono text-muted-foreground pointer-events-none transition-opacity">
              </span>
           </div>
        )}
      </div>
    </div>
  );
}
