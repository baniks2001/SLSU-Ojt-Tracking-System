'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Clock, User, FileText, Bell, LogOut, Camera } from 'lucide-react';
import ClockInOut from '@/components/ClockInOut';
import ProfileForm from '@/components/ProfileForm';
import AttendanceLogs from '@/components/AttendanceLogs';
import DTRTemplate from '@/components/DTRTemplate';
import Announcements from '@/components/Announcements';
import ScheduleChangeRequest from '@/components/ScheduleChangeRequest';

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
  shiftType: 'regular' | 'graveyard' | 'custom';
  shiftConfig?: {
    morningStart?: string;
    morningEnd?: string;
    afternoonStart?: string;
    afternoonEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    description?: string;
  };
  isAccepted: boolean;
  isActive: boolean;
}

interface UserData {
  _id: string;
  email: string;
  accountType: string;
  details: StudentData;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clock');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.accountType !== 'student') {
        router.push('/login');
        return;
      }
      setUser(userData);
    } catch (error) {
      router.push('/login');
      return;
    }

    setIsLoading(false);

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const student = user.details;
  const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold">SLSU OJT Tracking System</h1>
                <p className="text-xs text-blue-200">Southern Leyte State University</p>
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
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {fullName}</h2>
              <p className="text-gray-600">Student ID: {student.studentId}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={student.isAccepted ? "default" : "secondary"}>
                  {student.isAccepted ? "Active" : "Pending Approval"}
                </Badge>
                <Badge variant="outline">{student.course}</Badge>
                <Badge variant="outline">{student.shiftType === 'graveyard' ? 'Graveyard Shift' : 'Regular Shift'}</Badge>
              </div>
            </div>
          </div>
        </div>

        {!student.isAccepted && (
          <Card className="mb-6 border-yellow-400 bg-yellow-50">
            <CardContent className="py-4">
              <p className="text-yellow-800">
                <strong>Pending Approval:</strong> Your account is awaiting approval from your OJT Advisor. Some features may be limited until approved.
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-[700px]">
            <TabsTrigger value="clock" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Clock In/Out</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance Logs</span>
            </TabsTrigger>
            <TabsTrigger value="dtr" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">DTR</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Request</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Announcements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clock" className="space-y-4">
            <ClockInOut 
              studentId={student._id} 
              shiftType={student.shiftType} 
              shiftConfig={student.shiftConfig}
              isAccepted={student.isAccepted} 
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileForm student={student} userEmail={user.email} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <AttendanceLogs studentId={student._id} />
          </TabsContent>

          <TabsContent value="dtr" className="space-y-4">
            <DTRTemplate student={student} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <ScheduleChangeRequest 
              studentId={student._id}
              currentShiftType={student.shiftType}
              departmentId={student.department}
            />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Announcements studentId={student._id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
