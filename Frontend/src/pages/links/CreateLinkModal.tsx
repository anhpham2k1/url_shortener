import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link as LinkIcon, Type, Hash, Calendar, Loader2 } from 'lucide-react';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const createLinkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  title: z.string().min(1, 'Title is required'),
  customAlias: z.string().optional(),
  expiresAt: z.string().optional(),
});

type CreateLinkForm = z.infer<typeof createLinkSchema>;

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLinkModal({ isOpen, onClose }: CreateLinkModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkForm>({
    resolver: zodResolver(createLinkSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateLinkForm) => {
      // Clean up empty optional fields and convert expiresAt to ISO Instant
      const payload = {
        originalUrl: data.originalUrl,
        title: data.title,
        customAlias: data.customAlias || undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      };
      const response = await api.post('/links', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link created successfully');
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create link');
    },
  });

  const onSubmit = (data: CreateLinkForm) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl glass-card">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900">Create Short Link</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Enter a long URL to create a shortened link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="originalUrl" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Destination URL <span className="text-red-500">*</span></Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="originalUrl"
                  placeholder="https://example.com/very/long/path"
                  className={`pl-10 glass-input h-12 rounded-xl font-bold text-slate-900 transition-all ${errors.originalUrl ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...register('originalUrl')}
                />
              </div>
              {errors.originalUrl && (
                <p className="text-sm text-red-600 font-bold mt-2 flex items-center">
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  {errors.originalUrl.message}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="title" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Title <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="title"
                  placeholder="My Awesome Link"
                  className={`pl-10 glass-input h-12 rounded-xl font-bold text-slate-900 transition-all ${errors.title ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...register('title')}
                />
              </div>
              {errors.title && (
                <p className="text-sm text-red-600 font-bold mt-2 flex items-center">
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="customAlias" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Custom Alias <span className="text-slate-400 font-normal text-[10px]">(Optional)</span></Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="customAlias"
                    placeholder="my-custom-link"
                    className={`pl-10 glass-input h-12 rounded-xl font-bold text-slate-900 transition-all ${errors.customAlias ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                    {...register('customAlias')}
                  />
                </div>
                {errors.customAlias && (
                  <p className="text-sm text-red-600 font-bold mt-2">{errors.customAlias.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="expiresAt" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Expiration <span className="text-slate-400 font-normal text-[10px]">(Optional)</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    className={`pl-10 glass-input h-12 rounded-xl font-bold text-slate-900 transition-all ${errors.expiresAt ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                    {...register('expiresAt')}
                  />
                </div>
                {errors.expiresAt && (
                  <p className="text-sm text-red-600 font-bold mt-2">{errors.expiresAt.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-white/20 mt-8">
              <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/20 font-bold text-slate-600 rounded-full h-11 px-6">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30 transition-all rounded-full px-8 h-11 font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Link'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
