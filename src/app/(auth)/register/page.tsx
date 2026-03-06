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
import { Mail, Lock, Eye, EyeOff, User, Building, GraduationCap, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [studentData, setStudentData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    course: '',
    department: '',
    hostEstablishment: '',
    contactNumber: '',
    address: '',
  });

  const [departmentData, setDepartmentData] = useState({
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
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (studentData.password !== studentData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (studentData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: studentData.email,
          password: studentData.password,
          accountType: 'student',
          studentData: {
            studentId: studentData.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            middleName: studentData.middleName,
            course: studentData.course,
            department: studentData.department,
            hostEstablishment: studentData.hostEstablishment,
            contactNumber: studentData.contactNumber,
            address: studentData.address,
            shiftType: 'regular',
          },
        }),
      });

      if (response.ok) {
        toast.success('Registration successful! Please wait for approval.');
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (departmentData.password !== departmentData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (departmentData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: departmentData.email,
          password: departmentData.password,
          accountType: 'department',
          departmentData: {
            departmentName: departmentData.departmentName,
            departmentCode: departmentData.departmentCode,
            location: departmentData.location,
            contactEmail: departmentData.contactEmail,
            contactNumber: departmentData.contactNumber,
            ojtAdvisorName: departmentData.ojtAdvisorName,
            ojtAdvisorPosition: departmentData.ojtAdvisorPosition,
          },
        }),
      });

      if (response.ok) {
        toast.success('Registration successful! Please wait for approval.');
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative w-full max-w-2xl">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 border border-gray-100">
              <Image 
                src="/logo.png" 
                alt="SLSU Logo" 
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm">Join the OJT Tracking System</p>
          </div>

          {/* Register Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl animate-fadeIn">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 text-center">Register</CardTitle>
              <CardDescription className="text-gray-600 text-center">
                Choose your account type to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="student" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <User className="w-4 h-4 mr-2" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="department" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Building className="w-4 h-4 mr-2" />
                    Department
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student" className="space-y-6 mt-6">
                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="student-email"
                            type="email"
                            placeholder="student@example.com"
                            value={studentData.email}
                            onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                            required
                            className="pl-10 h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="student-id" className="text-sm font-medium text-gray-700">Student ID</Label>
                        <Input
                          id="student-id"
                          type="text"
                          placeholder="2024-0001"
                          value={studentData.studentId}
                          onChange={(e) => setStudentData({ ...studentData, studentId: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name" className="text-sm font-medium text-gray-700">First Name</Label>
                        <Input
                          id="first-name"
                          type="text"
                          placeholder="John"
                          value={studentData.firstName}
                          onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last Name</Label>
                        <Input
                          id="last-name"
                          type="text"
                          placeholder="Doe"
                          value={studentData.lastName}
                          onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="middle-name" className="text-sm font-medium text-gray-700">Middle Name</Label>
                        <Input
                          id="middle-name"
                          type="text"
                          placeholder="Smith"
                          value={studentData.middleName}
                          onChange={(e) => setStudentData({ ...studentData, middleName: e.target.value })}
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="course" className="text-sm font-medium text-gray-700">Course</Label>
                        <Select value={studentData.course} onValueChange={(value) => setStudentData({ ...studentData, course: value })}>
                          <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course._id} value={course.courseName}>
                                {course.courseName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                        <Select value={studentData.department} onValueChange={(value) => setStudentData({ ...studentData, department: value })}>
                          <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept._id} value={dept.departmentName}>
                                {dept.departmentName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-number" className="text-sm font-medium text-gray-700">Contact Number</Label>
                        <Input
                          id="contact-number"
                          type="tel"
                          placeholder="+63 912 345 6789"
                          value={studentData.contactNumber}
                          onChange={(e) => setStudentData({ ...studentData, contactNumber: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="host-establishment" className="text-sm font-medium text-gray-700">Host Establishment</Label>
                        <Input
                          id="host-establishment"
                          type="text"
                          placeholder="Company Name"
                          value={studentData.hostEstablishment}
                          onChange={(e) => setStudentData({ ...studentData, hostEstablishment: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="123 Street, City, Province"
                        value={studentData.address}
                        onChange={(e) => setStudentData({ ...studentData, address: e.target.value })}
                        required
                        className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-password" className="text-sm font-medium text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="student-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={studentData.password}
                            onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                            required
                            className="pl-10 pr-10 h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="student-confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="student-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={studentData.confirmPassword}
                            onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                            required
                            className="pl-10 pr-10 h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Create Student Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="department" className="space-y-6 mt-6">
                  <form onSubmit={handleDepartmentRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="dept-email"
                            type="email"
                            placeholder="department@example.com"
                            value={departmentData.email}
                            onChange={(e) => setDepartmentData({ ...departmentData, email: e.target.value })}
                            required
                            className="pl-10 h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">Contact Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="contact@example.com"
                          value={departmentData.contactEmail}
                          onChange={(e) => setDepartmentData({ ...departmentData, contactEmail: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-name" className="text-sm font-medium text-gray-700">Department Name</Label>
                        <Input
                          id="dept-name"
                          type="text"
                          placeholder="Computer Science Department"
                          value={departmentData.departmentName}
                          onChange={(e) => setDepartmentData({ ...departmentData, departmentName: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dept-code" className="text-sm font-medium text-gray-700">Department Code</Label>
                        <Input
                          id="dept-code"
                          type="text"
                          placeholder="CS"
                          value={departmentData.departmentCode}
                          onChange={(e) => setDepartmentData({ ...departmentData, departmentCode: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="advisor-name" className="text-sm font-medium text-gray-700">OJT Advisor Name</Label>
                        <Input
                          id="advisor-name"
                          type="text"
                          placeholder="Dr. Jane Smith"
                          value={departmentData.ojtAdvisorName}
                          onChange={(e) => setDepartmentData({ ...departmentData, ojtAdvisorName: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="advisor-position" className="text-sm font-medium text-gray-700">Advisor Position</Label>
                        <Input
                          id="advisor-position"
                          type="text"
                          placeholder="Department Head"
                          value={departmentData.ojtAdvisorPosition}
                          onChange={(e) => setDepartmentData({ ...departmentData, ojtAdvisorPosition: e.target.value })}
                          required
                          className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="Building, Room Number"
                        value={departmentData.location}
                        onChange={(e) => setDepartmentData({ ...departmentData, location: e.target.value })}
                        required
                        className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-number" className="text-sm font-medium text-gray-700">Contact Number</Label>
                      <Input
                        id="contact-number"
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={departmentData.contactNumber}
                        onChange={(e) => setDepartmentData({ ...departmentData, contactNumber: e.target.value })}
                        required
                        className="h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-password" className="text-sm font-medium text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="dept-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={departmentData.password}
                            onChange={(e) => setDepartmentData({ ...departmentData, password: e.target.value })}
                            required
                            className="pl-10 pr-10 h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dept-confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="dept-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={departmentData.confirmPassword}
                            onChange={(e) => setDepartmentData({ ...departmentData, confirmPassword: e.target.value })}
                            required
                            className="pl-10 pr-10 h-10 bg-white border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Create Department Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600 w-full">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© 2024 Southern Leyte State University</p>
            <p className="mt-1">OJT Tracking System</p>
          </div>
        </div>
      </div>
    </>
  );
}
