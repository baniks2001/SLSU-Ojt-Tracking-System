'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Menu, User, Bell } from 'lucide-react';
import { toast } from 'sonner';
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
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <header className="bg-blue-900 text-white shadow-md border-b border-blue-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size="small" />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    SLSU OJT Tracking System
                  </h1>
                  <Badge className="bg-blue-800 text-white text-xs border-blue-700">
                    v2.0
                  </Badge>
                </div>
                <p className="text-xs text-blue-200">Southern Leyte State University</p>
                <p className="text-xs text-blue-300">Developed by SLSU Tech Team</p>
              </div>
            </Link>
            
            {showBackButton && (
              <Link href="/">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-900">
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
            {user && (
              <>
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {user.details?.firstName} {user.details?.lastName}
                    </p>
                    <p className="text-xs text-blue-200">
                      {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <Button variant="ghost" className="text-white hover:bg-blue-800 p-2">
                    <Bell className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="relative">
                  <Button variant="ghost" className="text-white hover:bg-blue-800 p-2">
                    <User className="h-5 w-5" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="h-4 w-4 mr-2 sm:mr-0" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
