'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
            router.push('/admin/dashboard');
            break;
          case 'superadmin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/login');
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <Logo size="large" className="mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to your SLSU OJT Tracking account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-primary-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="form-group">
                <Label htmlFor="email" className="form-label">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10 h-11 bg-white border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="form-group">
                <Label htmlFor="password" className="form-label">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10 h-11 bg-white border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 btn-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            {/* Register Link */}
            <div className="pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Register here
                </Link>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-xs text-gray-500">
            © 2026 Southern Leyte State University - OJT Tracking System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Built with modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
}
