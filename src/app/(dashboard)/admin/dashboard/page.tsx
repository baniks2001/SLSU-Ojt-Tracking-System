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
import Image from 'next/image';

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="SLSU Logo" 
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">SLSU OJT Tracking</h1>
                <p className="text-xs text-gray-600 hidden lg:block">
                  {user.accountType === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-mono text-gray-700">{currentTime.toLocaleTimeString()}</p>
                <p className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.accountType === 'superadmin' ? 'Super Administrator' : 'Administrator'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {user.accountType === 'superadmin' && (
                <Badge className="mt-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white">Super Admin Access</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-sky-600">{students.length}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-green-600">{students.filter(s => s.isActive).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-sky-600">{departmentUsers.length}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admin Users</p>
                  <p className="text-3xl font-bold text-purple-600">{adminUsers.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Users</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
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
