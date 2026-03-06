'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful!');
        
        // Redirect based on user role
        if (data.user.accountType === 'student') {
          window.location.href = '/student/dashboard';
        } else if (data.user.accountType === 'department') {
          window.location.href = '/department/dashboard';
        } else if (data.user.accountType === 'admin') {
          window.location.href = '/admin/dashboard';
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 border border-gray-100">
              <Image 
                src="/logo.png" 
                alt="SLSU Logo" 
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Sign in to your OJT Tracking account</p>
          </div>

          {/* Login Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl animate-fadeIn">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 text-center">Sign In</CardTitle>
              <CardDescription className="text-gray-600 text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-10 pr-10 h-11 bg-white border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/register" 
                    className="text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors"
                  >
                    Sign up here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© 2024 Southern Leyte State University</p>
            <p className="mt-1">OJT Tracking System</p>
          </div>
        </div>
      </div>
    </>
  );
}
