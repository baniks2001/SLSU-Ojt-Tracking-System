'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { User, Building, Shield, Mail, Lock, Eye, EyeOff, Loader2, GraduationCap, MapPin, UserCheck } from 'lucide-react';
import Logo from '@/components/Logo';

interface Department {
  _id: string;
  departmentName: string;
  departmentCode: string;
  location: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  departmentName: string;
}

interface Campus {
  _id: string;
  campusName: string;
  campusCode: string;
  location: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [studentForm, setStudentForm] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: '',
    department: '',
    campus: '',
    shiftType: 'regular' as const,
  });

  const [departmentForm, setDepartmentForm] = useState({
    departmentName: '',
    departmentCode: '',
    location: '',
    ojtAdvisorName: '',
    ojtAdvisorPosition: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchCampuses();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await fetch('/api/campuses');
      const data = await response.json();
      setCampuses(data);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      let formData;

      switch (activeTab) {
        case 'student':
          if (studentForm.password !== studentForm.confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
          }
          formData = { ...studentForm, action: 'register', accountType: 'student' };
          response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          break;
        case 'department':
          if (departmentForm.password !== departmentForm.confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
          }
          formData = { ...departmentForm, action: 'register', accountType: 'department' };
          response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          break;
        case 'admin':
          if (adminForm.password !== adminForm.confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
          }
          formData = { ...adminForm, action: 'register', accountType: 'admin' };
          response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          break;
      }

      if (response && response.ok) {
        const data = await response.json();
        toast.success('Registration successful! Please login.');
        router.push('/login');
      } else {
        const errorData = response ? await response.json() : { error: 'Registration failed' };
        toast.error(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '64rem' }}>
        {/* Logo and Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <Logo size="large" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Register for SLSU OJT Tracking System</p>
        </div>

        {/* Registration Card */}
        <div className="card animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div className="card-header" style={{ paddingBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>
              Register
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Choose your account type and fill in the required information
            </p>
          </div>
          
          <div className="card-content" style={{ paddingTop: '0' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('student')}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: activeTab === 'student' ? '#1e3a8a' : 'transparent',
                  color: activeTab === 'student' ? '#ffffff' : '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms'
                }}
              >
                <GraduationCap style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
                Student
              </button>
              <button
                onClick={() => setActiveTab('department')}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: activeTab === 'department' ? '#1e3a8a' : 'transparent',
                  color: activeTab === 'department' ? '#ffffff' : '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms'
                }}
              >
                <Building style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
                Department
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: activeTab === 'admin' ? '#1e3a8a' : 'transparent',
                  color: activeTab === 'admin' ? '#ffffff' : '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms'
                }}
              >
                <Shield style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTab === 'student' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      placeholder="Enter student ID"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={studentForm.firstName}
                      onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={studentForm.lastName}
                      onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Middle Name</label>
                    <input
                      type="text"
                      placeholder="Enter middle name"
                      value={studentForm.middleName}
                      onChange={(e) => setStudentForm({ ...studentForm, middleName: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        required
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={studentForm.confirmPassword}
                        onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                        required
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <select
                      value={studentForm.course}
                      onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                      required
                      className="form-input"
                    >
                      <option value="">Select course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course.courseCode}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      required
                      className="form-input"
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.departmentCode}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Campus</label>
                    <select
                      value={studentForm.campus}
                      onChange={(e) => setStudentForm({ ...studentForm, campus: e.target.value })}
                      required
                      className="form-input"
                    >
                      <option value="">Select campus</option>
                      {campuses.map((campus) => (
                        <option key={campus._id} value={campus.campusCode}>
                          {campus.campusName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shift Type</label>
                    <select
                      value={studentForm.shiftType}
                      onChange={(e) => setStudentForm({ ...studentForm, shiftType: e.target.value as any })}
                      className="form-input"
                    >
                      <option value="regular">Regular</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'department' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department Name</label>
                    <input
                      type="text"
                      placeholder="Enter department name"
                      value={departmentForm.departmentName}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, departmentName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department Code</label>
                    <input
                      type="text"
                      placeholder="Enter department code"
                      value={departmentForm.departmentCode}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, departmentCode: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={departmentForm.location}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">OJT Advisor Name</label>
                    <input
                      type="text"
                      placeholder="Enter advisor name"
                      value={departmentForm.ojtAdvisorName}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">OJT Advisor Position</label>
                    <input
                      type="text"
                      placeholder="Enter advisor position"
                      value={departmentForm.ojtAdvisorPosition}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorPosition: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={departmentForm.email}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={departmentForm.password}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                        required
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={departmentForm.confirmPassword}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, confirmPassword: e.target.value })}
                        required
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                        required
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={adminForm.confirmPassword}
                        onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                        required
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary hover-lift"
                style={{ width: '100%', height: '2.75rem', fontWeight: '500', marginTop: '1rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 className="loading" style={{ height: '1rem', width: '1rem' }} />
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Register'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                Already have an account?{' '}
                <Link
                  href="/login"
                  style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }} className="animate-fade-in">
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2026 Southern Leyte State University - OJT Tracking System
          </p>
        </div>
      </div>
    </div>
  );
}
