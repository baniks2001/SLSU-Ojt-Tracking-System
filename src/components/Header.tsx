'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Menu, Home, Settings } from 'lucide-react';
import Logo from '@/components/Logo';

interface HeaderProps {
  user?: {
    _id: string;
    email: string;
    accountType: string;
    details?: {
      firstName?: string;
      lastName?: string;
      studentId?: string;
    };
  };
  title?: string;
  showBackButton?: boolean;
}

export default function Header({ user, title, showBackButton = false }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  return (
    <header className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size="small" />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SLSU OJT Tracking System
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    v2.0
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">Southern Leyte State University</p>
                <p className="text-xs text-slate-400">Developed by SLSU Tech Team</p>
              </div>
            </Link>
            
            {showBackButton && (
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  <Menu className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Center Section - Title */}
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                      {user.details?.firstName} {user.details?.lastName}
                    </span>
                    {user.details?.studentId && (
                      <Badge variant="outline" className="ml-2">
                        {user.details.studentId}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
