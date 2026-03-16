'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, Document } from '@/lib/api';
import { Header } from '@/components/dashboard/Header';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { authLoading } = useAuth();
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0 relative">
        <ChatInterface 
          documents={documents} 
          onUploadSuccess={fetchDocuments}
          onDeleteSuccess={fetchDocuments}
        />
      </main>
    </div>
  );
}
