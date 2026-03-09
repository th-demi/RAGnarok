'use client';

import { useRef, useState } from 'react';
import { Plus, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentAttachmentBar } from './DocumentAttachmentBar';
import { Document, api } from '@/lib/api';
import { motion } from 'framer-motion';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
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
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="mb-4">
        <DocumentAttachmentBar
          documents={documents}
          selectedDocIds={selectedDocIds}
          deletingIds={deletingIds}
          onToggle={onToggleDoc}
          onDelete={onDeleteDoc}
        />
      </div>
      
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-end gap-3 glass bg-white/[0.03] border border-white/10 rounded-3xl p-3 shadow-2xl focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-300"
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
          <span className="sr-only">Upload PDF</span>
        </Button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[48px] py-3.5 h-12 max-h-48 text-[15px] text-foreground placeholder:text-muted-foreground/60 scrollbar-none font-medium"
          disabled={isLoading}
          rows={1}
        />

        <Button 
          type="submit" 
          size="icon" 
          className="h-12 w-12 shrink-0 rounded-2xl shadow-lg bg-primary hover:scale-105 transition-transform"
          disabled={isLoading || !input.trim() || isUploading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <p className="text-[11px] font-medium tracking-wide text-center text-muted-foreground/50 mt-4 uppercase">
        Refined Intelligence • Secure Document RAG
      </p>
    </motion.div>
  );
}
