import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Link2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModeToggle } from '@/components/mode-toggle';

export function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen liquid-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-20">
        <ModeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8 z-10"
      >
        <div className="h-20 w-20 bg-white/30 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform -rotate-6">
          <Link2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-center text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
          Shorty
        </h2>
        <p className="mt-3 text-center text-lg font-bold text-slate-600 dark:text-slate-400">
          Transform your long URLs into short links
        </p>
      </motion.div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Outlet />
      </div>

      <div className="mt-12 text-center text-slate-500 dark:text-slate-400 text-sm z-10 font-bold uppercase tracking-widest">
        <p>© 2026 Shorty Team • Premium Link Management</p>
      </div>
    </div>
  );
}
