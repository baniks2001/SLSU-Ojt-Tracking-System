'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Building, Shield, LogOut, Trash2, Edit, Key, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserData {
  _id: string;
  email: string;
  accountType: 'student' | 'department' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  details?: any;
}

interface Department {
  _id: string;
  userId: string;
  departmentName: string;
  departmentCode: string;
  ojtAdvisorName: string;
  ojtAdvisorPosition: string;
  contactEmail: string;
  contactNumber?: string;
  location: string;
  isActive: boolean;
  isAccepted: boolean;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  departmentName: string;
  totalHours: number;
  isActive: boolean;
}

interface SystemLog {
  _id: string;
  userEmail?: string;
  userType: string;
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: string;
  metadata?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pendingDepartments, setPendingDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', accountType: 'admin' });
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '', departmentName: '', totalHours: 500 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments?status=approved');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPendingDepartments = async () => {
    try {
      const response = await fetch('/api/departments?status=pending');
      if (response.ok) {
        const data = await response.json();
        setPendingDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching pending departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const response = await fetch('/api/system-logs?limit=100');
      if (response.ok) {
        const data = await response.json();
        setSystemLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };

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
      fetchPendingDepartments();
      fetchCourses();
      fetchSystemLogs();
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

  const handleAcceptDepartment = async (departmentId: string) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, action: 'accept' }),
      });

      if (response.ok) {
        toast.success('Department approved successfully');
        fetchDepartments();
        fetchPendingDepartments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to approve department');
      }
    } catch (error) {
      console.error('Error accepting department:', error);
      toast.error('An error occurred');
    }
  };

  const handleRejectDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to reject this department? This will deactivate their account.')) {
      return;
    }

    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, action: 'reject' }),
      });

      if (response.ok) {
        toast.success('Department rejected and account deactivated');
        fetchDepartments();
        fetchPendingDepartments();
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reject department');
      }
    } catch (error) {
      console.error('Error rejecting department:', error);
      toast.error('An error occurred');
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        toast.success('Course created successfully');
        setNewCourse({ courseCode: '', courseName: '', departmentName: '', totalHours: 500 });
        fetchCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses?id=${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('An error occurred');
    }
  };

  const exportSystemLogs = () => {
    const csvContent = [
      ['Date', 'User', 'Type', 'Action', 'Description', 'Severity'].join(','),
      ...systemLogs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.userEmail || 'System',
        log.userType,
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.severity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  // Refetch courses when courses tab is selected
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab]);

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
                  <p className="text-sm text-gray-600">Courses</p>
                  <p className="text-2xl font-bold text-orange-600">{courses.length}</p>
                </div>
                <Building className="h-8 w-8 text-orange-600" />
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
          <TabsList className="grid w-full grid-cols-7 lg:w-[1400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingDepartments.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingDepartments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
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
                        <TableRow key={studentUser._id}>
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
                                onClick={() => handleToggleUserStatus(studentUser._id, studentUser.isActive)}
                              >
                                {studentUser.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(studentUser._id, 'student')}
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
                        <TableRow key={deptUser._id}>
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
                                onClick={() => handleToggleUserStatus(deptUser._id, deptUser.isActive)}
                              >
                                {deptUser.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(deptUser._id, 'department')}
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

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-code">Course Code</Label>
                      <Input
                        id="course-code"
                        placeholder="e.g., BSIT, BSCS"
                        value={newCourse.courseCode}
                        onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-name">Course Name</Label>
                      <Input
                        id="course-name"
                        placeholder="e.g., BS Information Technology"
                        value={newCourse.courseName}
                        onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-dept">Department</Label>
                      <Input
                        id="course-dept"
                        placeholder="e.g., College of Computer Studies"
                        value={newCourse.departmentName}
                        onChange={(e) => setNewCourse({ ...newCourse, departmentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalHours">Total Hours</Label>
                      <Input
                        id="totalHours"
                        type="number"
                        placeholder="e.g., 500"
                        value={newCourse.totalHours}
                        onChange={(e) => setNewCourse({ ...newCourse, totalHours: parseInt(e.target.value) || 500 })}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003366] hover:bg-[#002244]"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Course'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No courses created yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course._id}>
                          <TableCell>{course.courseCode}</TableCell>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell>{course.departmentName}</TableCell>
                          <TableCell>{course.totalHours}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Department Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDepartments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending department registrations.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Code</TableHead>
                        <TableHead>Department Name</TableHead>
                        <TableHead>OJT Advisor</TableHead>
                        <TableHead>Contact Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDepartments.map((dept) => (
                        <TableRow key={dept._id}>
                          <TableCell>{dept.departmentCode}</TableCell>
                          <TableCell>{dept.departmentName}</TableCell>
                          <TableCell>
                            {dept.ojtAdvisorName}
                            <p className="text-xs text-gray-500">{dept.ojtAdvisorPosition}</p>
                          </TableCell>
                          <TableCell>{dept.contactEmail}</TableCell>
                          <TableCell>{dept.location}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAcceptDepartment(dept._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectDepartment(dept._id)}
                              >
                                Reject
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

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Activity Logs</CardTitle>
                <Button
                  onClick={exportSystemLogs}
                  variant="outline"
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {systemLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No system logs available.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemLogs.slice(0, 50).map((log) => (
                        <TableRow key={log._id}>
                          <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{log.userEmail || 'System'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.userType}</Badge>
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                          <TableCell>
                            <Badge className={
                              log.severity === 'critical' ? 'bg-red-600' :
                              log.severity === 'error' ? 'bg-orange-600' :
                              log.severity === 'warning' ? 'bg-yellow-600' :
                              'bg-blue-600'
                            }>
                              {log.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {systemLogs.length > 50 && (
                  <p className="text-center text-gray-500 mt-4">
                    Showing last 50 of {systemLogs.length} logs
                  </p>
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
                        <TableRow key={adminUser._id}>
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
                                    onClick={() => handleToggleUserStatus(adminUser._id, adminUser.isActive)}
                                  >
                                    {adminUser.isActive ? 'Deactivate' : 'Activate'}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(adminUser._id, adminUser.accountType)}
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
