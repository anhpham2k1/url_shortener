/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/hooks/useAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';

const Login = lazy(() => import('@/pages/auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then(module => ({ default: module.Register })));
const Dashboard = lazy(() => import('@/pages/dashboard').then(module => ({ default: module.Dashboard })));
const Links = lazy(() => import('@/pages/links').then(module => ({ default: module.Links })));
const Analytics = lazy(() => import('@/pages/analytics').then(module => ({ default: module.Analytics })));
const Profile = lazy(() => import('@/pages/profile').then(module => ({ default: module.Profile })));

import { ThemeProvider } from '@/components/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="url-shortener-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Routes>
                {/* Public Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected App Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/links" element={<Links />} />
                  <Route path="/links/:shortCode/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
