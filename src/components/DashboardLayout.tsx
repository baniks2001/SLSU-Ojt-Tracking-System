'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Activity,
  Target,
  Award,
  BookOpen,
  Building,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  user?: {
    _id: string;
    email: string;
    accountType: string;
    details?: {
      firstName?: string;
      lastName?: string;
      studentId?: string;
      department?: string;
      course?: string;
      campus?: string;
    };
  };
  children: ReactNode;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon?: ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    error: 'bg-error-50 text-error-600 border-error-200',
  };

  return (
    <Card className="shadow-card hover:shadow-elevation-medium transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? 'text-success-600' : 'text-error-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  !trend.isPositive && 'rotate-180'
                }`} />
                {trend.value}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityItem({ title, description, time, icon, status = 'info' }: ActivityItemProps) {
  const statusColors = {
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-info-100 text-info-800',
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <div className={`p-2 rounded-lg ${statusColors[status]}`}>
        {icon || <Activity className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

export function QuickAction({ title, description, icon, href, color = 'primary' }: QuickActionProps) {
  const colorClasses = {
    primary: 'hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300',
    success: 'hover:bg-success-50 hover:text-success-700 hover:border-success-300',
    warning: 'hover:bg-warning-50 hover:text-warning-700 hover:border-warning-300',
    error: 'hover:bg-error-50 hover:text-error-700 hover:border-error-300',
  };

  return (
    <a 
      href={href}
      className={`block p-4 border border-gray-200 rounded-lg transition-all duration-200 ${colorClasses[color]} hover-lift`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          color === 'primary' ? 'bg-primary-100 text-primary-600' :
          color === 'success' ? 'bg-success-100 text-success-600' :
          color === 'warning' ? 'bg-warning-100 text-warning-600' :
          'bg-error-100 text-error-600'
        }`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </a>
  );
}

export function UserProfileCard({ user }: { user?: DashboardLayoutProps['user'] }) {
  if (!user) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Profile Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {user.details?.firstName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.details?.firstName} {user.details?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <Badge className="mt-1 bg-primary-100 text-primary-800">
              {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
            </Badge>
          </div>
        </div>
        
        {user.details && (
          <div className="space-y-2 pt-4 border-t border-gray-200">
            {user.details.studentId && (
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">ID:</span>
                <span className="font-medium text-gray-900">{user.details.studentId}</span>
              </div>
            )}
            {user.details.course && (
              <div className="flex items-center space-x-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Course:</span>
                <span className="font-medium text-gray-900">{user.details.course}</span>
              </div>
            )}
            {user.details.department && (
              <div className="flex items-center space-x-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{user.details.department}</span>
              </div>
            )}
            {user.details.campus && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Campus:</span>
                <span className="font-medium text-gray-900">{user.details.campus}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Hours"
        value="156.5"
        icon={<Clock className="h-6 w-6" />}
        trend={{ value: "+12% from last month", isPositive: true }}
        color="primary"
      />
      <StatCard
        title="Attendance Rate"
        value="94%"
        icon={<CheckCircle className="h-6 w-6" />}
        trend={{ value: "+3% from last month", isPositive: true }}
        color="success"
      />
      <StatCard
        title="Pending Tasks"
        value="8"
        icon={<AlertCircle className="h-6 w-6" />}
        trend={{ value: "-2 from yesterday", isPositive: true }}
        color="warning"
      />
      <StatCard
        title="Performance"
        value="A+"
        icon={<Award className="h-6 w-6" />}
        trend={{ value: "Excellent", isPositive: true }}
        color="success"
      />
    </div>
  );
}

export function RecentActivities() {
  const activities = [
    {
      title: "Clock In",
      description: "Successfully clocked in for morning shift",
      time: "2 hours ago",
      icon: <Clock className="h-4 w-4" />,
      status: 'success' as const
    },
    {
      title: "Schedule Request",
      description: "Request for schedule change submitted",
      time: "5 hours ago",
      icon: <Calendar className="h-4 w-4" />,
      status: 'warning' as const
    },
    {
      title: "Profile Updated",
      description: "Personal information updated successfully",
      time: "1 day ago",
      icon: <Users className="h-4 w-4" />,
      status: 'info' as const
    },
    {
      title: "Achievement Unlocked",
      description: "Perfect attendance for 30 days",
      time: "2 days ago",
      icon: <Award className="h-4 w-4" />,
      status: 'success' as const
    }
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActions() {
  const actions = [
    {
      title: "Clock In/Out",
      description: "Record your attendance",
      icon: <Clock className="h-5 w-5" />,
      href: "#",
      color: 'primary' as const
    },
    {
      title: "View Schedule",
      description: "Check your work schedule",
      icon: <Calendar className="h-5 w-5" />,
      href: "#",
      color: 'success' as const
    },
    {
      title: "Request Leave",
      description: "Submit leave request",
      icon: <AlertCircle className="h-5 w-5" />,
      href: "#",
      color: 'warning' as const
    },
    {
      title: "Generate Report",
      description: "Download attendance report",
      icon: <Target className="h-5 w-5" />,
      href: "#",
      color: 'primary' as const
    }
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardLayout({ title, subtitle, user, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Last login:</span>
                <span className="font-medium text-gray-700">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
