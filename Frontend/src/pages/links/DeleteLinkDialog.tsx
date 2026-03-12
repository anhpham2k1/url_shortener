import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { api } from '@/lib/api';
import { Link } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteLinkDialogProps {
  link: Link;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteLinkDialog({ link, isOpen, onClose }: DeleteLinkDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/links/${link.id}`);
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['links'] });
      const previousLinks = queryClient.getQueryData<Link[]>(['links']);
      if (previousLinks) {
        queryClient.setQueryData<Link[]>(
          ['links'],
          previousLinks.filter((l) => l.id !== link.id)
        );
      }
      return { previousLinks };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(['links'], context.previousLinks);
      }
      toast.error(err.response?.data?.message || err.message || 'Failed to delete link');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onSuccess: () => {
      toast.success('Link deleted successfully');
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl glass-card">
        <div className="h-2 bg-red-500 w-full"></div>
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <DialogTitle className="text-3xl font-black text-slate-900">Delete Link</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 font-medium text-base leading-relaxed">
              Are you sure you want to delete the link <span className="font-black text-slate-900">"{link.title}"</span>? 
              <br /><br />
              This action <span className="text-red-600 font-bold">cannot be undone</span> and will permanently remove all associated analytics data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-6 border-t border-white/20 mt-8">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/20 font-bold text-slate-600 rounded-full h-11 px-6">
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30 transition-all rounded-full px-8 h-11 font-bold"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Link'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
