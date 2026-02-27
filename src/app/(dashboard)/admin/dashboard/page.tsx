'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Building, Shield, LogOut, Trash2, Edit, Key } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserData {
  id: string;
  email: string;
  accountType: 'student' | 'department' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  details?: any;
}

interface Department {
  _id: string;
  departmentName: string;
  departmentCode: string;
  ojtAdvisorName: string;
  location: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', accountType: 'admin' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
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
      setIsSuperAdmin(userData.accountType === 'superadmin');
      fetchAllUsers();
      fetchDepartments();
    } catch (error) {
      router.push('/login');
      return;
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/users?accountType=department');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.users.map((u: any) => u.details) || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: newAdmin.email,
          password: newAdmin.password,
          accountType: newAdmin.accountType,
        }),
      });

      if (response.ok) {
        toast.success('Admin/Department account created successfully');
        setNewAdmin({ email: '', password: '', accountType: 'admin' });
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, accountType: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          updates: { isActive: !currentStatus },
        }),
      });

      if (response.ok) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'superadmin':
        return <Badge className="bg-purple-600">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600">Admin</Badge>;
      case 'department':
        return <Badge className="bg-green-600">Department</Badge>;
      case 'student':
        return <Badge variant="outline">Student</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
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
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold">SLSU OJT Tracking System</h1>
                <p className="text-xs text-blue-200">
                  {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-lg font-mono">{currentTime.toLocaleTimeString()}</p>
                <p className="text-xs text-blue-200">{currentTime.toLocaleDateString()}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:bg-blue-800"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-purple-600 text-white text-xl">
                <Shield className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {isSuperAdmin && (
                <Badge className="mt-1 bg-purple-600">Super Admin Access</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#003366]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-green-600">{departmentUsers.length}</p>
                </div>
                <Building className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{adminUsers.length}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="admins">Admin Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Recent Activity</h3>
                    <p className="text-gray-600 text-sm">
                      System is running normally. Last login: {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">System Information</h3>
                    <p className="text-gray-600 text-sm">
                      SLSU OJT Tracking System v1.0<br />
                      Database: MongoDB Atlas<br />
                      Environment: Production
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students registered in the system.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((studentUser) => (
                        <TableRow key={studentUser.id}>
                          <TableCell>{studentUser.details?.studentId}</TableCell>
                          <TableCell>
                            {studentUser.details?.firstName} {studentUser.details?.lastName}
                          </TableCell>
                          <TableCell>{studentUser.details?.course}</TableCell>
                          <TableCell>{studentUser.details?.department}</TableCell>
                          <TableCell>
                            <Badge variant={studentUser.isActive ? "default" : "secondary"}>
                              {studentUser.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {!studentUser.details?.isAccepted && (
                              <Badge variant="outline" className="ml-2">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserStatus(studentUser.id, studentUser.isActive)}
                              >
                                {studentUser.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(studentUser.id, 'student')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Departments</CardTitle>
              </CardHeader>
              <CardContent>
                {departmentUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No departments registered in the system.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Code</TableHead>
                        <TableHead>Department Name</TableHead>
                        <TableHead>OJT Advisor</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentUsers.map((deptUser) => (
                        <TableRow key={deptUser.id}>
                          <TableCell>{deptUser.details?.departmentCode}</TableCell>
                          <TableCell>{deptUser.details?.departmentName}</TableCell>
                          <TableCell>{deptUser.details?.ojtAdvisorName}</TableCell>
                          <TableCell>{deptUser.details?.location}</TableCell>
                          <TableCell>
                            <Badge variant={deptUser.isActive ? "default" : "secondary"}>
                              {deptUser.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserStatus(deptUser.id, deptUser.isActive)}
                              >
                                {deptUser.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(deptUser.id, 'department')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            {isSuperAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Admin/Department Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          placeholder="Enter email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-type">Account Type</Label>
                        <Select
                          value={newAdmin.accountType}
                          onValueChange={(value) => setNewAdmin({ ...newAdmin, accountType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="department">Department</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#003366] hover:bg-[#002244]"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                {adminUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No administrators found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((adminUser) => (
                        <TableRow key={adminUser.id}>
                          <TableCell>{adminUser.email}</TableCell>
                          <TableCell>{getAccountTypeLabel(adminUser.accountType)}</TableCell>
                          <TableCell>
                            <Badge variant={adminUser.isActive ? "default" : "secondary"}>
                              {adminUser.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {adminUser.lastLogin
                              ? new Date(adminUser.lastLogin).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {isSuperAdmin && adminUser.accountType !== 'superadmin' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleUserStatus(adminUser.id, adminUser.isActive)}
                                  >
                                    {adminUser.isActive ? 'Deactivate' : 'Activate'}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(adminUser.id, adminUser.accountType)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
