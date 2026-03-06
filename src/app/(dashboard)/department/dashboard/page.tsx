'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, FileText, Bell, UserCheck, UserX, CheckCircle, Clock, Shield, Trash2, Building, Calendar, TrendingUp, Target } from 'lucide-react';
import Header from '@/components/Header';

interface DepartmentData {
  _id: string;
  departmentName: string;
  departmentCode: string;
  location: string;
  ojtAdvisorName: string;
  ojtAdvisorPosition: string;
  email: string;
}

interface Student {
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
  isAccepted: boolean;
  attendanceRecords: number;
  totalHours: number;
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
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  };
}

export default function DepartmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.accountType !== 'department') {
      router.push('/login');
      return;
    }

    fetchDepartmentData();
    fetchStudents();
    fetchAttendance();
  }, [router]);

  const fetchDepartmentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartmentData(data);
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter students by department
        const departmentStudents = data.filter((student: Student) => 
          student.department === user?.details?.departmentCode
        );
        setStudents(departmentStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async (studentId?: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = studentId ? `/api/attendance?studentId=${studentId}` : '/api/attendance';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (studentId) {
          setAttendance(data);
        } else {
          // Filter attendance by department
          const departmentAttendance = data.filter((record: AttendanceRecord) => 
            students.some(student => student._id === record.studentId._id)
          );
          setAttendance(departmentAttendance);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departmentId: user?.details?.departmentCode,
        }),
      });

      if (response.ok) {
        toast.success('Attendance record deleted successfully');
        if (selectedStudent) {
          fetchAttendance(selectedStudent._id);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete attendance record');
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('An error occurred while deleting attendance record');
    }
  };

  const handleAcceptStudent = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        toast.success('Student accepted successfully');
        fetchStudents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to accept student');
      }
    } catch (error) {
      console.error('Error accepting student:', error);
      toast.error('An error occurred while accepting student');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="loading loading-lg"></div>
          <p style={{ color: '#6b7280' }}>Loading department dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !departmentData) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Unable to load department data</p>
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

  const acceptedStudents = students.filter(student => student.isAccepted);
  const pendingStudents = students.filter(student => !student.isAccepted);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header title="Department Dashboard" />
      
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Department Overview */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            {departmentData.departmentName}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Total Students</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{students.length}</p>
                  </div>
                  <Users style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Accepted</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{acceptedStudents.length}</p>
                  </div>
                  <UserCheck style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Pending</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pendingStudents.length}</p>
                  </div>
                  <UserX style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#ffffff' }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Attendance Records</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{attendance.length}</p>
                  </div>
                  <Calendar style={{ height: '3rem', width: '3rem', opacity: 0.8 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Tabs Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
              {['overview', 'students', 'attendance', 'reports'].map((tab) => (
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
                {/* Department Info */}
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Department Information</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Department Code:</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{departmentData.departmentCode}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Location:</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{departmentData.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserCheck style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>OJT Advisor:</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{departmentData.ojtAdvisorName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Position:</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{departmentData.ojtAdvisorPosition}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Email:</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{departmentData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Recent Activity</h3>
                  </div>
                  <div className="card-content" style={{ paddingTop: '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {attendance.slice(0, 5).map((record) => (
                        <div key={record._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                          <Calendar style={{ height: '1rem', width: '1rem', color: '#3b82f6' }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                              {record.studentId.firstName} {record.studentId.lastName} - {record.date}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {record.totalHours ? `${record.totalHours} hours` : 'In progress'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Student Management</h3>
                </div>
                <div className="card-content" style={{ paddingTop: '0' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Student ID</th>
                          <th className="table-header-cell">Name</th>
                          <th className="table-header-cell">Course</th>
                          <th className="table-header-cell">Status</th>
                          <th className="table-header-cell">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student._id} className="table-row">
                            <td className="table-cell">{student.studentId}</td>
                            <td className="table-cell">{`${student.firstName} ${student.lastName}`}</td>
                            <td className="table-cell">{student.course}</td>
                            <td className="table-cell">
                              <span className={`badge ${student.isAccepted ? 'badge-success' : 'badge-warning'}`}>
                                {student.isAccepted ? 'Accepted' : 'Pending'}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!student.isAccepted && (
                                  <button
                                    onClick={() => handleAcceptStudent(student._id)}
                                    className="btn btn-sm btn-primary"
                                  >
                                    <UserCheck style={{ height: '0.875rem', width: '0.875rem' }} />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    fetchAttendance(student._id);
                                    setActiveTab('attendance');
                                  }}
                                  className="btn btn-sm btn-outline"
                                >
                                  <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                    Attendance Records {selectedStudent && `- ${selectedStudent.firstName} ${selectedStudent.lastName}`}
                  </h3>
                  {selectedStudent && (
                    <button
                      onClick={() => {
                        setSelectedStudent(null);
                        fetchAttendance();
                      }}
                      className="btn btn-sm btn-outline"
                    >
                      View All
                    </button>
                  )}
                </div>
                <div className="card-content" style={{ paddingTop: '0' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Date</th>
                          <th className="table-header-cell">Student</th>
                          <th className="table-header-cell">Morning In</th>
                          <th className="table-header-cell">Morning Out</th>
                          <th className="table-header-cell">Afternoon In</th>
                          <th className="table-header-cell">Afternoon Out</th>
                          <th className="table-header-cell">Total Hours</th>
                          <th className="table-header-cell">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record) => (
                          <tr key={record._id} className="table-row">
                            <td className="table-cell">{record.date}</td>
                            <td className="table-cell">{`${record.studentId.firstName} ${record.studentId.lastName}`}</td>
                            <td className="table-cell">{record.morningIn || '-'}</td>
                            <td className="table-cell">{record.morningOut || '-'}</td>
                            <td className="table-cell">{record.afternoonIn || '-'}</td>
                            <td className="table-cell">{record.afternoonOut || '-'}</td>
                            <td className="table-cell">{record.totalHours ? `${record.totalHours}h` : '-'}</td>
                            <td className="table-cell">
                              <button
                                onClick={() => handleDeleteAttendance(record._id)}
                                className="btn btn-sm btn-destructive"
                              >
                                <Trash2 style={{ height: '0.875rem', width: '0.875rem' }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
      </div>
    </div>
  );
}
