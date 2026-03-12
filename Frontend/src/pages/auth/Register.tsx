import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AuthResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      // Register endpoint returns UserResponse, not AuthResponse
      // So we register first, then auto-login
      await api.post('/auth/register', data);
      // Auto-login after successful registration
      const loginResponse = await api.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });
      return loginResponse.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      toast.success('Account created successfully');
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to register');
      toast.error('Registration failed');
    },
  });

  const onSubmit = (data: RegisterForm) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card rounded-[2rem] overflow-hidden border-none shadow-2xl">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Create an account</h1>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-bold ml-1 uppercase text-[10px] tracking-widest">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="fullName" 
                  placeholder="John Doe"
                  className={`pl-11 glass-input rounded-2xl h-12 font-bold text-slate-900 dark:text-white ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...register('fullName')} 
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.fullName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold ml-1 uppercase text-[10px] tracking-widest">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com"
                  className={`pl-11 glass-input rounded-2xl h-12 font-bold text-slate-900 dark:text-white ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...register('email')} 
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-bold ml-1 uppercase text-[10px] tracking-widest">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className={`pl-11 glass-input rounded-2xl h-12 font-bold text-slate-900 dark:text-white ${errors.password ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  {...register('password')} 
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full rounded-2xl h-14 mt-4 group font-black text-lg" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
