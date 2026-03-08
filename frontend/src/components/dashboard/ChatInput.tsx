'use client';

import { useRef, useState } from 'react';
import { Plus, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentAttachmentBar } from './DocumentAttachmentBar';
import { Document, api } from '@/lib/api';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  documents: Document[];
  selectedDocIds: number[];
  deletingIds: number[];
  onToggleDoc: (id: number) => void;
  onDeleteDoc: (id: number) => void;
  onUploadSuccess: () => void;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  documents,
  selectedDocIds,
  deletingIds,
  onToggleDoc,
  onDeleteDoc,
  onUploadSuccess,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <DocumentAttachmentBar
        documents={documents}
        selectedDocIds={selectedDocIds}
        deletingIds={deletingIds}
        onToggle={onToggleDoc}
        onDelete={onDeleteDoc}
      />
      
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-secondary/30 border border-border rounded-xl p-2 focus-within:ring-1 focus-within:ring-ring transition-all">
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <span className="sr-only">Upload PDF</span>
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] py-2 h-auto"
          disabled={isLoading}
        />

        <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-10 shrink-0 rounded-lg"
          disabled={isLoading || !input.trim() || isUploading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <p className="text-[10px] text-center text-muted-foreground mt-2">
        Tip: Select document chips to focus the AI on specific files.
      </p>
    </div>
  );
}
