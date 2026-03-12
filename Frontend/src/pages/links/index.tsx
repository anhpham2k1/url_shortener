import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreHorizontal, Plus, Copy, ExternalLink, BarChart2, Pencil, Trash2, Search, Filter, ArrowUpDown, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { api } from '@/lib/api';
import { Link as LinkType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateLinkModal } from './CreateLinkModal';
import { UpdateLinkModal } from './UpdateLinkModal';
import { DeleteLinkDialog } from './DeleteLinkDialog';

export function Links() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: links, isLoading } = useQuery<LinkType[]>({
    queryKey: ['links'],
    queryFn: async () => {
      const { data } = await api.get('/links');
      return data;
    },
  });

  const copyToClipboard = (shortCode: string) => {
    navigator.clipboard.writeText(`http://localhost:8080/r/${shortCode}`);
    toast.success('Link copied to clipboard');
  };

  const filteredLinks = links?.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded-full animate-pulse"></div>
        </div>
        <div className="h-10 w-64 bg-muted rounded-md animate-pulse"></div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-12 border-b border-border bg-muted/30 animate-pulse"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-border bg-card animate-pulse"></div>
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
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Links</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Manage and track your shortened URLs.</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full btn-primary px-6"
        >
          <Plus className="mr-2 h-5 w-5" /> Create Link
        </Button>
      </div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search links..." 
            className="pl-10 glass-input h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto glass-card border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 font-bold rounded-xl h-11 px-5">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-white/20 dark:bg-white/5">
            <TableRow className="hover:bg-transparent border-white/20 dark:border-white/10">
              <TableHead className="w-[250px] font-bold text-slate-700 dark:text-slate-300">Short Link</TableHead>
              <TableHead className="font-bold text-slate-700 dark:text-slate-300">Original URL</TableHead>
              <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <div className="flex items-center">
                  Created <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <div className="flex items-center justify-end">
                  Clicks <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks?.map((link, index) => (
              <TableRow 
                key={link.id} 
                className="group hover:bg-white/30 dark:hover:bg-white/5 transition-colors border-white/10 dark:border-white/5"
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white truncate w-[200px]">{link.title}</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`http://localhost:8080/r/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold bg-white/50 dark:bg-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-full transition-all text-xs inline-flex items-center shadow-sm"
                      >
                        /r/{link.shortCode}
                        <ExternalLink className="ml-1 h-3 w-3 opacity-70" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 dark:bg-white/5 rounded-full"
                        onClick={() => copyToClipboard(link.shortCode)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[250px]">
                  <div className="truncate text-sm text-slate-500 dark:text-slate-400 font-medium" title={link.originalUrl}>
                    {link.originalUrl}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                      link.status === 'ACTIVE'
                        ? 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                        : 'bg-slate-100/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    {link.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>}
                    {link.status !== 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2"></span>}
                    {link.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-500 dark:text-slate-400 font-medium">{format(new Date(link.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right font-bold text-slate-900 dark:text-white">{link.clicks.toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/40 dark:hover:bg-white/10">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] glass-card border-white/20 dark:border-white/10">
                      <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(link.shortCode)}
                        className="cursor-pointer font-semibold focus:bg-white/40 dark:focus:bg-white/10"
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer font-semibold focus:bg-white/40 dark:focus:bg-white/10">
                        <a
                          href={`http://localhost:8080/r/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> Visit Link
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer font-semibold focus:bg-white/40 dark:focus:bg-white/10">
                        <Link to={`/links/${link.shortCode}/analytics`}>
                          <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
                      <DropdownMenuItem onClick={() => setEditingLink(link)} className="cursor-pointer font-semibold focus:bg-white/40 dark:focus:bg-white/10">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-700 focus:bg-red-50/50 dark:focus:bg-red-900/20 cursor-pointer font-semibold"
                        onClick={() => setDeletingLink(link)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredLinks?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <LinkIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-1">No links found</p>
                    <p className="text-sm mb-4">
                      {searchQuery ? `No results for "${searchQuery}"` : "You haven't created any links yet."}
                    </p>
                    {!searchQuery && (
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="outline"
                        className="rounded-full"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create your first link
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {editingLink && (
        <UpdateLinkModal
          link={editingLink}
          isOpen={!!editingLink}
          onClose={() => setEditingLink(null)}
        />
      )}

      {deletingLink && (
        <DeleteLinkDialog
          link={deletingLink}
          isOpen={!!deletingLink}
          onClose={() => setDeletingLink(null)}
        />
      )}
    </motion.div>
  );
}
