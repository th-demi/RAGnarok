'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, Document } from '@/lib/api';
import { Header } from '@/components/dashboard/Header';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get<Document[]>('/rag/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (authLoading) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <ChatInterface 
          documents={documents} 
          onUploadSuccess={fetchDocuments}
          onDeleteSuccess={fetchDocuments}
        />
      </main>
    </div>
  );
}
