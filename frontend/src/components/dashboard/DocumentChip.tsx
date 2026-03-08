'use client';

import { X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/lib/api';

interface DocumentChipProps {
  document: Document;
  isSelected: boolean;
  isDeleting: boolean;
  onToggle: (id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

export function DocumentChip({ 
  document, 
  isSelected, 
  isDeleting,
  onToggle, 
  onDelete 
}: DocumentChipProps) {
  return (
    <div
      onClick={() => onToggle(document.id)}
      className={cn(
        "group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all shrink-0 select-none",
        isSelected 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/60"
      )}
    >
      <FileText className={cn("h-3.5 w-3.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
      <span className="max-w-[120px] truncate">{document.filename}</span>
      <button
        onClick={(e) => onDelete(e, document.id)}
        disabled={isDeleting}
        className={cn(
          "p-0.5 rounded-full hover:bg-black/10 transition-colors",
          isSelected ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
