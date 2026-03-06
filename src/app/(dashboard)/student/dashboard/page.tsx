'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, User, FileText, Bell, Camera, Code, Users, Calendar, Target, Award, TrendingUp } from 'lucide-react';
import ClockInOut from '@/components/ClockInOut';
import ProfileForm from '@/components/ProfileForm';
import AttendanceLogs from '@/components/AttendanceLogs';
import DTRTemplate from '@/components/DTRTemplate';
import Announcements from '@/components/Announcements';
import ScheduleChangeRequest from '@/components/ScheduleChangeRequest';
import Header from '@/components/Header';
import DashboardLayout, { QuickStats, RecentActivities, QuickActions, UserProfileCard } from '@/components/DashboardLayout';

interface StudentData {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  course: string;
  department: string;
  hostEstablishment: string;
  contactNumber?: string;
  address?: string;
  shiftType?: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  morningIn?: string;
  morningOut?: string;
  afternoonIn?: string;
  afternoonOut?: string;
  eveningIn?: string;
  eveningOut?: string;
  totalHours?: number;
  shiftType: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStudentData(parsedUser._id);
      fetchAttendanceRecords(parsedUser._id);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchStudentData = async (userId: string) => {
    try {
      const response = await fetch(`/api/students?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentData(data.student);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to fetch student data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async (userId: string) => {
    try {
      const response = await fetch(`/api/attendance?studentId=${userId}&month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const calculateTotalHours = () => {
    return attendanceRecords.reduce((total, record) => total + (record.totalHours || 0), 0).toFixed(1);
  };

  const calculateAttendanceRate = () => {
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.totalHours && record.totalHours > 0).length;
    return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  };

  const getRecentAttendance = () => {
    return attendanceRecords.slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} title="Student Dashboard" />
      
      <DashboardLayout 
        title="Student Dashboard" 
        subtitle="Welcome back! Here's your attendance overview"
        user={user}
      >
        {/* Quick Stats */}
        <QuickStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clock In/Out Section */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <Badge className="bg-primary-100 text-primary-800">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>
                <ClockInOut 
                  studentId={user?._id} 
                  shiftType={(studentData?.shiftType as any) || 'regular'} 
                  isAccepted={true}
                />
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 font-medium transition-all duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="attendance" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 font-medium transition-all duration-200"
                >
                  Attendance
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 font-medium transition-all duration-200"
                >
                  Schedule
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 font-medium transition-all duration-200"
                >
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RecentActivities />
                  <QuickActions />
                </div>
                
                <Announcements studentId={user?._id} />
              </TabsContent>

              <TabsContent value="attendance" className="space-y-6">
                <AttendanceLogs studentId={user?._id} />
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <ScheduleChangeRequest 
                  studentId={user?._id} 
                  currentShiftType={(studentData?.shiftType as any) || 'regular'} 
                />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <DTRTemplate student={studentData ? {
                ...studentData,
                shiftType: (studentData.shiftType as any) || 'regular'
              } : {
                _id: '',
                studentId: '',
                firstName: '',
                lastName: '',
                course: '',
                department: '',
                hostEstablishment: '',
                shiftType: 'regular'
              }} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Profile & Info */}
          <div className="space-y-6">
            <UserProfileCard user={user} />
            
            {/* Performance Card */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-success-600" />
                      <span className="text-sm text-gray-600">Monthly Progress</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">On Track</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-primary-600" />
                      <span className="text-sm text-gray-600">Achievements</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">12 Badges</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-warning-600" />
                      <span className="text-sm text-gray-600">Goals</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">8/10 Complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
                <div className="space-y-3">
                  {getRecentAttendance().map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{record.shiftType} shift</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {record.totalHours ? `${record.totalHours}h` : 'Incomplete'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.totalHours ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
