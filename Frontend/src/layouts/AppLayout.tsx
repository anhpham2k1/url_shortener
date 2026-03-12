import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Link as LinkIcon, User, LogOut, Search, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Links', href: '/links', icon: LinkIcon },
  { name: 'Profile', href: '/profile', icon: User },
];

export function AppLayout() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-primary rounded-full mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen liquid-bg flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <div className="flex-1 flex flex-col min-h-0 sidebar-glass">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <div className="h-10 w-10 bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <LinkIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Shorty
              </span>
            </div>
            <nav className="mt-10 flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative block"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 active-nav-item rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div
                      className={cn(
                        isActive
                          ? 'text-white'
                          : 'text-slate-700 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5',
                        'relative group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all'
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                          'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0 z-10">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border-b border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-700 dark:text-slate-200">
                <Menu className="h-6 w-6" />
              </Button>
              <span className="ml-2 font-extrabold text-xl text-slate-900 dark:text-white">Shorty</span>
            </div>
            
            <div className="hidden md:flex flex-1 items-center max-w-md">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <Input
                  type="search"
                  placeholder="Search links..."
                  className="pl-10 glass-input border-white/30 bg-white/20 dark:bg-black/20"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-auto">
              <ModeToggle />
              <Button variant="ghost" size="icon" className="relative rounded-full bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-white/50 dark:ring-white/20 hover:ring-indigo-500/30 transition-all shadow-md">
                    <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-white font-bold text-sm">
                      {(user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card border-white/20 dark:border-white/10" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user?.fullName}</p>
                      <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700 focus:bg-red-50/50 dark:focus:bg-red-900/20 cursor-pointer font-semibold">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-border bg-card overflow-hidden"
            >
              <nav className="px-4 pt-2 pb-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted',
                        'flex items-center px-3 py-2 rounded-lg text-base font-medium'
                      )}
                    >
                      <item.icon className={cn(isActive ? 'text-primary' : 'text-muted-foreground', 'mr-3 h-5 w-5')} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
