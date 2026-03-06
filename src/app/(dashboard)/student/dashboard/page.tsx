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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      <div className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">SLSU OJT Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.details?.firstName} {user.details?.lastName}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.details?.firstName || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your OJT tracking today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTime.toLocaleTimeString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentTime.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant="outline">Available</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to clock in/out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shift Type</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.details?.shiftType || 'Regular'}
              </div>
              <p className="text-xs text-muted-foreground">
                Your current schedule
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('dtr')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dtr'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daily Time Record
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schedule Change
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClockInOut 
                studentId={user._id}
                shiftType={user.details?.shiftType || 'regular'}
                isAccepted={true}
              />
              <ScheduleChangeRequest 
                studentId={user._id}
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
