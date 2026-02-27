'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, FileText, Bell, LogOut, UserCheck, UserX, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  shiftType: 'regular' | 'graveyard';
  isAccepted: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  isForAll: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function DepartmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
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

  const pendingStudents = students.filter(s => !s.isAccepted);
  const activeStudents = students.filter(s => s.isAccepted);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold">SLSU OJT Tracking System</h1>
                <p className="text-xs text-blue-200">Department Dashboard</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#003366]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-green-600">{activeStudents.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingStudents.length}</p>
                </div>
                <UserX className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Announcements</p>
                  <p className="text-2xl font-bold text-blue-600">{announcements.length}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Student Management</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <UserX className="h-4 w-4" />
              <span className="hidden sm:inline">Pending Approvals</span>
              {pendingStudents.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingStudents.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Announcements</span>
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
