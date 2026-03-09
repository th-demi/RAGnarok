'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto max-w-7xl glass rounded-2xl px-6 h-16 flex items-center justify-between shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">
            Ragnarok
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            className="text-muted-foreground hover:text-foreground transition-all rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.div>
    </header>
  );
}
