import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LogOut, 
  Trash2, 
  Edit, 
  Key, 
  Check, 
  School, 
  Users, 
  GraduationCap, 
  Building, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Activity,
  Settings,
  Bell,
  Search,
  Menu
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  user?: {
    _id: string;
    email: string;
    accountType: string;
    details?: {
      firstName?: string;
      lastName?: string;
    };
  };
  onLogout?: () => void;
  stats?: Array<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }>;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function ModernLayout({
  children,
  title,
  subtitle,
  user,
  onLogout,
  stats,
  actions,
  showSearch,
  onSearch
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div>
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {showSearch && (
                <form onSubmit={handleSearch} className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
              )}

              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-slate-600" />
              </Button>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.details?.firstName || 'Admin'} {user?.details?.lastName || 'User'}
                  </p>
                  <p className="text-xs text-blue-200">
                    {user?.accountType?.charAt(0).toUpperCase() + (user?.accountType?.slice(1) || '')}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {(user?.details?.firstName || user?.email)?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>

              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color.replace('text', 'bg').replace('-600', '-100')}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      {actions && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            {actions}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Modern Card Component
export function ModernCard({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = "" 
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      {(title || subtitle || actions) && (
        <CardHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}

// Modern Button Component
export function ModernButton({ 
  children, 
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  ...props 
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
  [key: string]: any;
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-blue-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <Button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full mr-2" />
      )}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
}

// Modern Badge Component
export function ModernBadge({ 
  children, 
  variant = "default" 
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variantClasses = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return (
    <Badge className={`${variantClasses[variant]} border px-2 py-1 text-xs font-medium`}>
      {children}
    </Badge>
  );
}
