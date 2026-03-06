'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Building, Shield, LogOut, Trash2, Edit, Key, Check, X, School, UserCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/Logo';

interface UserData {
  _id: string;
  email: string;
  accountType: 'student' | 'department' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  details?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(userStr);
      if (!['admin', 'superadmin'].includes(userData.accountType)) {
        router.push('/login');
        return;
      }
      setUser(userData);
      fetchAllUsers();
    } catch (error) {
      router.push('/login');
    }
    setIsLoading(false);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [router]);

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const students = users.filter(u => u.accountType === 'student');
  const departmentUsers = users.filter(u => u.accountType === 'department');
  const adminUsers = users.filter(u => ['admin', 'superadmin'].includes(u.accountType));
  const activeUsers = users.filter(u => u.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Logo size="small" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold">SLSU OJT Tracking</h1>
                <p className="text-xs text-blue-200 hidden lg:block">
                  {user.accountType === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm sm:text-lg font-mono">{currentTime.toLocaleTimeString()}</p>
                <p className="text-xs text-blue-200">{currentTime.toLocaleDateString()}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:bg-blue-800"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarFallback className="bg-blue-800 text-white text-lg sm:text-xl">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
                {user.accountType === 'superadmin' ? 'Super Administrator' : 'Administrator'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
              {user.accountType === 'superadmin' && (
                <Badge className="mt-1 bg-blue-800 text-white">Super Admin Access</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="border-blue-200 bg-white shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-900">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-white shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-blue-900">{students.filter(s => s.isActive).length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-white shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-blue-900">{departmentUsers.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-white shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Users</p>
                  <p className="text-2xl font-bold text-blue-900">{adminUsers.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white border border-blue-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-900 text-white">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-900 text-white">Users</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-900 text-white">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600">
                  <p>Welcome to the admin dashboard. Here you can manage users, departments, and system settings.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Students ({students.length})</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-blue-50">Name</TableHead>
                        <TableHead className="bg-blue-50">Email</TableHead>
                        <TableHead className="bg-blue-50">Status</TableHead>
                        <TableHead className="bg-blue-50">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="text-gray-900">
                            {student.details?.firstName} {student.details?.lastName || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-600">{student.email}</TableCell>
                          <TableCell>
                            <Badge variant={student.isActive ? "default" : "secondary"}>
                              {student.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600">
                  <p>System settings and configuration options.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
