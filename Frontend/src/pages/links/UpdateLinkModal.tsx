import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Type, Activity, Loader2 } from 'lucide-react';

import { api } from '@/lib/api';
import { Link } from '@/types';
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

const updateLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.enum(['ACTIVE', 'DISABLED']),
});

type UpdateLinkForm = z.infer<typeof updateLinkSchema>;

interface UpdateLinkModalProps {
  link: Link;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateLinkModal({ link, isOpen, onClose }: UpdateLinkModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateLinkForm>({
    resolver: zodResolver(updateLinkSchema),
    defaultValues: {
      title: link.title,
      status: link.status,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: link.title,
        status: link.status,
      });
    }
  }, [isOpen, link, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateLinkForm) => {
      const response = await api.patch(`/links/${link.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link updated successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update link');
    },
  });

  const onSubmit = (data: UpdateLinkForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl glass-card">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900">Edit Link</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Update the title or status of your short link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Title <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="title"
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

            <div className="space-y-3">
              <Label htmlFor="status" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Status <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  id="status"
                  className={`flex h-12 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-3 py-2 pl-10 text-sm font-bold text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${errors.status ? 'border-red-500' : ''}`}
                  {...register('status')}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.status && (
                <p className="text-sm text-red-600 font-bold mt-2">{errors.status.message}</p>
              )}
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
