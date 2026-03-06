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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      {/* Return to Dashboard Button */}
      <Button
        variant="outline"
        onClick={() => router.push('/')}
        className="absolute top-3 sm:top-6 left-3 sm:left-6 flex items-center space-x-1 sm:space-x-2 bg-white/90 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm z-10 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
      >
        <Home className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline sm:inline">Return to Dashboard</span>
        <span className="xs:hidden sm:hidden">Home</span>
      </Button>

      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm w-full max-w-sm sm:max-w-md relative z-10 transition-all duration-300 hover:shadow-3xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="text-center space-y-2 sm:space-y-4 pb-3 sm:pb-6 pt-3 sm:pt-6 flex-shrink-0">
          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 scale-110"></div>
              <div className="relative">
                <Logo size="small" className="drop-shadow-md w-12 h-12 sm:w-16 sm:h-16" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight px-2">
                Southern Leyte State University
              </h1>
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-8 sm:w-16"></div>
                <p className="text-slate-600 font-semibold text-xs sm:text-base">OJT Tracking System</p>
                <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-8 sm:w-16"></div>
              </div>
              <p className="text-xs text-slate-500 font-medium px-2">Developed with ❤️ by SLSU Tech Team</p>
            </div>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <CardTitle className="text-lg sm:text-xl text-slate-800 font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-slate-600 text-xs sm:text-sm leading-relaxed px-2">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 sm:pb-6 px-3 sm:px-6 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold text-xs sm:text-sm tracking-wide">Email Address</Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-focus-within:opacity-10 transition-opacity duration-200"></div>
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 sm:pl-12 pr-3 sm:pr-4 h-9 sm:h-11 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white transition-all duration-200 text-slate-700 placeholder-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-xs sm:text-sm tracking-wide">Password</Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-focus-within:opacity-10 transition-opacity duration-200"></div>
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pl-10 sm:pl-12 pr-3 sm:pr-4 h-9 sm:h-11 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white transition-all duration-200 text-slate-700 placeholder-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-9 sm:h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                  <span className="text-xs sm:text-sm">Signing in...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base">Sign In</span>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pt-0 pb-3 sm:pb-6 px-3 sm:px-6 space-y-2 sm:space-y-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-slate-600">
            <span>Don't have an account?</span>
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-200"
            >
              Register here
            </Link>
          </div>
          <div className="text-center">
            <Link 
              href="/forgot-password" 
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 font-medium hover:underline transition-all duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
