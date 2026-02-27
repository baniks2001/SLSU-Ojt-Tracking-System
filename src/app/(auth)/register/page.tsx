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
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Student form state - department is auto-derived from course
  const [studentForm, setStudentForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    courseId: '',
    departmentName: '', // Auto-filled from selected course
    location: '',
    hostEstablishment: '',
    contactNumber: '',
    address: '',
    shiftType: 'regular',
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    departmentName: '',
    departmentCode: '',
    location: '',
    contactEmail: '',
    contactNumber: '',
    ojtAdvisorName: '',
    ojtAdvisorPosition: '',
  });

  // Fetch approved departments and courses for student registration
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments?forRegistration=true');
        const data = await response.json();
        
        if (response.ok && data.departments) {
          setDepartments(data.departments);
        } else {
          toast.error('Failed to load departments');
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses?forRegistration=true');
        const data = await response.json();
        
        if (response.ok && data.courses) {
          setCourses(data.courses);
        } else {
          toast.error('Failed to load courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (activeTab === 'student') {
      fetchDepartments();
      fetchCourses();
    }
  }, [activeTab]);

  // Update location when course changes (department is auto-derived from course)
  useEffect(() => {
    if (studentForm.courseId) {
      const selectedCourse = courses.find(c => c._id === studentForm.courseId);
      if (selectedCourse) {
        const matchingDept = departments.find(d => d.departmentName === selectedCourse.departmentName);
        if (matchingDept) {
          setStudentForm(prev => ({ ...prev, location: matchingDept.location }));
        }
      }
    }
  }, [studentForm.courseId, courses, departments]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (studentForm.password !== studentForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!studentForm.courseId) {
      toast.error('Please select a course');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: studentForm.email,
          password: studentForm.password,
          accountType: 'student',
          studentData: {
            studentId: studentForm.studentId,
            firstName: studentForm.firstName,
            lastName: studentForm.lastName,
            middleName: studentForm.middleName,
            courseId: studentForm.courseId,
            department: studentForm.departmentName, // Department derived from course
            location: studentForm.location,
            hostEstablishment: studentForm.hostEstablishment,
            contactNumber: studentForm.contactNumber,
            address: studentForm.address,
            shiftType: studentForm.shiftType,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please wait for approval.');
        router.push('/login');
      } else {
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
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: departmentForm.email,
          password: departmentForm.password,
          accountType: 'department',
          departmentData: {
            departmentName: departmentForm.departmentName,
            departmentCode: departmentForm.departmentCode,
            location: departmentForm.location,
            contactEmail: departmentForm.contactEmail,
            contactNumber: departmentForm.contactNumber,
            ojtAdvisorName: departmentForm.ojtAdvisorName,
            ojtAdvisorPosition: departmentForm.ojtAdvisorPosition,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Department registration successful! Please wait for admin approval.');
        router.push('/login');
      } else {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex flex-col items-center">
            <Logo size="medium" className="mb-2" />
            <h1 className="text-2xl font-bold text-[#003366]">Southern Leyte State University</h1>
            <p className="text-sm text-gray-600">OJT Tracking System</p>
          </div>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Register as a student or department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="department">Department</TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <form onSubmit={handleStudentSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="your.email@slsu.edu.ph"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      placeholder="Enter student ID"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="Enter first name"
                      value={studentForm.firstName}
                      onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                      required
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="middle-name">Middle Name</Label>
                    <Input
                      id="middle-name"
                      placeholder="Enter middle name"
                      value={studentForm.middleName}
                      onChange={(e) => setStudentForm({ ...studentForm, middleName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Auto-filled from course"
                      value={studentForm.location}
                      onChange={(e) => setStudentForm({ ...studentForm, location: e.target.value })}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={studentForm.courseId}
                    onValueChange={(value) => {
                      const selectedCourse = courses.find(c => c._id === value);
                      if (selectedCourse) {
                        setStudentForm(prev => ({ 
                          ...prev, 
                          courseId: value,
                          departmentName: selectedCourse.departmentName,
                          // Find location from a department with matching name
                          location: departments.find(d => d.departmentName === selectedCourse.departmentName)?.location || ''
                        }));
                      }
                    }}
                    disabled={isLoadingCourses}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCourses ? "Loading..." : "Select course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <SelectItem value="no-courses" disabled>
                          No courses available
                        </SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.courseName} ({course.courseCode}) - {course.departmentName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host-establishment">Host Establishment</Label>
                  <Input
                    id="host-establishment"
                    placeholder="Enter host establishment where you will be deployed"
                    value={studentForm.hostEstablishment}
                    onChange={(e) => setStudentForm({ ...studentForm, hostEstablishment: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-number">Contact Number</Label>
                    <Input
                      id="contact-number"
                      placeholder="Enter contact number"
                      value={studentForm.contactNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, contactNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shift-type">Shift Type</Label>
                    <Select
                      value={studentForm.shiftType}
                      onValueChange={(value) => setStudentForm({ ...studentForm, shiftType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="graveyard">Graveyard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="Enter password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-confirm-password">Confirm Password</Label>
                    <Input
                      id="student-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={studentForm.confirmPassword}
                      onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#003366] hover:bg-[#002244]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register as Student'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="department">
              <form onSubmit={handleDepartmentSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-email">Email</Label>
                    <Input
                      id="dept-email"
                      type="email"
                      placeholder="department@slsu.edu.ph"
                      value={departmentForm.email}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-code">Department Code</Label>
                    <Input
                      id="dept-code"
                      placeholder="e.g., CCS, COE"
                      value={departmentForm.departmentCode}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, departmentCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input
                    id="dept-name"
                    placeholder="Enter department name"
                    value={departmentForm.departmentName}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, departmentName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ojt-advisor-name">OJT Advisor Name</Label>
                    <Input
                      id="ojt-advisor-name"
                      placeholder="Enter OJT advisor name"
                      value={departmentForm.ojtAdvisorName}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ojt-advisor-position">Position</Label>
                    <Input
                      id="ojt-advisor-position"
                      placeholder="Enter position"
                      value={departmentForm.ojtAdvisorPosition}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorPosition: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-location">Location</Label>
                    <Input
                      id="dept-location"
                      placeholder="Enter location"
                      value={departmentForm.location}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-contact">Contact Number</Label>
                    <Input
                      id="dept-contact"
                      placeholder="Enter contact number"
                      value={departmentForm.contactNumber}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, contactNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dept-contact-email">Contact Email</Label>
                  <Input
                    id="dept-contact-email"
                    type="email"
                    placeholder="Enter contact email"
                    value={departmentForm.contactEmail}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, contactEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-password">Password</Label>
                    <Input
                      id="dept-password"
                      type="password"
                      placeholder="Enter password"
                      value={departmentForm.password}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                      required
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
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#003366] hover:bg-[#002244]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register Department'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#003366] hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
