import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { User, Shield, Key, Mail, Save, Loader2 } from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function Profile() {
  const { user, updateUser } = useAuth();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await api.put('/users/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await api.put('/users/me/password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      resetPassword();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password');
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    updatePasswordMutation.mutate(data);
  };

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
      className="space-y-8 max-w-3xl mx-auto pb-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Manage your account settings and preferences.</p>
      </div>

      <motion.div variants={item}>
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <CardHeader className="relative pt-0 pb-6">
            <div className="absolute -top-16 left-8 h-32 w-32 rounded-3xl border-8 border-white/50 dark:border-white/10 bg-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-5xl font-black shadow-inner">
                {(user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
              </div>
            </div>
            <div className="ml-44 pt-6">
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">{user?.fullName || 'User'}</CardTitle>
              <CardDescription className="flex items-center mt-2 text-slate-600 dark:text-slate-400 font-bold">
                <Mail className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                {user?.email}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="glass-card border-none shadow-xl">
          <CardHeader className="border-b border-white/10 dark:border-white/5 pb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100/50 dark:bg-indigo-500/10 flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Personal Information</CardTitle>
                <CardDescription className="font-medium text-slate-500 dark:text-slate-400">Update your personal details here.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 glass-input bg-white/5 dark:bg-white/5 text-slate-500 cursor-not-allowed border-white/10 h-12 rounded-xl font-medium"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">Your email address is used for login and cannot be changed.</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className={`pl-10 glass-input h-12 rounded-xl font-bold text-slate-900 dark:text-white transition-all ${profileErrors.fullName ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                    {...registerProfile('fullName')}
                  />
                </div>
                {profileErrors.fullName && (
                  <p className="text-sm text-red-600 font-bold mt-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1.5" />
                    {profileErrors.fullName.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/10 dark:border-white/5 px-8 py-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={isProfileSubmitting}
                className="btn-primary px-8 rounded-full h-11 font-bold"
              >
                {isProfileSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="glass-card border-none shadow-xl">
          <CardHeader className="border-b border-white/10 dark:border-white/5 pb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100/50 dark:bg-purple-500/10 flex items-center justify-center shadow-sm">
                <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Change Password</CardTitle>
                <CardDescription className="font-medium text-slate-500 dark:text-slate-400">Ensure your account is using a long, random password to stay secure.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-3">
                <Label htmlFor="currentPassword" className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`glass-input h-12 rounded-xl font-bold text-slate-900 dark:text-white transition-all ${passwordErrors.currentPassword ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...registerPassword('currentPassword')}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600 font-bold mt-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1.5" />
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`glass-input h-12 rounded-xl font-bold text-slate-900 dark:text-white transition-all ${passwordErrors.newPassword ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...registerPassword('newPassword')}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600 font-bold mt-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1.5" />
                    {passwordErrors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">Password must be at least 6 characters long.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/10 dark:border-white/5 px-8 py-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={isPasswordSubmitting}
                variant="outline"
                className="glass-card border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 h-11 px-8 rounded-full font-bold text-slate-700 dark:text-slate-300 shadow-sm"
              >
                {isPasswordSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Update Password
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
