import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MousePointerClick, Calendar, Globe, Smartphone, ArrowUpRight, BarChart2, Users, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'motion/react';

import { api } from '@/lib/api';
import { LinkAnalytics } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function Analytics() {
  const { shortCode } = useParams<{ shortCode: string }>();

  const { data: analytics, isLoading, error } = useQuery<LinkAnalytics>({
    queryKey: ['analytics', shortCode],
    queryFn: async () => {
      const { data } = await api.get(`/links/${shortCode}/analytics`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-[400px] bg-muted rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="h-24 w-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <BarChart2 className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Analytics not found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't load the analytics for this link. It may have been deleted or you might not have permission to view it.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/links">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Links
          </Link>
        </Button>
      </motion.div>
    );
  }

  // Format data for chart
  const chartData = analytics.dailyStats.map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    clicks: item.clicks,
  }));

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 glass-card border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10">
            <Link to="/links">
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics Overview</h1>
            <div className="flex items-center mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">/r/{shortCode}</span>
              <a 
                href={`http://localhost:8080/r/${shortCode}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Test link <ArrowUpRight className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass-card border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 font-bold rounded-xl h-11 px-5">
            <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
          </Button>
          <Button className="btn-primary rounded-full px-6 h-11">
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{(analytics.totalClicks * 0.82).toFixed(0)}</div>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +5.2% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. CTR</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 dark:text-white">4.2%</div>
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3 rotate-180" /> -0.4% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Region</CardTitle>
              <Globe className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 dark:text-white">US</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                45% of total traffic
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="border-b border-white/10 dark:border-white/5 pb-4">
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Click Trend</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Daily click volume distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="border-b border-white/10 dark:border-white/5 pb-4">
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Device Distribution</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Clicks by device type</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center pt-4">
              <div className="w-full space-y-6">
                {[
                  { name: 'Mobile', value: 68, color: 'bg-indigo-500', icon: Smartphone },
                  { name: 'Desktop', value: 25, color: 'bg-purple-500', icon: Globe },
                  { name: 'Tablet', value: 7, color: 'bg-blue-500', icon: Activity },
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${item.color} rounded-full shadow-sm`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="border-b border-white/10 dark:border-white/5 pb-4">
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Top Referrers</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Traffic sources</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {[
                  { name: 'Direct', value: 45, color: 'bg-indigo-500' },
                  { name: 'Google', value: 25, color: 'bg-blue-500' },
                  { name: 'Twitter', value: 15, color: 'bg-cyan-500' },
                  { name: 'Facebook', value: 10, color: 'bg-purple-500' },
                  { name: 'Other', value: 5, color: 'bg-slate-400' },
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${item.color} rounded-full shadow-sm`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="border-b border-white/10 dark:border-white/5 pb-4">
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Top Browsers</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Visitor browser usage</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {[
                  { name: 'Chrome', value: 60, color: 'bg-indigo-500' },
                  { name: 'Safari', value: 20, color: 'bg-blue-500' },
                  { name: 'Firefox', value: 10, color: 'bg-cyan-500' },
                  { name: 'Edge', value: 7, color: 'bg-purple-500' },
                  { name: 'Other', value: 3, color: 'bg-slate-400' },
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${item.color} rounded-full shadow-sm`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

