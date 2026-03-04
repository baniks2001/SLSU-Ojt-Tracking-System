'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Building, Shield, LogOut, Trash2, Edit, Key, Check, X, School } from 'lucide-react';
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
  campusId: string;
  campusName?: string;
  totalHours: number;
  isActive: boolean;
}

interface Campus {
  _id: string;
  campusName: string;
  campusCode: string;
  location: string;
  address?: string;
  contactEmail?: string;
  contactNumber?: string;
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
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', accountType: 'admin' });
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '', departmentName: '', campusId: '', totalHours: 500 });
  const [newCampus, setNewCampus] = useState({
    campusName: '',
    campusCode: '',
    location: '',
    address: '',
    contactEmail: '',
    contactNumber: '',
  });
  const [newDepartment, setNewDepartment] = useState({
    email: '',
    password: '',
    departmentName: '',
    departmentCode: '',
    location: '',
    contactEmail: '',
    contactNumber: '',
    ojtAdvisorName: '',
    ojtAdvisorPosition: '',
  });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStudentEditDialogOpen, setIsStudentEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserData | null>(null);
  const [isAdminEditDialogOpen, setIsAdminEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserData | null>(null);
  const [isCampusEditDialogOpen, setIsCampusEditDialogOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    course: '',
    department: '',
    hostEstablishment: '',
    contactNumber: '',
    address: '',
  });
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
        // Enrich courses with campus names
        const coursesWithCampus = (data.courses || []).map((course: Course) => {
          const campus = campuses.find(c => c._id === course.campusId);
          return { ...course, campusName: campus?.campusName || 'Unknown' };
        });
        setCourses(coursesWithCampus);
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
      fetchCampuses();
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
        setNewCourse({ courseCode: '', courseName: '', departmentName: '', campusId: '', totalHours: 500 });
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

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: newDepartment.email,
          password: newDepartment.password,
          accountType: 'department',
          departmentData: {
            departmentName: newDepartment.departmentName,
            departmentCode: newDepartment.departmentCode,
            location: newDepartment.location,
            contactEmail: newDepartment.contactEmail,
            contactNumber: newDepartment.contactNumber,
            ojtAdvisorName: newDepartment.ojtAdvisorName,
            ojtAdvisorPosition: newDepartment.ojtAdvisorPosition,
          },
        }),
      });

      if (response.ok) {
        toast.success('Department created successfully');
        setNewDepartment({
          email: '',
          password: '',
          departmentName: '',
          departmentCode: '',
          location: '',
          contactEmail: '',
          contactNumber: '',
          ojtAdvisorName: '',
          ojtAdvisorPosition: '',
        });
        fetchAllUsers();
        fetchDepartments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: editingDepartment._id,
          action: 'update',
          updates: {
            departmentName: editingDepartment.departmentName,
            departmentCode: editingDepartment.departmentCode,
            location: editingDepartment.location,
            contactEmail: editingDepartment.contactEmail,
            contactNumber: editingDepartment.contactNumber,
            ojtAdvisorName: editingDepartment.ojtAdvisorName,
            ojtAdvisorPosition: editingDepartment.ojtAdvisorPosition,
          },
        }),
      });

      if (response.ok) {
        toast.success('Department updated successfully');
        setIsEditDialogOpen(false);
        setEditingDepartment(null);
        fetchAllUsers();
        fetchDepartments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditingDepartment(dept);
    setIsEditDialogOpen(true);
  };

  const openStudentEditDialog = (student: UserData) => {
    setEditingStudent(student);
    setIsStudentEditDialogOpen(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: newStudent.email,
          password: newStudent.password,
          accountType: 'student',
          studentData: {
            studentId: newStudent.studentId,
            firstName: newStudent.firstName,
            lastName: newStudent.lastName,
            middleName: newStudent.middleName,
            course: newStudent.course,
            department: newStudent.department,
            hostEstablishment: newStudent.hostEstablishment,
            contactNumber: newStudent.contactNumber,
            address: newStudent.address,
            shiftType: 'regular',
          },
        }),
      });

      if (response.ok) {
        toast.success('Student created successfully');
        setNewStudent({
          email: '',
          password: '',
          studentId: '',
          firstName: '',
          lastName: '',
          middleName: '',
          course: '',
          department: '',
          hostEstablishment: '',
          contactNumber: '',
          address: '',
        });
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingStudent._id,
          updates: {
            studentData: {
              studentId: editingStudent.details?.studentId,
              firstName: editingStudent.details?.firstName,
              lastName: editingStudent.details?.lastName,
              middleName: editingStudent.details?.middleName,
              course: editingStudent.details?.course,
              department: editingStudent.details?.department,
              hostEstablishment: editingStudent.details?.hostEstablishment,
              contactNumber: editingStudent.details?.contactNumber,
              address: editingStudent.details?.address,
            }
          }
        }),
      });

      if (response.ok) {
        toast.success('Student updated successfully');
        setIsStudentEditDialogOpen(false);
        setEditingStudent(null);
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdminEditDialog = (admin: UserData) => {
    setEditingAdmin(admin);
    setIsAdminEditDialogOpen(true);
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingAdmin._id,
          updates: {
            email: editingAdmin.email,
          }
        }),
      });

      if (response.ok) {
        toast.success('Admin updated successfully');
        setIsAdminEditDialogOpen(false);
        setEditingAdmin(null);
        fetchAllUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update admin');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/campuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampus),
      });

      if (response.ok) {
        toast.success('Campus created successfully');
        setNewCampus({
          campusName: '',
          campusCode: '',
          location: '',
          address: '',
          contactEmail: '',
          contactNumber: '',
        });
        fetchCampuses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create campus');
      }
    } catch (error) {
      console.error('Error creating campus:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/campuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campusId: editingCampus._id,
          updates: {
            campusName: editingCampus.campusName,
            campusCode: editingCampus.campusCode,
            location: editingCampus.location,
            address: editingCampus.address,
            contactEmail: editingCampus.contactEmail,
            contactNumber: editingCampus.contactNumber,
            isActive: editingCampus.isActive,
          }
        }),
      });

      if (response.ok) {
        toast.success('Campus updated successfully');
        setIsCampusEditDialogOpen(false);
        setEditingCampus(null);
        fetchCampuses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update campus');
      }
    } catch (error) {
      console.error('Error updating campus:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCampus = async (campusId: string) => {
    if (!confirm('Are you sure you want to delete this campus? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/campuses?id=${campusId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Campus deleted successfully');
        fetchCampuses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete campus');
      }
    } catch (error) {
      console.error('Error deleting campus:', error);
      toast.error('An error occurred');
    }
  };

  const handleToggleCampusStatus = async (campusId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/campuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campusId,
          updates: { isActive: !currentStatus },
        }),
      });

      if (response.ok) {
        toast.success(`Campus ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchCampuses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update campus status');
      }
    } catch (error) {
      console.error('Error updating campus status:', error);
      toast.error('An error occurred');
    }
  };

  const openCampusEditDialog = (campus: Campus) => {
    setEditingCampus(campus);
    setIsCampusEditDialogOpen(true);
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

  // Refetch courses, campuses, and pending data when their tabs are selected
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    }
    if (activeTab === 'campuses') {
      fetchCampuses();
    }
    if (activeTab === 'pending') {
      fetchPendingDepartments();
    }
  }, [activeTab]);

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

  const campusCount = campuses.length;

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
                  <p className="text-sm text-gray-600">Campuses</p>
                  <p className="text-2xl font-bold text-teal-600">{campusCount}</p>
                </div>
                <School className="h-8 w-8 text-teal-600" />
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
          <TabsList className="grid w-full grid-cols-8 lg:w-[1600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="campuses">Campuses</TabsTrigger>
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
                                onClick={() => openStudentEditDialog(studentUser)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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

            {/* Edit Student Dialog */}
            <Dialog open={isStudentEditDialogOpen} onOpenChange={setIsStudentEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Student</DialogTitle>
                  <DialogDescription>
                    Update student information below.
                  </DialogDescription>
                </DialogHeader>
                {editingStudent && (
                  <form onSubmit={handleEditStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-id">Student ID</Label>
                        <Input
                          id="edit-student-id"
                          value={editingStudent.details?.studentId || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, studentId: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-firstname">First Name</Label>
                        <Input
                          id="edit-student-firstname"
                          value={editingStudent.details?.firstName || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, firstName: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-lastname">Last Name</Label>
                        <Input
                          id="edit-student-lastname"
                          value={editingStudent.details?.lastName || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, lastName: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-middlename">Middle Name</Label>
                        <Input
                          id="edit-student-middlename"
                          value={editingStudent.details?.middleName || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, middleName: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-course">Course</Label>
                        <Input
                          id="edit-student-course"
                          value={editingStudent.details?.course || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, course: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-department">Department</Label>
                        <Input
                          id="edit-student-department"
                          value={editingStudent.details?.department || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, department: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-host">Host Establishment</Label>
                        <Input
                          id="edit-student-host"
                          value={editingStudent.details?.hostEstablishment || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, hostEstablishment: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-student-contact">Contact Number</Label>
                        <Input
                          id="edit-student-contact"
                          value={editingStudent.details?.contactNumber || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, contactNumber: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="edit-student-address">Address</Label>
                        <Input
                          id="edit-student-address"
                          value={editingStudent.details?.address || ''}
                          onChange={(e) => setEditingStudent({
                            ...editingStudent,
                            details: { ...editingStudent.details, address: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsStudentEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#003366] hover:bg-[#002244]"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
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
                        <TableHead>Campus</TableHead>
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
                                onClick={() => openEditDialog({
                                  _id: deptUser._id,
                                  userId: deptUser._id,
                                  departmentName: deptUser.details?.departmentName || '',
                                  departmentCode: deptUser.details?.departmentCode || '',
                                  location: deptUser.details?.location || '',
                                  contactEmail: deptUser.details?.contactEmail || '',
                                  contactNumber: deptUser.details?.contactNumber || '',
                                  ojtAdvisorName: deptUser.details?.ojtAdvisorName || '',
                                  ojtAdvisorPosition: deptUser.details?.ojtAdvisorPosition || '',
                                  isActive: deptUser.isActive,
                                  isAccepted: deptUser.details?.isAccepted || true,
                                })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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

            {/* Edit Department Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Department</DialogTitle>
                  <DialogDescription>
                    Update department information below.
                  </DialogDescription>
                </DialogHeader>
                {editingDepartment && (
                  <form onSubmit={handleEditDepartment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept-name">Department Name</Label>
                        <Input
                          id="edit-dept-name"
                          value={editingDepartment.departmentName}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, departmentName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept-code">Department Code</Label>
                        <Input
                          id="edit-dept-code"
                          value={editingDepartment.departmentCode}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, departmentCode: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept-location">Campus</Label>
                        <Input
                          id="edit-dept-location"
                          value={editingDepartment.location}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept-contact-email">Contact Email</Label>
                        <Input
                          id="edit-dept-contact-email"
                          type="email"
                          value={editingDepartment.contactEmail}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, contactEmail: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept-contact-number">Contact Number</Label>
                        <Input
                          id="edit-dept-contact-number"
                          value={editingDepartment.contactNumber}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, contactNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept-advisor-name">OJT Advisor Name</Label>
                        <Input
                          id="edit-dept-advisor-name"
                          value={editingDepartment.ojtAdvisorName}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, ojtAdvisorName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="edit-dept-advisor-position">OJT Advisor Position</Label>
                        <Input
                          id="edit-dept-advisor-position"
                          value={editingDepartment.ojtAdvisorPosition}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, ojtAdvisorPosition: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#003366] hover:bg-[#002244]"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      <Label htmlFor="course-campus">Campus *</Label>
                      <Select
                        value={newCourse.campusId}
                        onValueChange={(value) => setNewCourse({ ...newCourse, campusId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {campuses.length === 0 ? (
                            <SelectItem value="_none_" disabled>
                              No campuses available
                            </SelectItem>
                          ) : (
                            campuses.map((campus) => (
                              <SelectItem key={campus._id} value={campus._id}>
                                {campus.campusName} ({campus.campusCode})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
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
                        <TableHead>Campus</TableHead>
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
                          <TableCell>{course.campusName || 'Unknown'}</TableCell>
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

          <TabsContent value="campuses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Campus</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampus} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campus-name">Campus Name</Label>
                      <Input
                        id="campus-name"
                        placeholder="e.g., Main Campus"
                        value={newCampus.campusName}
                        onChange={(e) => setNewCampus({ ...newCampus, campusName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus-code">Campus Code</Label>
                      <Input
                        id="campus-code"
                        placeholder="e.g., MC"
                        value={newCampus.campusCode}
                        onChange={(e) => setNewCampus({ ...newCampus, campusCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus-location">Location</Label>
                      <Input
                        id="campus-location"
                        placeholder="e.g., Sogod, Southern Leyte"
                        value={newCampus.location}
                        onChange={(e) => setNewCampus({ ...newCampus, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="campus-address">Address</Label>
                      <Input
                        id="campus-address"
                        placeholder="e.g., Building A, Main Street"
                        value={newCampus.address}
                        onChange={(e) => setNewCampus({ ...newCampus, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus-contact-email">Contact Email</Label>
                      <Input
                        id="campus-contact-email"
                        type="email"
                        placeholder="e.g., campus@slsu.edu.ph"
                        value={newCampus.contactEmail}
                        onChange={(e) => setNewCampus({ ...newCampus, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus-contact-number">Contact Number</Label>
                      <Input
                        id="campus-contact-number"
                        placeholder="e.g., +63 123 456 7890"
                        value={newCampus.contactNumber}
                        onChange={(e) => setNewCampus({ ...newCampus, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003366] hover:bg-[#002244]"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Campus'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Campuses</CardTitle>
              </CardHeader>
              <CardContent>
                {campuses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No campuses created yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campus Code</TableHead>
                        <TableHead>Campus Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campuses.map((campus) => (
                        <TableRow key={campus._id}>
                          <TableCell>{campus.campusCode}</TableCell>
                          <TableCell>{campus.campusName}</TableCell>
                          <TableCell>{campus.location}</TableCell>
                          <TableCell>
                            <Badge variant={campus.isActive ? "default" : "secondary"}>
                              {campus.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCampusEditDialog(campus)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleCampusStatus(campus._id, campus.isActive)}
                              >
                                {campus.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCampus(campus._id)}
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

            {/* Edit Campus Dialog */}
            <Dialog open={isCampusEditDialogOpen} onOpenChange={setIsCampusEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Campus</DialogTitle>
                  <DialogDescription>
                    Update campus information below.
                  </DialogDescription>
                </DialogHeader>
                {editingCampus && (
                  <form onSubmit={handleEditCampus} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-campus-name">Campus Name</Label>
                        <Input
                          id="edit-campus-name"
                          value={editingCampus.campusName}
                          onChange={(e) => setEditingCampus({ ...editingCampus, campusName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-campus-code">Campus Code</Label>
                        <Input
                          id="edit-campus-code"
                          value={editingCampus.campusCode}
                          onChange={(e) => setEditingCampus({ ...editingCampus, campusCode: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-campus-location">Location</Label>
                        <Input
                          id="edit-campus-location"
                          value={editingCampus.location}
                          onChange={(e) => setEditingCampus({ ...editingCampus, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="edit-campus-address">Address</Label>
                        <Input
                          id="edit-campus-address"
                          value={editingCampus.address || ''}
                          onChange={(e) => setEditingCampus({ ...editingCampus, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-campus-email">Contact Email</Label>
                        <Input
                          id="edit-campus-email"
                          type="email"
                          value={editingCampus.contactEmail || ''}
                          onChange={(e) => setEditingCampus({ ...editingCampus, contactEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-campus-number">Contact Number</Label>
                        <Input
                          id="edit-campus-number"
                          value={editingCampus.contactNumber || ''}
                          onChange={(e) => setEditingCampus({ ...editingCampus, contactNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCampusEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#003366] hover:bg-[#002244]"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {/* Pending Departments */}
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
                  <CardTitle>Create New Admin Account</CardTitle>
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
                            <SelectItem value="superadmin">Super Admin</SelectItem>
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
                                    onClick={() => openAdminEditDialog(adminUser)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
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

            {/* Edit Admin Dialog */}
            <Dialog open={isAdminEditDialogOpen} onOpenChange={setIsAdminEditDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Admin</DialogTitle>
                  <DialogDescription>
                    Update administrator information below.
                  </DialogDescription>
                </DialogHeader>
                {editingAdmin && (
                  <form onSubmit={handleEditAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-admin-email">Email</Label>
                      <Input
                        id="edit-admin-email"
                        type="email"
                        value={editingAdmin.email}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAdminEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#003366] hover:bg-[#002244]"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
