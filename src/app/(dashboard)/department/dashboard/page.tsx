'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, FileText, Bell, LogOut, UserCheck, UserX, CheckCircle, Clock, Shield, Trash2, Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/Logo';

// Add custom styles for better visibility
const customStyles = `
  .btn-visible-outline {
    border: 2px solid #003366 !important;
    outline: 2px solid #003366 !important;
    outline-offset: 2px !important;
  }
  
  .btn-visible-outline:hover {
    border-color: #002244 !important;
    outline-color: #002244 !important;
    background-color: #f0f4f8 !important;
  }
  
  .btn-visible-outline:focus {
    border-color: #003366 !important;
    outline-color: #003366 !important;
    box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.3) !important;
  }
  
  .table-visible-outline {
    border: 2px solid #e2e8f0 !important;
    outline: 1px solid #cbd5e1 !important;
  }
  
  .table-visible-outline th {
    border: 1px solid #cbd5e1 !important;
    background-color: #f8fafc !important;
    font-weight: 600 !important;
  }
  
  .table-visible-outline td {
    border: 1px solid #e2e8f0 !important;
  }
  
  .table-visible-outline tr:hover {
    background-color: #f1f5f9 !important;
  }
  
  .image-btn {
    border: 2px solid #3b82f6 !important;
    outline: 1px solid #2563eb !important;
    color: #1e40af !important;
    font-weight: 500 !important;
    padding: 6px 12px !important;
    font-size: 0.875rem !important;
  }
  
  .image-btn:hover {
    border-color: #2563eb !important;
    background-color: #eff6ff !important;
    color: #1e40af !important;
  }
  
  .image-btn:focus {
    border-color: #1e40af !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
  }
`;

// Inject styles into the document
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

interface DepartmentData {
  _id: string;
  departmentName: string;
  departmentCode: string;
  location: string;
  contactEmail: string;
  contactNumber?: string;
  ojtAdvisorName: string;
  ojtAdvisorPosition: string;
}

interface UserData {
  id: string;
  email: string;
  accountType: string;
  details: DepartmentData;
}

interface Student {
  _id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  course: string;
  department: string;
  location: string;
  hostEstablishment: string;
  contactNumber?: string;
  address?: string;
  shiftType: 'regular' | 'regular-split' | 'graveyard' | 'custom' | 'morning' | 'afternoon' | '1shift' | '2shift';
  isAccepted: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ScheduleRequest {
  _id: string;
  studentId: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  currentShiftType: string;
  requestedShiftType: string;
  requestedShiftConfig: {
    description?: string;
    eveningStart?: string;
    eveningEnd?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  isForAll: boolean;
  isActive: boolean;
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: string;
  date: string;
  morningIn?: string;
  morningOut?: string;
  afternoonIn?: string;
  afternoonOut?: string;
  eveningIn?: string;
  eveningOut?: string;
  morningInImage?: string;
  morningOutImage?: string;
  afternoonInImage?: string;
  afternoonOutImage?: string;
  eveningInImage?: string;
  eveningOutImage?: string;
  totalHours: number;
  shiftType: 'regular' | 'regular-split' | 'graveyard' | 'custom' | 'morning' | 'afternoon' | '1shift' | '2shift';
}

export default function DepartmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'attendance'>('list');
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    email: '',
    department: '',
    contactNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.accountType !== 'department') {
        router.push('/login');
        return;
      }
      setUser(userData);
      fetchStudents(userData.details.departmentName);
      fetchAnnouncements(userData.id);
      fetchSupervisors(userData.details._id);
      fetchScheduleRequests(userData.details._id);
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

  const fetchStudents = async (departmentName: string) => {
    try {
      const response = await fetch(`/api/users?accountType=student&department=${departmentName}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.users.map((u: any) => u.details) || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAnnouncements = async (userId: string) => {
    try {
      const response = await fetch(`/api/announcements?postedBy=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchScheduleRequests = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/schedule-requests?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setScheduleRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching schedule requests:', error);
    }
  };

  // Helper functions to determine which columns to show based on shift type
  const shouldShowMorningColumns = (shiftType: string) => {
    return ['regular', 'morning', '1shift', '2shift'].includes(shiftType);
  };

  const shouldShowAfternoonColumns = (shiftType: string) => {
    return ['regular', 'afternoon', '1shift', '2shift'].includes(shiftType);
  };

  const shouldShowEveningColumns = (shiftType: string) => {
    return ['graveyard'].includes(shiftType);
  };

  const getShiftTypeDisplay = (shiftType: string) => {
    const shiftMap: { [key: string]: string } = {
      'regular': 'Regular',
      'regular-split': 'Regular Split',
      'morning': 'Morning Only',
      'afternoon': 'Afternoon Only', 
      '1shift': 'Single Shift',
      '2shift': 'Two Shifts',
      'graveyard': 'Graveyard',
      'custom': 'Custom'
    };
    return shiftMap[shiftType] || shiftType;
  };

  const getEffectiveShiftType = (record: any) => {
    // Try to get shift type from multiple sources
    return record.studentId?.shiftType || 
           record.shiftType || 
           'regular'; // fallback
  };

  const handleViewStudentAttendance = (student: Student) => {
    setSelectedStudentData(student);
    setSelectedStudent(student._id);
    setViewMode('attendance');
    fetchAttendance(student._id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStudentData(null);
    setSelectedStudent('');
    setAttendanceRecords([]);
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const studentId = student.studentId.toLowerCase();
    
    return fullName.includes(searchLower) || studentId.includes(searchLower);
  });

  const fetchAttendance = async (studentId?: string) => {
    try {
      let url = '/api/attendance?';
      if (studentId) {
        url += `studentId=${studentId}&`;
      }
      // Get current month
      const now = new Date();
      url += `month=${now.getMonth() + 1}&year=${now.getFullYear()}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAcceptStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          action: 'accept',
          ojtAdvisorId: user?.details._id,
        }),
      });

      if (response.ok) {
        toast.success('Student accepted successfully');
        if (user) {
          fetchStudents(user.details.departmentName);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to accept student');
      }
    } catch (error) {
      console.error('Error accepting student:', error);
      toast.error('An error occurred');
    }
  };

  const handleReviewScheduleRequest = async (requestId: string, status: 'approved' | 'rejected', comments?: string) => {
    try {
      const response = await fetch('/api/schedule-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status,
          comments,
          reviewedBy: user?.id,
        }),
      });

      if (response.ok) {
        toast.success(`Schedule request ${status}`);
        if (user) {
          fetchScheduleRequests(user.details._id);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to review request');
      }
    } catch (error) {
      console.error('Error reviewing schedule request:', error);
      toast.error('An error occurred');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          department: user.details._id,
          postedBy: user.id,
          isForAll: false,
        }),
      });

      if (response.ok) {
        toast.success('Announcement created successfully');
        setNewAnnouncement({ title: '', content: '' });
        fetchAnnouncements(user.id);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSupervisors = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/supervisors?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setSupervisors(data.supervisors || []);
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
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

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSupervisor,
          departmentId: user.details._id,
        }),
      });

      if (response.ok) {
        toast.success('OJT Supervisor account created successfully');
        setNewSupervisor({ name: '', email: '', department: '', contactNumber: '' });
        fetchSupervisors(user.details._id);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create supervisor');
      }
    } catch (error) {
      console.error('Error creating supervisor:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupervisor = async (supervisorId: string) => {
    if (!confirm('Are you sure you want to delete this supervisor account?')) return;

    try {
      const response = await fetch(`/api/supervisors?id=${supervisorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Supervisor account deleted successfully');
        if (user) {
          fetchSupervisors(user.details._id);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete supervisor');
      }
    } catch (error) {
      console.error('Error deleting supervisor:', error);
      toast.error('An error occurred');
    }
  };

  const pendingStudents = students.filter((s: Student) => !s.isAccepted);
  const activeStudents = students.filter((s: Student) => s.isAccepted);
  const pendingRequests = scheduleRequests.filter((r: ScheduleRequest) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Logo size="small" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold">SLSU OJT Tracking</h1>
                <p className="text-xs text-blue-200">Department Dashboard</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#003366] text-white text-xl">
                {user.details.departmentCode.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.details.departmentName}</h2>
              <p className="text-gray-600">{user.details.ojtAdvisorName} - {user.details.ojtAdvisorPosition}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active Students</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{activeStudents.length}</p>
                </div>
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending Approval</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingStudents.length}</p>
                </div>
                <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Announcements</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{announcements.length}</p>
                </div>
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 lg:gap-2">
            <TabsTrigger value="students" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <UserX className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Pending</span>
              {pendingStudents.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{pendingStudents.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule-requests" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Schedule</span>
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Announce</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                {activeStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active students in your department.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Host Establishment</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeStudents.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>
                            {student.firstName} {student.middleName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>{student.hostEstablishment}</TableCell>
                          <TableCell>{student.contactNumber || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student Attendance Records</span>
                  {viewMode === 'attendance' && selectedStudentData && (
                    <Button 
                      variant="outline" 
                      onClick={handleBackToList}
                      className="flex items-center btn-visible-outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Back to Student List
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === 'list' ? (
                  // Student List View
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Select a student to view their detailed attendance records.
                    </div>
                    
                    {/* Search Bar */}
                    <div className="mb-4">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search students by name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-7 0 0 0-11 7m11 7v4a7 7 0 0011-7h-4a7 7 0 00-7 7v-4a7 7 0 00-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Search Results Count */}
                    {searchTerm && (
                      <div className="mb-4 text-sm text-gray-600">
                        Found {filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'} matching "{searchTerm}"
                      </div>
                    )}
                    
                    <div className="grid gap-4">
                      {filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 col-span-full">
                          {searchTerm ? `No students found matching "${searchTerm}"` : 'No active students found.'}
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {filteredStudents.map((student) => (
                            <Card key={student._id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback>
                                      {student.firstName?.[0]}{student.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">
                                      {student.firstName} {student.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {student.studentId}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge variant="outline">
                                        {getShiftTypeDisplay(student.shiftType || 'regular')}
                                      </Badge>
                                      <Badge 
                                        variant={(student as any).status === 'active' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {(student as any).status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Course:</span> {student.course}
                                    </div>
                                    <div>
                                      <span className="font-medium">Contact:</span> {student.contactNumber || 'N/A'}
                                    </div>
                                    <div className="col-span-2">
                                      <span className="font-medium">Host Establishment:</span> {student.hostEstablishment}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button 
                                    onClick={() => handleViewStudentAttendance(student)}
                                    className="bg-[#003366] hover:bg-[#002244] btn-visible-outline"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Attendance
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Individual Student Attendance View
                  <div className="space-y-4">
                    {selectedStudentData && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {selectedStudentData.firstName?.[0]}{selectedStudentData.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {selectedStudentData.firstName} {selectedStudentData.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedStudentData.studentId} • {getShiftTypeDisplay(selectedStudentData.shiftType || 'regular')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {attendanceRecords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No attendance records found for this student.
                      </div>
                    ) : (
                      <Table className="table-visible-outline">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            {shouldShowMorningColumns(selectedStudentData?.shiftType || 'regular') && <TableHead>Morning In</TableHead>}
                            {shouldShowMorningColumns(selectedStudentData?.shiftType || 'regular') && <TableHead>Morning Out</TableHead>}
                            {shouldShowAfternoonColumns(selectedStudentData?.shiftType || 'regular') && <TableHead>Afternoon In</TableHead>}
                            {shouldShowAfternoonColumns(selectedStudentData?.shiftType || 'regular') && <TableHead>Afternoon Out</TableHead>}
                            {shouldShowEveningColumns(selectedStudentData?.shiftType || 'regular') && <TableHead>Evening In</TableHead>}
                            {shouldShowEveningColumns(selectedStudentData?.shiftType || 'regular') && <TableHead>Evening Out</TableHead>}
                            <TableHead>Total Hours</TableHead>
                            <TableHead>Images</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.map((record) => {
                            const studentShiftType = getEffectiveShiftType(record);
                            return (
                            <TableRow key={record._id}>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              {shouldShowMorningColumns(studentShiftType) && (
                                <TableCell>
                                  {record.morningIn ? new Date(record.morningIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </TableCell>
                              )}
                              {shouldShowMorningColumns(studentShiftType) && (
                                <TableCell>
                                  {record.morningOut ? new Date(record.morningOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </TableCell>
                              )}
                              {shouldShowAfternoonColumns(studentShiftType) && (
                                <TableCell>
                                  {record.afternoonIn ? new Date(record.afternoonIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </TableCell>
                              )}
                              {shouldShowAfternoonColumns(studentShiftType) && (
                                <TableCell>
                                  {record.afternoonOut ? new Date(record.afternoonOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </TableCell>
                              )}
                              {shouldShowEveningColumns(studentShiftType) && (
                                <TableCell>
                                  {record.eveningIn ? new Date(record.eveningIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </TableCell>
                              )}
                              {shouldShowEveningColumns(studentShiftType) && (
                                <TableCell>
                                  {record.eveningOut ? new Date(record.eveningOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </TableCell>
                              )}
                              <TableCell>{record.totalHours?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {shouldShowMorningColumns(studentShiftType) && record.morningInImage && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="image-btn">
                                          VIEW IMAGE<br/>MORNING IN
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogTitle>Morning Clock In Image</DialogTitle>
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {(record.studentId as any)?.firstName} {(record.studentId as any)?.lastName || ''} - {record.morningIn ? new Date(record.morningIn).toLocaleString() : 'N/A'}
                                          </p>
                                          <img 
                                            src={record.morningInImage} 
                                            alt="Morning In" 
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {shouldShowMorningColumns(studentShiftType) && record.morningOutImage && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="image-btn">
                                          VIEW IMAGE<br/>MORNING OUT
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogTitle>Morning Clock Out Image</DialogTitle>
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {(record.studentId as any)?.firstName} {(record.studentId as any)?.lastName || ''} - {record.morningOut ? new Date(record.morningOut).toLocaleString() : 'N/A'}
                                          </p>
                                          <img 
                                            src={record.morningOutImage} 
                                            alt="Morning Out" 
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {shouldShowAfternoonColumns(studentShiftType) && record.afternoonInImage && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="image-btn">
                                          VIEW IMAGE<br/>AFTERNOON IN
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogTitle>Afternoon Clock In Image</DialogTitle>
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {(record.studentId as any)?.firstName} {(record.studentId as any)?.lastName || ''} - {record.afternoonIn ? new Date(record.afternoonIn).toLocaleString() : 'N/A'}
                                          </p>
                                          <img 
                                            src={record.afternoonInImage} 
                                            alt="Afternoon In" 
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {shouldShowAfternoonColumns(studentShiftType) && record.afternoonOutImage && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="image-btn">
                                          VIEW IMAGE<br/>AFTERNOON OUT
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogTitle>Afternoon Clock Out Image</DialogTitle>
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {(record.studentId as any)?.firstName} {(record.studentId as any)?.lastName || ''} - {record.afternoonOut ? new Date(record.afternoonOut).toLocaleString() : 'N/A'}
                                          </p>
                                          <img 
                                            src={record.afternoonOutImage} 
                                            alt="Afternoon Out" 
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {shouldShowEveningColumns(studentShiftType) && record.eveningInImage && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="image-btn">
                                          VIEW IMAGE<br/>EVENING IN
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogTitle>Evening Clock In Image</DialogTitle>
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {(record.studentId as any)?.firstName} {(record.studentId as any)?.lastName || ''} - {record.eveningIn ? new Date(record.eveningIn).toLocaleString() : 'N/A'}
                                          </p>
                                          <img 
                                            src={record.eveningInImage} 
                                            alt="Evening In" 
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {shouldShowEveningColumns(studentShiftType) && record.eveningOutImage && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="image-btn">
                                          VIEW IMAGE<br/>EVENING OUT
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogTitle>Evening Clock Out Image</DialogTitle>
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {(record.studentId as any)?.firstName} {(record.studentId as any)?.lastName || ''} - {record.eveningOut ? new Date(record.eveningOut).toLocaleString() : 'N/A'}
                                          </p>
                                          <img 
                                            src={record.eveningOutImage} 
                                            alt="Evening Out" 
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Student Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending student registrations.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingStudents.map((student) => (
                      <Card key={student._id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {student.firstName} {student.middleName} {student.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                ID: {student.studentId} | Course: {student.course}
                              </p>
                              <p className="text-sm text-gray-500">
                                Host: {student.hostEstablishment} | Location: {student.location}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleAcceptStudent(student._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Change Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No schedule change requests.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduleRequests.map((request) => (
                      <Card key={request._id} className={`border-l-4 ${request.status === 'pending' ? 'border-l-yellow-500' : request.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {request.studentId.firstName} {request.studentId.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                ID: {request.studentId.studentId}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                From: <Badge variant="outline">{request.currentShiftType}</Badge>
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                To: <Badge variant="outline">{request.requestedShiftConfig?.description || request.requestedShiftType}</Badge>
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Reason: {request.reason}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Requested: {new Date(request.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                            {request.status === 'pending' ? (
                              <div className="flex space-x-2 mt-4 md:mt-0">
                                <Button
                                  onClick={() => handleReviewScheduleRequest(request._id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReviewScheduleRequest(request._id, 'rejected')}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Badge className={request.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}>
                                {request.status === 'approved' ? 'Approved' : 'Rejected'}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Announcement</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      placeholder="Enter announcement content"
                      rows={4}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003366] hover:bg-[#002244]"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Announcement'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No announcements posted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <Card key={announcement._id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <p className="text-gray-700 mt-2">{announcement.content}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
