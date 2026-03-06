'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Clock, User, FileText, Bell, Camera, Code, Users } from 'lucide-react';
import ClockInOut from '@/components/ClockInOut';
import ProfileForm from '@/components/ProfileForm';
import AttendanceLogs from '@/components/AttendanceLogs';
import DTRTemplate from '@/components/DTRTemplate';
import Announcements from '@/components/Announcements';
import ScheduleChangeRequest from '@/components/ScheduleChangeRequest';
import Header from '@/components/Header';

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
  shiftType: 'regular' | 'graveyard' | 'custom' | 'morning' | 'afternoon' | 'evening' | 'midnight' | '1shift' | '2shift';
  shiftConfig?: {
    morningStart?: string;
    morningEnd?: string;
    afternoonStart?: string;
    afternoonEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    description?: string;
    shiftCount?: number;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header 
        user={user} 
        title="Student Dashboard"
        showBackButton={false}
      />
      
      {/* Main Content */}
      <main className="container-responsive py-8">
        {/* Welcome Section */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg card-responsive-lg">
          <CardContent className="p-responsive">
            <div className="flex-responsive">
              <Avatar className="avatar-responsive ring-4 ring-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-responsive-lg font-bold text-slate-800 mb-1">
                  Welcome back, <span className="text-blue-600">{student.firstName}</span>!
                </h2>
                <p className="text-responsive-sm text-slate-600 mb-2">{student.course} • {student.department}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 badge-responsive">
                    <Users className="icon-responsive-sm mr-1" />
                    {student.studentId}
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 badge-responsive">
                    {student.shiftType}
                  </Badge>
                  {student.isAccepted && (
                    <Badge className="bg-green-500 text-white badge-responsive">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {!student.isAccepted && (
          <Card className="mb-6 border-yellow-400 bg-yellow-50 card-responsive">
            <CardContent className="py-4 px-responsive">
              <p className="text-yellow-800 text-responsive-sm">
                <strong>Pending Approval:</strong> Your account is awaiting approval from your OJT Advisor. Some features may be limited until approved.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2">
            <TabsTrigger value="clock" className="flex items-center justify-center space-x-1 sm:space-x-2 text-responsive-xs">
              <Clock className="icon-responsive-sm" />
              <span className="hide-mobile">Clock</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center space-x-1 sm:space-x-2 text-responsive-xs">
              <User className="icon-responsive-sm" />
              <span className="hide-mobile">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center justify-center space-x-1 sm:space-x-2 text-responsive-xs">
              <FileText className="icon-responsive-sm" />
              <span className="hide-mobile">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="dtr" className="flex items-center justify-center space-x-1 sm:space-x-2 text-responsive-xs">
              <Camera className="icon-responsive-sm" />
              <span className="hide-mobile">DTR</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center justify-center space-x-1 sm:space-x-2 text-responsive-xs">
              <Clock className="icon-responsive-sm" />
              <span className="hide-mobile">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center justify-center space-x-1 sm:space-x-2 text-responsive-xs">
              <Bell className="icon-responsive-sm" />
              <span className="hide-mobile">Announce</span>
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
