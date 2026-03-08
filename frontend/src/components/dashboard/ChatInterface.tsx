'use client';

import { useState, useRef, useEffect } from 'react';
import { api, Document, AskResponse } from '@/lib/api';
import { Bot, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatInput } from './ChatInput';

interface ChatInterfaceProps {
  documents: Document[];
  onUploadSuccess: () => void;
  onDeleteSuccess: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: AskResponse['sources'];
}

export function ChatInterface({ documents, onUploadSuccess, onDeleteSuccess }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onToggleDoc = (id: number) => {
    const numericId = Number(id);
    setSelectedDocIds(prev => 
      prev.includes(numericId) ? prev.filter(docId => docId !== numericId) : [...prev, numericId]
    );
  };

  const onDeleteDoc = async (id: number) => {
    const numericId = Number(id);
    setDeletingIds(prev => [...prev, numericId]);
    try {
      await api.delete(`/rag/document/${numericId}`);
      setSelectedDocIds(prev => prev.filter(docId => docId !== numericId));
      onDeleteSuccess();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete document.');
    } finally {
      setDeletingIds(prev => prev.filter(docId => docId !== numericId));
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage = content.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const payload: any = { question: userMessage };
      if (selectedDocIds.length > 0) {
        payload.document_ids = selectedDocIds;
        payload.doc_id = selectedDocIds[0]; // Backend currently expects singular doc_id
      }

      const response = await api.post<AskResponse>('/rag/ask', payload);
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: response.data.answer, 
          sources: response.data.sources 
        }
      ]);
    } catch (error) {
      console.error('Chat error', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <div className="p-4 rounded-full bg-secondary/50 mb-4">
               <Bot className="h-12 w-12 opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Ragnarok AI</h2>
            <p className="text-sm max-w-sm text-muted-foreground">
              Upload documents and ask questions. I'll use your selected files to provide accurate answers.
            </p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full gap-4 md:gap-6",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border bg-secondary shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[85%] md:max-w-[75%]",
              msg.role === 'user' ? "flex flex-col items-end" : "flex flex-col items-start"
            )}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/50 border border-border"
                )}
              >
                {msg.content}
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.sources.map((source, idx) => (
                    <div key={idx} className="text-xs bg-secondary/20 border border-border/50 rounded-xl p-3 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-2 font-medium mb-2 text-primary">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="truncate">{source.filename}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 italic leading-normal">
                        "{source.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex w-full gap-4 md:gap-6">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border bg-secondary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2 bg-secondary/30 border border-border rounded-2xl px-5 py-3">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm pb-4">
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={loading}
          documents={documents}
          selectedDocIds={selectedDocIds}
          deletingIds={deletingIds}
          onToggleDoc={onToggleDoc}
          onDeleteDoc={onDeleteDoc}
          onUploadSuccess={onUploadSuccess}
        />
      </div>
    </div>
  );
}
