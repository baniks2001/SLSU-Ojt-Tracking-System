'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
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
  campusName?: string;
  campusId?: {
    _id: string;
    campusName: string;
    campusCode: string;
  };
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(true);

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
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await fetch('/api/campuses');
      if (response.ok) {
        const data = await response.json();
        setCampuses(data.campuses || []);
      }
    } catch (error) {
      console.error('Error fetching campuses:', error);
    } finally {
      setIsLoadingCampuses(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (studentForm.password !== studentForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentForm,
          accountType: 'student',
        }),
      });

      if (response.ok) {
        toast.success('Student registration successful! Please wait for approval.');
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (departmentForm.password !== departmentForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...departmentForm,
          accountType: 'department',
        }),
      });

      if (response.ok) {
        toast.success('Department registration successful! Please wait for approval.');
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminForm,
          accountType: 'admin',
        }),
      });

      if (response.ok) {
        toast.success('Admin registration successful! Please wait for approval.');
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Logo size="large" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Register for SLSU OJT Tracking System</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Register</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose your account type and fill in the required information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger 
                  value="student" 
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white text-gray-700"
                >
                  Student
                </TabsTrigger>
                <TabsTrigger 
                  value="department" 
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white text-gray-700"
                >
                  Department
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white text-gray-700"
                >
                  Admin
                </TabsTrigger>
              </TabsList>
              
              {/* Student Registration */}
              <TabsContent value="student" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      placeholder="Enter student ID"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="Enter first name"
                      value={studentForm.firstName}
                      onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Enter last name"
                      value={studentForm.lastName}
                      onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle-name">Middle Name</Label>
                    <Input
                      id="middle-name"
                      placeholder="Enter middle name (optional)"
                      value={studentForm.middleName}
                      onChange={(e) => setStudentForm({ ...studentForm, middleName: e.target.value })}
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={studentForm.confirmPassword}
                      onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={studentForm.course}
                      onValueChange={(value) => setStudentForm({ ...studentForm, course: value })}
                      disabled={isLoadingCourses}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20">
                        {studentForm.course || 'Select course'}
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course.courseCode}>
                            {course.courseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={studentForm.department}
                      onValueChange={(value) => setStudentForm({ ...studentForm, department: value })}
                      disabled={isLoadingDepartments}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20">
                        {studentForm.department || 'Select department'}
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept.departmentCode}>
                            {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campus">Campus</Label>
                    <Select
                      value={studentForm.campus}
                      onValueChange={(value) => setStudentForm({ ...studentForm, campus: value })}
                      disabled={isLoadingCampuses}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20">
                        {studentForm.campus || 'Select campus'}
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((campus) => (
                          <SelectItem key={campus._id} value={campus.campusCode}>
                            {campus.campusName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift-type">Shift Type</Label>
                  <Select
                    value={studentForm.shiftType}
                    onValueChange={(value) => setStudentForm({ ...studentForm, shiftType: value as any })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20">
                      {studentForm.shiftType || 'Select shift type'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12:00 PM - 6:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6:00 PM - 12:00 AM)</SelectItem>
                      <SelectItem value="midnight">Midnight (12:00 AM - 6:00 AM)</SelectItem>
                      <SelectItem value="graveyard">Graveyard (10:00 PM - 6:00 AM)</SelectItem>
                      <SelectItem value="1shift">Single Shift (6:00 AM - 6:00 PM)</SelectItem>
                      <SelectItem value="2shift">Two Shifts (6:00 AM-12:00 PM, 12:00 PM-6:00 PM)</SelectItem>
                      <SelectItem value="regular">Regular (6:00 AM - 6:00 PM)</SelectItem>
                      <SelectItem value="custom">Custom Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register as Student'}
                </Button>
              </TabsContent>

              {/* Department Registration */}
              <TabsContent value="department" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input
                    id="dept-name"
                    placeholder="Enter department name"
                    value={departmentForm.departmentName}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, departmentName: e.target.value })}
                    required
                    className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-code">Department Code</Label>
                  <Input
                    id="dept-code"
                    placeholder="Enter department code"
                    value={departmentForm.departmentCode}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, departmentCode: e.target.value })}
                    required
                    className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={departmentForm.location}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })}
                    required
                    className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advisor-name">OJT Advisor Name</Label>
                    <Input
                      id="advisor-name"
                      placeholder="Enter advisor name"
                      value={departmentForm.ojtAdvisorName}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorName: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advisor-position">OJT Advisor Position</Label>
                    <Input
                      id="advisor-position"
                      placeholder="Enter advisor position"
                      value={departmentForm.ojtAdvisorPosition}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorPosition: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-email">Email</Label>
                    <Input
                      id="dept-email"
                      type="email"
                      placeholder="Enter email"
                      value={departmentForm.email}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-password">Password</Label>
                    <Input
                      id="dept-password"
                      type="password"
                      placeholder="Enter password"
                      value={departmentForm.password}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-confirm-password">Confirm Password</Label>
                    <Input
                      id="dept-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={departmentForm.confirmPassword}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, confirmPassword: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register as Department'}
                </Button>
              </TabsContent>

              {/* Admin Registration */}
              <TabsContent value="admin" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                    <Input
                      id="admin-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register as Admin'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-900 hover:text-blue-800 font-medium"
              >
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2026 Southern Leyte State University - OJT Tracking System
          </p>
        </div>
      </div>
    </div>
  );
}
