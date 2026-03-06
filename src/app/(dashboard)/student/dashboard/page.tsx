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
import Logo from '@/components/Logo';

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
      // Move setUser outside of useEffect to avoid setState in effect
      setTimeout(() => setUser(userData), 0);
    } catch {
      router.push('/login');
      return;
    }
  }, [router, setUser]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 0);
  }, []);

  // Update current time every second
  const timeInterval = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  useEffect(() => {
    return () => clearInterval(timeInterval);
  }, [router, timeInterval]);

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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Logo size="small" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold">SLSU OJT Tracking</h1>
                <p className="text-xs text-blue-200">Southern Leyte State University</p>
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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarFallback className="bg-[#003366] text-white text-lg sm:text-xl">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {fullName}</h2>
              <p className="text-sm sm:text-base text-gray-600">Student ID: {student.studentId}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1">
                <Badge variant={student.isAccepted ? "default" : "secondary"} className="text-xs">
                  {student.isAccepted ? "Active" : "Pending Approval"}
                </Badge>
                <Badge variant="outline" className="text-xs">{student.course}</Badge>
                <Badge variant="outline" className="text-xs">{student.shiftType === 'graveyard' ? 'Graveyard Shift' : 'Regular Shift'}</Badge>
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2">
            <TabsTrigger value="clock" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Clock</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="dtr" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">DTR</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Announce</span>
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
