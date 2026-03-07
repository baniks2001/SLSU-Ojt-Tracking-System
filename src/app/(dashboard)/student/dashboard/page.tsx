'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import ClockInOut from '@/components/ClockInOut';
import ScheduleChangeRequest from '@/components/ScheduleChangeRequest';
import DTRTemplate from '@/components/DTRTemplate';
import Link from 'next/link';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dtr' | 'schedule'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [courseData, setCourseData] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    completedHours: 0,
    targetHours: 500,
    completionRate: 0,
    estimatedCompletion: null as Date | null,
    remainingHours: 500
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCourseData(parsedUser.details?.courseId);
      fetchAttendanceStats(parsedUser._id);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCourseData = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.course) {
          setCourseData(data.course);
          setAttendanceStats(prev => ({ ...prev, targetHours: data.course.totalHours || 500 }));
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const fetchAttendanceStats = async (studentId: string) => {
    try {
      const response = await fetch(`/api/attendance?studentId=${studentId}&stats=true`);
      if (response.ok) {
        const data = await response.json();
        const completedHours = data.totalHours || 0;
        const targetHours = courseData?.totalHours || 500;
        const completionRate = targetHours > 0 ? (completedHours / targetHours) * 100 : 0;
        
        // Calculate estimated completion date
        let estimatedCompletion = null;
        if (completedHours > 0 && completionRate < 100) {
          const avgHoursPerDay = completedHours / Math.max(1, data.daysWorked || 1);
          const remainingHours = targetHours - completedHours;
          const daysNeeded = Math.ceil(remainingHours / avgHoursPerDay);
          estimatedCompletion = new Date();
          estimatedCompletion.setDate(estimatedCompletion.getDate() + daysNeeded);
        }
        
        setAttendanceStats({
          completedHours,
          targetHours,
          completionRate,
          estimatedCompletion,
          remainingHours: targetHours - completedHours
        });
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header without Header component */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-900">SLSU OJT Tracking</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.details?.firstName} {user.details?.lastName}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            Welcome back, {user.details?.firstName || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Here's what's happening with your OJT tracking today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-blue-200 bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Current Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-900">
                {currentTime.toLocaleTimeString()}
              </div>
              <p className="text-xs text-gray-600">
                {currentTime.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Today's Status</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                <Badge variant="outline" className="border-green-600 text-green-600">Available</Badge>
              </div>
              <p className="text-xs text-gray-600">
                Ready to clock in/out
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">OJT Progress</CardTitle>
              <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-green-900">
                  {attendanceStats.completedHours.toFixed(1)} / {attendanceStats.targetHours}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(attendanceStats.completionRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {attendanceStats.completionRate.toFixed(1)}% Complete
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Est. Completion</CardTitle>
              <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📅</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-purple-900">
                  {attendanceStats.estimatedCompletion ? 
                    attendanceStats.estimatedCompletion.toLocaleDateString() : 
                    'TBD'
                  }
                </div>
                <p className="text-xs text-gray-600">
                  {attendanceStats.remainingHours > 0 ? 
                    `${attendanceStats.remainingHours.toFixed(1)} hours remaining` : 
                    'Completed!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-blue-200 mb-6">
          <nav className="flex flex-wrap -mb-px gap-1 sm:gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 sm:py-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>Overview</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('dtr')}
              className={`py-3 px-3 sm:py-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === 'dtr'
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>Daily Time Record</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-3 px-3 sm:py-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>Schedule Change</span>
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClockInOut 
                studentId={user.details?.studentId || user._id}
                shiftType={user.details?.shiftType || 'regular'}
                isAccepted={true}
              />
              <ScheduleChangeRequest 
                studentId={user.details?.studentId || user._id}
                currentShiftType={user.details?.shiftType || 'regular'}
              />
            </div>
          )}

          {activeTab === 'dtr' && (
            <DTRTemplate student={user} />
          )}

          {activeTab === 'schedule' && (
            <ScheduleChangeRequest 
              studentId={user._id}
              currentShiftType={user.details?.shiftType || 'regular'}
            />
          )}
        </div>
      </main>
    </div>
  );
}
