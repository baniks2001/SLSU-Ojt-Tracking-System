'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Lock, ArrowLeft, Home } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful!');

        switch (data.user.accountType) {
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'department':
            router.push('/department/dashboard');
            break;
          case 'admin':
          case 'superadmin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/');
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 relative">
      {/* Return to Dashboard Button */}
      <Button
        variant="outline"
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center space-x-2 bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Button>

      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex flex-col items-center">
            <Logo size="large" className="mb-4" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Southern Leyte State University
              </h1>
              <p className="text-slate-600 font-medium">OJT Tracking System</p>
              <p className="text-xs text-slate-500 mt-1">Developed with ❤️ by SLSU Tech Team</p>
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-800">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pt-0 space-y-4">
          <div className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register here
            </Link>
          </div>
          <div className="text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
