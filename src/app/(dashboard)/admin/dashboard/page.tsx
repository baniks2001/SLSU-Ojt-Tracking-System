'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Building, Shield, LogOut, Trash2, Edit, Key, Check, X, School, UserCheck, AlertTriangle, Activity, BookOpen, Plus } from 'lucide-react';
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
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    accountType: 'admin'
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);
  const [editStudentData, setEditStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    course: '',
    department: '',
    campus: '',
    year: '',
    section: ''
  });
  const [editPasswordData, setEditPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateCampus, setShowCreateCampus] = useState(false);
  const [courses, setCourses] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [newCourseData, setNewCourseData] = useState({
    courseCode: '',
    courseName: '',
    departmentName: '',
    campusId: '',
    description: '',
    totalHours: 500
  });
  const [newCampusData, setNewCampusData] = useState({
    campusName: '',
    campusCode: '',
    location: '',
    address: '',
    contactEmail: '',
    contactNumber: ''
  });

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
      fetchAllUsers();
      fetchCourses();
      fetchCampuses();
      fetchSystemLogs();
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

  const fetchAllUsersSilent = async () => {
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

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          email: newAdminData.email,
          password: newAdminData.password,
          accountType: newAdminData.accountType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin account created successfully!');
        setShowCreateAdmin(false);
        setNewAdminData({ email: '', password: '', accountType: 'admin' });
        fetchAllUsers(); // Refresh users list
      } else {
        toast.error(data.error || 'Failed to create admin account');
      }
    } catch (error) {
      toast.error('An error occurred while creating admin account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = (studentId: string) => {
    const student = users.find(u => u._id === studentId);
    if (student) {
      setStudentToEdit(student);
      setEditStudentData({
        firstName: student.details?.firstName || '',
        lastName: student.details?.lastName || '',
        email: student.email,
        studentId: student.details?.studentId || '',
        course: student.details?.course || '',
        department: student.details?.department || '',
        campus: student.details?.campus || '',
        year: student.details?.year || '',
        section: student.details?.section || ''
      });
      setShowEditStudent(true);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      const response = await fetch(`/api/users/${studentToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Student deleted successfully');
        fetchAllUsersSilent(); // Refresh users list silently
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete student');
      }
    } catch (error) {
      toast.error('An error occurred while deleting student');
    } finally {
      setShowDeleteDialog(false);
      setStudentToDelete(null);
    }
  };

  const handleUpdateStudent = async () => {
    if (!studentToEdit) return;
    
    try {
      const response = await fetch(`/api/users/${studentToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editStudentData,
          accountType: 'student'
        }),
      });

      if (response.ok) {
        toast.success('Student information updated successfully');
        setShowEditStudent(false);
        setStudentToEdit(null);
        fetchAllUsersSilent(); // Refresh users list silently
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update student information');
      }
    } catch (error) {
      toast.error('An error occurred while updating student information');
    }
  };

  const handleEditPassword = (studentId: string) => {
    const student = users.find(u => u._id === studentId);
    if (student) {
      setStudentToEdit(student);
      setEditPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setShowEditPassword(true);
    }
  };

  const handleUpdatePassword = async () => {
    if (!studentToEdit) return;
    
    if (editPasswordData.newPassword !== editPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (editPasswordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${studentToEdit._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: editPasswordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Student password updated successfully');
        setShowEditPassword(false);
        setStudentToEdit(null);
        setEditPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update student password');
      }
    } catch (error) {
      toast.error('An error occurred while updating student password');
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

  const fetchCampuses = async () => {
    try {
      const response = await fetch('/api/campuses');
      if (response.ok) {
        const data = await response.json();
        setCampuses(data.campuses || []);
      }
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const response = await fetch('/api/system-logs');
      if (response.ok) {
        const data = await response.json();
        setSystemLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };

  const handleCreateCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourseData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Course created successfully!');
        setShowCreateCourse(false);
        setNewCourseData({
          courseCode: '',
          courseName: '',
          departmentName: '',
          campusId: '',
          description: '',
          totalHours: 500
        });
        fetchCourses(); // Refresh courses list
      } else {
        toast.error(data.error || 'Failed to create course');
      }
    } catch (error) {
      toast.error('An error occurred while creating course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/campuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCampusData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Campus created successfully!');
        setShowCreateCampus(false);
        setNewCampusData({
          campusName: '',
          campusCode: '',
          location: '',
          address: '',
          contactEmail: '',
          contactNumber: ''
        });
        fetchCampuses(); // Refresh campuses list
      } else {
        toast.error(data.error || 'Failed to create campus');
      }
    } catch (error) {
      toast.error('An error occurred while creating campus');
    } finally {
      setIsLoading(false);
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
          <TabsList>
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Users</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Courses</TabsTrigger>
            <TabsTrigger value="monitoring" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Monitoring</TabsTrigger>
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
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                                onClick={() => handleEditStudent(student._id)}
                                title="Edit Information"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                onClick={() => handleEditPassword(student._id)}
                                title="Edit Password"
                              >
                                <Key className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                onClick={() => handleDeleteStudent(student._id)}
                                title="Delete Student"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Admin Users ({adminUsers.length})</h3>
                    <Button 
                      onClick={() => setShowCreateAdmin(true)}
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Create Admin
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-700 font-medium">Name</TableHead>
                        <TableHead className="text-gray-700 font-medium">Email</TableHead>
                        <TableHead className="text-gray-700 font-medium">Role</TableHead>
                        <TableHead className="text-gray-700 font-medium">Status</TableHead>
                        <TableHead className="text-gray-700 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell className="text-gray-900">
                            {admin.details?.departmentName || 'System Admin'}
                          </TableCell>
                          <TableCell className="text-gray-600">{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant={admin.accountType === 'superadmin' ? 'destructive' : 'default'}>
                              {admin.accountType === 'superadmin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
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

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Course Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowCreateCourse(true)}
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Course
                    </Button>
                    <Button 
                      onClick={() => setShowCreateCampus(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Add Campus
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Courses ({courses.length})</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="bg-blue-50">Course Code</TableHead>
                          <TableHead className="bg-blue-50">Course Name</TableHead>
                          <TableHead className="bg-blue-50">Department</TableHead>
                          <TableHead className="bg-blue-50">Campus</TableHead>
                          <TableHead className="bg-blue-50">Hours</TableHead>
                          <TableHead className="bg-blue-50">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course: any) => (
                          <TableRow key={course._id}>
                            <TableCell className="text-gray-900">{course.courseCode}</TableCell>
                            <TableCell className="text-gray-900">{course.courseName}</TableCell>
                            <TableCell className="text-gray-600">{course.departmentName}</TableCell>
                            <TableCell className="text-gray-600">
                              {course.campusId?.campusName || 'N/A'}
                            </TableCell>
                            <TableCell className="text-gray-600">{course.totalHours}</TableCell>
                            <TableCell>
                              <Badge variant={course.isActive ? "default" : "secondary"}>
                                {course.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Campuses ({campuses.length})</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="bg-gray-50">Campus Code</TableHead>
                          <TableHead className="bg-gray-50">Campus Name</TableHead>
                          <TableHead className="bg-gray-50">Location</TableHead>
                          <TableHead className="bg-gray-50">Contact</TableHead>
                          <TableHead className="bg-gray-50">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campuses.map((campus: any) => (
                          <TableRow key={campus._id}>
                            <TableCell className="text-gray-900">{campus.campusCode}</TableCell>
                            <TableCell className="text-gray-900">{campus.campusName}</TableCell>
                            <TableCell className="text-gray-600">{campus.location}</TableCell>
                            <TableCell className="text-gray-600">{campus.contactEmail || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={campus.isActive ? "default" : "secondary"}>
                                {campus.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    System Anomaly Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Critical Issues</h4>
                      <div className="text-sm text-red-700">
                        {systemLogs.filter((log: any) => log.severity === 'critical').length} critical issues detected
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Warnings</h4>
                      <div className="text-sm text-yellow-700">
                        {systemLogs.filter((log: any) => log.severity === 'warning').length} warnings detected
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">System Health</h4>
                      <div className="text-sm text-blue-700">
                        All systems operational
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent System Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {systemLogs.slice(0, 10).map((log: any, index: number) => (
                      <div key={log._id || index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{log.action}</span>
                          <Badge variant={log.severity === 'error' ? 'destructive' : log.severity === 'warning' ? 'secondary' : 'default'}>
                            {log.severity}
                          </Badge>
                        </div>
                        <div className="text-gray-600 text-xs">{log.description}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {log.userEmail} • {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-gray-50">Timestamp</TableHead>
                      <TableHead className="bg-gray-50">User</TableHead>
                      <TableHead className="bg-gray-50">Action</TableHead>
                      <TableHead className="bg-gray-50">Description</TableHead>
                      <TableHead className="bg-gray-50">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.slice(0, 20).map((log: any) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-gray-600 text-sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-900">{log.userEmail || 'System'}</TableCell>
                        <TableCell className="text-gray-900">{log.action}</TableCell>
                        <TableCell className="text-gray-600 text-sm">{log.description}</TableCell>
                        <TableCell>
                          <Badge variant={log.severity === 'error' ? 'destructive' : log.severity === 'warning' ? 'secondary' : 'default'}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600">
                  <p>System settings and configuration options.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Admin Dialog */}
        <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
          <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-gray-900 text-lg font-semibold">Create New Admin Account</DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a new administrator or super admin account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newAdminData.accountType} onValueChange={(value) => setNewAdminData({ ...newAdminData, accountType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateAdmin(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAdmin}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-gray-900 text-lg font-semibold">Confirm Delete</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete this student? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteStudent}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={showEditStudent} onOpenChange={setShowEditStudent}>
          <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-gray-900 text-lg font-semibold">Edit Student Information</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update the student's personal and academic information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editStudentData.firstName}
                    onChange={(e) => setEditStudentData({...editStudentData, firstName: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editStudentData.lastName}
                    onChange={(e) => setEditStudentData({...editStudentData, lastName: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editStudentData.email}
                  onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={editStudentData.studentId}
                  onChange={(e) => setEditStudentData({...editStudentData, studentId: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={editStudentData.course}
                    onChange={(e) => setEditStudentData({...editStudentData, course: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editStudentData.department}
                    onChange={(e) => setEditStudentData({...editStudentData, department: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="campus">Campus</Label>
                  <Input
                    id="campus"
                    value={editStudentData.campus}
                    onChange={(e) => setEditStudentData({...editStudentData, campus: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={editStudentData.year}
                    onChange={(e) => setEditStudentData({...editStudentData, year: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={editStudentData.section}
                    onChange={(e) => setEditStudentData({...editStudentData, section: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditStudent(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStudent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Password Dialog */}
        <Dialog open={showEditPassword} onOpenChange={setShowEditPassword}>
          <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-gray-900 text-lg font-semibold">Change Student Password</DialogTitle>
              <DialogDescription className="text-gray-600">
                Set a new password for this student account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={editPasswordData.newPassword}
                  onChange={(e) => setEditPasswordData({...editPasswordData, newPassword: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={editPasswordData.confirmPassword}
                  onChange={(e) => setEditPasswordData({...editPasswordData, confirmPassword: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditPassword(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePassword}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Course Dialog */}
        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-gray-900 text-lg font-semibold">Create New Course</DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new course to the system with department and campus assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., BSIT"
                    value={newCourseData.courseCode}
                    onChange={(e) => setNewCourseData({ ...newCourseData, courseCode: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalHours">Total Hours</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    placeholder="500"
                    value={newCourseData.totalHours}
                    onChange={(e) => setNewCourseData({ ...newCourseData, totalHours: parseInt(e.target.value) || 500 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  placeholder="e.g., Bachelor of Science in Information Technology"
                  value={newCourseData.courseName}
                  onChange={(e) => setNewCourseData({ ...newCourseData, courseName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  placeholder="Enter department name"
                  value={newCourseData.departmentName}
                  onChange={(e) => setNewCourseData({ ...newCourseData, departmentName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campus">Campus</Label>
                <Select value={newCourseData.campusId} onValueChange={(value) => setNewCourseData({ ...newCourseData, campusId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {campuses.map((campus: any) => (
                      <SelectItem key={campus._id} value={campus._id}>
                        {campus.campusName} ({campus.campusCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Course description (optional)"
                  value={newCourseData.description}
                  onChange={(e) => setNewCourseData({ ...newCourseData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateCourse(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCourse}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Create Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Campus Dialog */}
        <Dialog open={showCreateCampus} onOpenChange={setShowCreateCampus}>
          <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-gray-900 text-lg font-semibold">Create New Campus</DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new campus to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="campusCode">Campus Code</Label>
                  <Input
                    id="campusCode"
                    placeholder="e.g., MAIN"
                    value={newCampusData.campusCode}
                    onChange={(e) => setNewCampusData({ ...newCampusData, campusCode: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="campusName">Campus Name</Label>
                  <Input
                    id="campusName"
                    placeholder="e.g., Main Campus"
                    value={newCampusData.campusName}
                    onChange={(e) => setNewCampusData({ ...newCampusData, campusName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Hinunangan, Southern Leyte"
                  value={newCampusData.location}
                  onChange={(e) => setNewCampusData({ ...newCampusData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address (optional)"
                  value={newCampusData.address}
                  onChange={(e) => setNewCampusData({ ...newCampusData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="campus@example.com"
                    value={newCampusData.contactEmail}
                    onChange={(e) => setNewCampusData({ ...newCampusData, contactEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    placeholder="+63 XXX XXX XXXX"
                    value={newCampusData.contactNumber}
                    onChange={(e) => setNewCampusData({ ...newCampusData, contactNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateCampus(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCampus}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create Campus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
