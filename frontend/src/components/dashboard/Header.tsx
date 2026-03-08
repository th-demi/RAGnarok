'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';

export function Header() {
  const { logout } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <LayoutDashboard className="h-5 w-5" />
          <span>Ragnarok</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
