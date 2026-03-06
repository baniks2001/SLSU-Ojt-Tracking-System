'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Building, Calendar, FileText, TrendingUp, Settings, Bell, Award, Target, Clock } from 'lucide-react';
import Header from '@/components/Header';

interface AdminStats {
  totalStudents: number;
  totalDepartments: number;
  totalAttendance: number;
  activeUsers: number;
  pendingRequests: number;
  systemHealth: 'good' | 'warning' | 'error';
}

interface RecentActivity {
  id: string;
  type: 'student_registered' | 'attendance_submitted' | 'request_made' | 'system_update';
  description: string;
  timestamp: string;
  user?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalDepartments: 0,
    totalAttendance: 0,
    activeUsers: 0,
    pendingRequests: 0,
    systemHealth: 'good'
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.accountType !== 'admin' && parsedUser.accountType !== 'superadmin') {
      router.push('/login');
      return;
    }

    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent activities
      const activitiesResponse = await fetch('/api/system-activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData.slice(0, 10)); // Get last 10 activities
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="loading loading-lg"></div>
          <p style={{ color: '#6b7280' }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Unable to load admin data</p>
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
      <Header title="Admin Dashboard" />
      
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Stats Overview */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>System Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Total Students</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalStudents}</p>
                  </div>
                  <Users style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Departments</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalDepartments}</p>
                  </div>
                  <Building style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Attendance Records</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalAttendance}</p>
                  </div>
                  <Calendar style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Active Users</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.activeUsers}</p>
                  </div>
                  <TrendingUp style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tabs Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
                {['overview', 'users', 'departments', 'reports'].map((tab) => (
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="card">
                    <div className="card-header">
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Recent Activities</h3>
                    </div>
                    <div className="card-content" style={{ paddingTop: '0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentActivities.slice(0, 5).map((activity) => (
                          <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <div style={{ 
                              width: '2rem', 
                              height: '2rem', 
                              borderRadius: '50%', 
                              backgroundColor: activity.type === 'student_registered' ? '#dcfce7' : 
                                               activity.type === 'attendance_submitted' ? '#eff6ff' :
                                               activity.type === 'request_made' ? '#fef3c7' : '#f3f4f6',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              {activity.type === 'student_registered' && <Users style={{ height: '1rem', width: '1rem', color: '#22c55e' }} />}
                              {activity.type === 'attendance_submitted' && <Calendar style={{ height: '1rem', width: '1rem', color: '#3b82f6' }} />}
                              {activity.type === 'request_made' && <FileText style={{ height: '1rem', width: '1rem', color: '#f59e0b' }} />}
                              {activity.type === 'system_update' && <Settings style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{activity.description}</p>
                              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(activity.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>System Health</h3>
                    </div>
                    <div className="card-content" style={{ paddingTop: '0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Database Status</span>
                          <span className={`status-${stats.systemHealth === 'good' ? 'online' : stats.systemHealth === 'warning' ? 'busy' : 'offline'}`}>
                            {stats.systemHealth === 'good' ? 'Healthy' : stats.systemHealth === 'warning' ? 'Warning' : 'Error'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>API Response</span>
                          <span className="status-online">Normal</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Storage Usage</span>
                          <span className="status-online">45%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Requests</span>
                          <span className={`status-${stats.pendingRequests > 0 ? 'busy' : 'online'}`}>{stats.pendingRequests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>User Management</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                      User management interface coming soon...
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'departments' && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Department Management</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                      Department management interface coming soon...
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Reports & Analytics</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                      Reports and analytics interface coming soon...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Quick Actions</h3>
              </div>
              <div className="card-content" style={{ paddingTop: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                    <Users style={{ height: '1rem', width: '1rem', marginRight: '0.75rem' }} />
                    Add New Student
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                    <Building style={{ height: '1rem', width: '1rem', marginRight: '0.75rem' }} />
                    Add Department
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                    <FileText style={{ height: '1rem', width: '1rem', marginRight: '0.75rem' }} />
                    Generate Report
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                    <Settings style={{ height: '1rem', width: '1rem', marginRight: '0.75rem' }} />
                    System Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Notifications</h3>
              </div>
              <div className="card-content" style={{ paddingTop: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                    <Bell style={{ height: '1rem', width: '1rem', color: '#d97706' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: '#92400e' }}>{stats.pendingRequests} pending requests</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                    <Calendar style={{ height: '1rem', width: '1rem', color: '#3b82f6' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>System backup completed</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem' }}>
                    <Award style={{ height: '1rem', width: '1rem', color: '#22c55e' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: '#166534' }}>New student registrations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Profile */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Admin Profile</h3>
              </div>
              <div className="card-content" style={{ paddingTop: '0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '4rem', 
                    height: '4rem', 
                    borderRadius: '50%', 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 1rem', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold' 
                  }}>
                    {user.details?.firstName?.charAt(0) || user.email?.charAt(0) || 'A'}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                    {user.details?.firstName} {user.details?.lastName}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    {user.accountType === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                    <p>{user.email}</p>
                    <p>Last login: {new Date().toLocaleDateString()}</p>
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
