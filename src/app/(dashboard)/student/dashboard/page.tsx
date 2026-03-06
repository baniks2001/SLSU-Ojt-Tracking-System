'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Clock, User, FileText, Bell, Calendar, Target, Award, TrendingUp } from 'lucide-react';
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
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.accountType !== 'student') {
      router.push('/login');
      return;
    }

    fetchStudentData();
    fetchAttendance();
  }, [router]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
      } else {
        console.error('Failed to fetch student data');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="loading loading-lg"></div>
          <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !studentData) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Unable to load student data</p>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header title="Student Dashboard" />
      
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Clock In/Out Section */}
            <div className="card">
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Quick Actions</h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <ClockInOut 
                  studentId={user?._id} 
                  shiftType={(studentData?.shiftType as any) || 'regular'} 
                  isAccepted={true}
                />
              </div>
            </div>

            {/* Tabs Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
                {['overview', 'attendance', 'schedule', 'reports'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                      color: activeTab === tab ? '#111827' : '#6b7280',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      boxShadow: activeTab === tab ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <RecentActivities />
                    <QuickActions />
                  </div>
                  
                  <Announcements studentId={user?._id} />
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Attendance Records</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <AttendanceLogs studentId={user?._id} />
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Schedule Change Request</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <ScheduleChangeRequest 
                      studentId={user?._id} 
                      currentShiftType={(studentData?.shiftType as any) || 'regular'} 
                    />
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>DTR Template</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <UserProfileCard user={user} />
            
            {/* Performance Card */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Performance</h3>
              </div>
              <div className="card-content" style={{ paddingTop: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Attendance Rate</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>95%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '95%' }}></div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Hours</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2563eb' }}>320</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '80%' }}></div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tasks Completed</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#7c3aed' }}>24/30</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '80%', backgroundColor: '#7c3aed' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Quick Stats</h3>
              </div>
              <div className="card-content" style={{ paddingTop: '0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
                    <Calendar style={{ height: '1.5rem', width: '1.5rem', color: '#22c55e', margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>45</div>
                    <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Days Active</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                    <Clock style={{ height: '1.5rem', width: '1.5rem', color: '#3b82f6', margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>320</div>
                    <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>Total Hours</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                    <Target style={{ height: '1.5rem', width: '1.5rem', color: '#f59e0b', margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>24</div>
                    <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Tasks Done</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fdf2f8', borderRadius: '0.5rem' }}>
                    <Award style={{ height: '1.5rem', width: '1.5rem', color: '#ec4899', margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#be185d' }}>3</div>
                    <div style={{ fontSize: '0.75rem', color: '#9f1239' }}>Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
