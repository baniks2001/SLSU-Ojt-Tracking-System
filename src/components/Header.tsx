'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Bell, User, Menu, X, Home, Settings } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { useState } from 'react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getUserInitials = () => {
    if (user?.details?.firstName) {
      return user.details.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.details?.firstName && user?.details?.lastName) {
      return `${user.details.firstName} ${user.details.lastName}`;
    }
    if (user?.details?.firstName) {
      return user.details.firstName;
    }
    return 'User';
  };

  const getAccountTypeDisplay = () => {
    if (!user?.accountType) return '';
    return user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white hover:bg-primary-800 p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo and Brand */}
            <Link href="/" className="flex items-center space-x-3">
              <Logo size="small" />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    SLSU OJT Tracking System
                  </h1>
                  <Badge className="bg-primary-700 text-white text-xs border-primary-600">
                    v2.0
                  </Badge>
                </div>
                <p className="text-xs text-primary-200">Southern Leyte State University</p>
                <p className="text-xs text-primary-300">Developed by SLSU Tech Team</p>
              </div>
            </Link>
            
            {/* Back Button */}
            {showBackButton && (
              <Link href="/">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-900 transition-all duration-200">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Center Section - Page Title (Desktop) */}
          <div className="hidden md:block flex-1 text-center">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-primary-800 p-2 relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Profile */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-primary-200">
                      {getAccountTypeDisplay()}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-primary-500 shadow-lg">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-primary-900"></div>
                  </div>
                </div>

                {/* Mobile User Menu */}
                <div className="sm:hidden">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-primary-800 p-2">
                    <User className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Logout Button */}
                <Button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-primary-800 bg-primary-900/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center space-x-3 pb-3 border-b border-primary-800">
                <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                  <p className="text-xs text-primary-200">{getAccountTypeDisplay()}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <Link 
                  href="/student/dashboard" 
                  className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-primary-800 rounded-md transition-colors duration-200"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-primary-800 rounded-md transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-primary-800 rounded-md transition-colors duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
