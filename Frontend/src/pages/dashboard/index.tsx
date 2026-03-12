import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, MousePointerClick, Activity, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/links');
      const links = data || [];
      const totalClicks = links.reduce((acc: number, link: any) => acc + (link.clicks || 0), 0);
      return {
        totalLinks: links.length,
        totalClicks,
        recentLinks: links.slice(0, 5),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Welcome back! Here's an overview of your links.</p>
        </div>
        <Button asChild className="rounded-full btn-primary px-6">
          <Link to="/links">
            <Plus className="mr-2 h-5 w-5" />
            Create Link
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:shadow-indigo-500/20 transition-all duration-300 group relative overflow-hidden rounded-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Links</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-indigo-100/50 dark:bg-indigo-900/30 flex items-center justify-center shadow-sm">
                <LinkIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black text-slate-900 dark:text-white">{stats?.totalLinks || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:shadow-purple-500/20 transition-all duration-300 group relative overflow-hidden rounded-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Clicks</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-100/50 dark:bg-purple-900/30 flex items-center justify-center shadow-sm">
                <MousePointerClick className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black text-slate-900 dark:text-white">{stats?.totalClicks || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:shadow-emerald-500/20 transition-all duration-300 group relative overflow-hidden rounded-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Status</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">Healthy</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Recent Links</h2>
          <Button variant="ghost" size="sm" asChild className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold">
            <Link to="/links">View all</Link>
          </Button>
        </div>
        
        <div className="grid gap-4">
          {stats?.recentLinks?.map((link, index) => (
            <motion.div 
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="glass-card border-none group hover:shadow-indigo-500/10 transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-0.5">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                  <div className="space-y-2">
                    <p className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{link.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[300px] sm:max-w-[400px] font-medium">
                      {link.originalUrl}
                    </p>
                    <div className="flex flex-wrap items-center pt-3 gap-x-5 gap-y-2 text-sm">
                      <a
                        href={`http://localhost:8080/r/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold bg-white/50 dark:bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm transition-all"
                      >
                        /r/{link.shortCode}
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                      </a>
                      <span className="flex items-center text-slate-600 dark:text-slate-300 font-semibold">
                        <MousePointerClick className="mr-1.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                        {link.clicks} clicks
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{format(new Date(link.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0 rounded-full border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-bold px-5">
                    <Link to={`/links/${link.shortCode}/analytics`}>
                      Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {stats?.recentLinks?.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-2xl bg-muted/10"
            >
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LinkIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No links yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't created any short links yet. Create your first link to start tracking clicks.
              </p>
              <Button asChild className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <Link to="/links">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first link
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
