'use client';

import { useState, useRef, useEffect } from 'react';
import { api, Document, AskResponse } from '@/lib/api';
import { Bot, User, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatInput } from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';

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
  }, [messages, loading]);

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
    } finally {
      setDeletingIds(prev => prev.filter(docId => docId !== numericId));
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage = content.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const payload: { question: string; doc_ids?: number[] } = { question: userMessage };
      if (selectedDocIds.length > 0) {
        payload.doc_ids = selectedDocIds;
      }

      const response = await api.post<AskResponse>('/rag/ask', payload);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.answer, sources: response.data.sources }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-5xl mx-auto min-h-0 bg-background/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 min-h-0 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[500px] h-full text-center p-8"
            >
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse" />
                <div className="relative p-6 rounded-3xl glass bg-primary/5 border border-primary/20 shadow-2xl">
                  <Sparkles className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient mb-4">
                What will we discover today?
              </h1>
              <p className="text-lg max-w-md text-muted-foreground font-medium leading-relaxed">
                Connect your documents and harness the power of Ragnarok's refined intelligence.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={`${index}-${msg.role}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                  "flex w-full gap-5",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-xl glass transition-transform hover:scale-105">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[85%] md:max-w-[75%]",
                  msg.role === 'user' ? "flex flex-col items-end" : "flex flex-col items-start"
                )}>
                  <div
                    className={cn(
                      "rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-xl backdrop-blur-sm transition-all",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground font-medium border border-primary/10" 
                        : "glass-dark border border-white/5 text-foreground/90"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {msg.sources.map((source, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-2xl glass-dark border border-white/5 p-4 transition-all hover:bg-white/[0.03] hover:border-primary/20 cursor-default">
                          <div className="flex items-center gap-2 font-bold mb-2 text-primary/90 text-xs tracking-wider uppercase">
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{source.filename}</span>
                          </div>
                          <p className="text-muted-foreground text-xs line-clamp-2 italic leading-relaxed">
                            "{source.text}"
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-2xl bg-white/10 border border-white/20 glass shadow-2xl transition-transform hover:scale-105">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))
          )}

          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full gap-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 glass shadow-xl">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center space-x-3 glass-dark border border-white/5 rounded-2xl px-6 py-4 shadow-xl">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-8 px-6">
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
