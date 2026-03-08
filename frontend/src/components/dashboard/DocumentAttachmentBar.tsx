'use client';

import { Document } from '@/lib/api';
import { DocumentChip } from './DocumentChip';

interface DocumentAttachmentBarProps {
  documents: Document[];
  selectedDocIds: number[];
  deletingIds: number[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function DocumentAttachmentBar({
  documents,
  selectedDocIds,
  deletingIds,
  onToggle,
  onDelete,
}: DocumentAttachmentBarProps) {
  if (documents.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 px-1">
      {documents.map((doc) => (
        <DocumentChip
          key={doc.id}
          document={doc}
          isSelected={selectedDocIds.includes(Number(doc.id))}
          isDeleting={deletingIds.includes(Number(doc.id))}
          onToggle={onToggle}
          onDelete={(e, id) => {
            e.stopPropagation();
            onDelete(id);
          }}
        />
      ))}
    </div>
  );
}
