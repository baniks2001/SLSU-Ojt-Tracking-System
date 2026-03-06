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
    campusId: '',
    departmentName: '', // Auto-filled from selected course
    hostEstablishment: '',
    contactNumber: '',
    emergencyContact: '',
    emergencyContactNumber: '',
    address: '',
    shiftType: 'regular',
    customStartTime: '',
    customEndTime: '',
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '', // Selected existing department
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
        const response = await fetch('/api/courses?forRegistration=true');
        const data = await response.json();
        
        if (response.ok && data.courses) {
          // Extract unique departments from courses
          const uniqueDepartments = data.courses.reduce((acc: any[], course: Course) => {
            const existingDept = acc.find(dept => dept.departmentName === course.departmentName);
            if (!existingDept) {
              acc.push({
                _id: course._id, // Use course ID as reference
                departmentName: course.departmentName,
                departmentCode: course.departmentName.split(' ').map(word => word[0]).join('').toUpperCase(), // Generate code from name
                location: course.campusId?.campusName || 'Unknown Campus', // Use actual campus from course
              });
            }
            return acc;
          }, []);
          setDepartments(uniqueDepartments);
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

    const fetchCampuses = async () => {
      try {
        const response = await fetch('/api/campuses?forRegistration=true');
        const data = await response.json();
        
        if (response.ok && data.campuses) {
          setCampuses(data.campuses);
        } else {
          toast.error('Failed to load campuses');
        }
      } catch (error) {
        console.error('Error fetching campuses:', error);
        toast.error('Failed to load campuses');
      } finally {
        setIsLoadingCampuses(false);
      }
    };

    if (activeTab === 'student' || activeTab === 'department') {
      fetchDepartments();
      fetchCourses();
      fetchCampuses();
    }
  }, [activeTab]);

  // Update department form when department is selected
  useEffect(() => {
    if (departmentForm.departmentId) {
      const selectedDept = departments.find(d => d._id === departmentForm.departmentId);
      if (selectedDept) {
        setDepartmentForm(prev => ({
          ...prev,
          departmentName: selectedDept.departmentName,
          departmentCode: selectedDept.departmentCode,
          location: selectedDept.location,
        }));
      }
    }
  }, [departmentForm.departmentId, departments]);

  // Update when course changes (department is auto-derived from course)
  useEffect(() => {
    if (studentForm.courseId) {
      const selectedCourse = courses.find(c => c._id === studentForm.courseId);
      if (selectedCourse) {
        setStudentForm(prev => ({ 
          ...prev, 
          departmentName: selectedCourse.departmentName
        }));
      }
    }
  }, [studentForm.courseId, courses]);

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

    if (!studentForm.campusId) {
      toast.error('Please select a campus');
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
            campusId: studentForm.campusId,
            department: studentForm.departmentName, // Department derived from course
            hostEstablishment: studentForm.hostEstablishment,
            contactNumber: studentForm.contactNumber,
            emergencyContact: studentForm.emergencyContact,
            emergencyContactNumber: studentForm.emergencyContactNumber,
            address: studentForm.address,
            shiftType: studentForm.shiftType,
            customStartTime: studentForm.customStartTime,
            customEndTime: studentForm.customEndTime,
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
                    <Label htmlFor="contact-number">Contact Number</Label>
                    <Input
                      id="contact-number"
                      placeholder="Enter contact number"
                      value={studentForm.contactNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, contactNumber: e.target.value })}
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
                          campusId: selectedCourse.campusId?._id || ''
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
                        <SelectItem value="_none_" disabled>
                          No courses available
                        </SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.courseName} ({course.courseCode}) - {course.departmentName} - {course.campusId?.campusName || 'No Campus'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus">Campus *</Label>
                  <Select
                    value={studentForm.campusId}
                    onValueChange={(value) => setStudentForm({ ...studentForm, campusId: value })}
                    disabled={isLoadingCampuses}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCampuses ? "Loading..." : "Select campus"} />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.length === 0 ? (
                        <SelectItem value="_none_" disabled>
                          No campuses available
                        </SelectItem>
                      ) : (
                        campuses.map((campus) => (
                          <SelectItem key={campus._id} value={campus._id}>
                            {campus.campusName} ({campus.campusCode})
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
                        <SelectItem value="morning">Morning (6:00 AM - 12:00 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12:00 PM - 6:00 PM)</SelectItem>
                        <SelectItem value="evening">Evening (6:00 PM - 12:00 AM)</SelectItem>
                        <SelectItem value="midnight">Midnight (12:00 AM - 6:00 AM)</SelectItem>
                        <SelectItem value="regular">Regular (6:00 AM - 6:00 PM)</SelectItem>
                        <SelectItem value="1shift">Single Shift (6:00 AM - 6:00 PM)</SelectItem>
                        <SelectItem value="2shift">Two Shifts (6:00 AM-12:00 PM, 12:00 PM-6:00 PM)</SelectItem>
                        <SelectItem value="graveyard">Graveyard (10:00 PM - 6:00 AM)</SelectItem>
                        <SelectItem value="custom">Custom Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {studentForm.shiftType === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-start-time">Custom Start Time</Label>
                      <Input
                        id="custom-start-time"
                        type="time"
                        value={studentForm.customStartTime}
                        onChange={(e) => setStudentForm({ ...studentForm, customStartTime: e.target.value })}
                        required={studentForm.shiftType === 'custom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-end-time">Custom End Time</Label>
                      <Input
                        id="custom-end-time"
                        type="time"
                        value={studentForm.customEndTime}
                        onChange={(e) => setStudentForm({ ...studentForm, customEndTime: e.target.value })}
                        required={studentForm.shiftType === 'custom'}
                      />
                    </div>
                  </div>
                )}

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
                    <Label htmlFor="emergency-contact">Emergency Contact Name</Label>
                    <Input
                      id="emergency-contact"
                      placeholder="Enter emergency contact name"
                      value={studentForm.emergencyContact}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact-number">Emergency Contact Number</Label>
                    <Input
                      id="emergency-contact-number"
                      placeholder="Enter emergency contact number"
                      value={studentForm.emergencyContactNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyContactNumber: e.target.value })}
                      required
                    />
                  </div>
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
                <div className="space-y-2">
                  <Label htmlFor="dept-select">Select Department *</Label>
                  <Select
                    value={departmentForm.departmentId}
                    onValueChange={(value) => {
                      setDepartmentForm(prev => ({ ...prev, departmentId: value }));
                    }}
                    disabled={isLoadingDepartments}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department from available courses"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <SelectItem value="_none_" disabled>
                          No departments available (no courses found)
                        </SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept._id}>
                            {dept.departmentName} ({dept.departmentCode}) - {dept.location}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Departments are derived from available courses. Contact admin if your department is not listed.
                  </p>
                </div>

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
                      placeholder="Auto-filled from department"
                      value={departmentForm.departmentCode}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input
                    id="dept-name"
                    placeholder="Auto-filled from department"
                    value={departmentForm.departmentName}
                    readOnly
                    className="bg-gray-100"
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
                    <Label htmlFor="dept-location">Campus</Label>
                    <Input
                      id="dept-location"
                      placeholder="Auto-filled from department"
                      value={departmentForm.location}
                      readOnly
                      className="bg-gray-100"
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
                  disabled={isLoading || !departmentForm.departmentId}
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
