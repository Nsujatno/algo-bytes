'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/types/challenge';

interface DraggableBlockProps {
  block: CodeBlock;
  className?: string;
  isOverlay?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function DraggableBlock({ block, className, isOverlay, disabled, onClick }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { block },
    disabled: disabled
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={!isDragging && !disabled ? onClick : undefined}
      className={cn(
        "group flex items-center gap-2 rounded px-2 py-0.5 text-sm font-mono text-foreground/90 bg-transparent transition-all",
        !disabled && "hover:bg-white/5 cursor-grab active:cursor-grabbing",
        disabled && "opacity-70 cursor-default",
        isDragging && "opacity-0",
        isOverlay && "opacity-100 bg-surface shadow-xl border border-border ring-1 ring-border rounded-md py-2 px-3 z-50",
        className
      )}
    >
      {/* Indentation Removed (Handled by DropZone) */}

      {/* Grip Icon (only visible on hover for draggable blocks) */}
      {/* Grip Icon (always present for alignment, invisible if disabled/not hovered) */}
      <div className={cn(
        "px-1 transition-opacity", 
        disabled ? "opacity-0 cursor-default select-none" : "opacity-0 group-hover:opacity-100 cursor-grab"
      )}>
         <GripVertical className="h-3 w-3 text-muted-foreground/50" />
      </div>

      <span className="select-none flex-1 truncate">
        {/* Basic Syntax Highlighting Logic */}
        {block.code.split(" ").map((word, i) => {
             // Simple heuristics for highlighting
             const isKeyword = ["def", "class", "return", "if", "else", "while", "for", "import", "from"].includes(word);
             const isOperator = ["=", "+", "-", "*", "/", "==", "!=", "<", ">"].includes(word);
             const isBuiltin = ["print", "len", "range", "str", "int"].includes(word);
             const isBoolean = ["True", "False", "None"].includes(word);
             
             let colorClass = "text-muted-foreground";
             if (isKeyword) colorClass = "text-[#c586c0]";
             else if (isOperator) colorClass = "text-foreground"; 
             else if (isBuiltin) colorClass = "text-[#dcdcaa]";
             else if (isBoolean) colorClass = "text-[#569cd6]";
             else colorClass = "text-foreground/80";
             
             return (
               <span key={i} className={colorClass}>
                 {word}{" "}
               </span>
             );
        })}
      </span>
    </div>
  );
}
