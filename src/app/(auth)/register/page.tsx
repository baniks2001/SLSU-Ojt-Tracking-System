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
import { 
  User, 
  Building, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  GraduationCap,
  MapPin,
  UserCheck
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Logo and Title Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <Logo size="large" className="mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Create Account</h1>
          <p className="text-gray-600 text-lg">Register for SLSU OJT Tracking System</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-primary-900">
              Register
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose your account type and fill in the required information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="student" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700 text-gray-700 font-medium transition-all duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Student
                </TabsTrigger>
                <TabsTrigger 
                  value="department" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700 text-gray-700 font-medium transition-all duration-200"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Department
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700 text-gray-700 font-medium transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              {/* Student Registration */}
              <TabsContent value="student" className="space-y-6 mt-6">
                <form onSubmit={handleStudentSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <Label htmlFor="student-id" className="form-label">
                        <GraduationCap className="h-4 w-4 mr-2 inline" />
                        Student ID
                      </Label>
                      <Input
                        id="student-id"
                        placeholder="Enter student ID"
                        value={studentForm.studentId}
                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="first-name" className="form-label">
                        First Name
                      </Label>
                      <Input
                        id="first-name"
                        placeholder="Enter first name"
                        value={studentForm.firstName}
                        onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="last-name" className="form-label">
                        Last Name
                      </Label>
                      <Input
                        id="last-name"
                        placeholder="Enter last name"
                        value={studentForm.lastName}
                        onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="middle-name" className="form-label">
                        Middle Name (Optional)
                      </Label>
                      <Input
                        id="middle-name"
                        placeholder="Enter middle name"
                        value={studentForm.middleName}
                        onChange={(e) => setStudentForm({ ...studentForm, middleName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="email" className="form-label">
                      <Mail className="h-4 w-4 mr-2 inline" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <Label htmlFor="password" className="form-label">
                        <Lock className="h-4 w-4 mr-2 inline" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          required
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <Label htmlFor="confirm-password" className="form-label">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={studentForm.confirmPassword}
                          onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                          required
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="form-group">
                      <Label htmlFor="course" className="form-label">
                        Course
                      </Label>
                      <Select
                        value={studentForm.course}
                        onValueChange={(value) => setStudentForm({ ...studentForm, course: value })}
                        disabled={isLoadingCourses}
                      >
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select course"} />
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
                    <div className="form-group">
                      <Label htmlFor="department" className="form-label">
                        Department
                      </Label>
                      <Select
                        value={studentForm.department}
                        onValueChange={(value) => setStudentForm({ ...studentForm, department: value })}
                        disabled={isLoadingDepartments}
                      >
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder={isLoadingDepartments ? "Loading departments..." : "Select department"} />
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
                    <div className="form-group">
                      <Label htmlFor="campus" className="form-label">
                        <MapPin className="h-4 w-4 mr-2 inline" />
                        Campus
                      </Label>
                      <Select
                        value={studentForm.campus}
                        onValueChange={(value) => setStudentForm({ ...studentForm, campus: value })}
                        disabled={isLoadingCampuses}
                      >
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder={isLoadingCampuses ? "Loading campuses..." : "Select campus"} />
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

                  <div className="form-group">
                    <Label htmlFor="shift-type" className="form-label">
                      Shift Type
                    </Label>
                    <Select
                      value={studentForm.shiftType}
                      onValueChange={(value) => setStudentForm({ ...studentForm, shiftType: value as any })}
                    >
                      <SelectTrigger className="form-input">
                        <SelectValue placeholder="Select shift type" />
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
                    className="w-full h-11 btn-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Registering...</span>
                      </div>
                    ) : (
                      'Register as Student'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Department Registration */}
              <TabsContent value="department" className="space-y-6 mt-6">
                <form onSubmit={handleDepartmentSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <Label htmlFor="dept-name" className="form-label">
                        <Building className="h-4 w-4 mr-2 inline" />
                        Department Name
                      </Label>
                      <Input
                        id="dept-name"
                        placeholder="Enter department name"
                        value={departmentForm.departmentName}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, departmentName: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="dept-code" className="form-label">
                        Department Code
                      </Label>
                      <Input
                        id="dept-code"
                        placeholder="Enter department code"
                        value={departmentForm.departmentCode}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, departmentCode: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="location" className="form-label">
                      <MapPin className="h-4 w-4 mr-2 inline" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={departmentForm.location}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <Label htmlFor="advisor-name" className="form-label">
                        <UserCheck className="h-4 w-4 mr-2 inline" />
                        OJT Advisor Name
                      </Label>
                      <Input
                        id="advisor-name"
                        placeholder="Enter advisor name"
                        value={departmentForm.ojtAdvisorName}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorName: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="advisor-position" className="form-label">
                        OJT Advisor Position
                      </Label>
                      <Input
                        id="advisor-position"
                        placeholder="Enter advisor position"
                        value={departmentForm.ojtAdvisorPosition}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, ojtAdvisorPosition: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="dept-email" className="form-label">
                      <Mail className="h-4 w-4 mr-2 inline" />
                      Email Address
                    </Label>
                    <Input
                      id="dept-email"
                      type="email"
                      placeholder="Enter email"
                      value={departmentForm.email}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <Label htmlFor="dept-password" className="form-label">
                        <Lock className="h-4 w-4 mr-2 inline" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="dept-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={departmentForm.password}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                          required
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <Label htmlFor="dept-confirm-password" className="form-label">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="dept-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={departmentForm.confirmPassword}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, confirmPassword: e.target.value })}
                          required
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 btn-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Registering...</span>
                      </div>
                    ) : (
                      'Register as Department'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Registration */}
              <TabsContent value="admin" className="space-y-6 mt-6">
                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div className="form-group">
                    <Label htmlFor="admin-email" className="form-label">
                      <Mail className="h-4 w-4 mr-2 inline" />
                      Email Address
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <Label htmlFor="admin-password" className="form-label">
                        <Lock className="h-4 w-4 mr-2 inline" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          required
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <Label htmlFor="admin-confirm-password" className="form-label">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={adminForm.confirmPassword}
                          onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                          required
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 btn-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Registering...</span>
                      </div>
                    ) : (
                      'Register as Admin'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-6">
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-xs text-gray-500">
            © 2026 Southern Leyte State University - OJT Tracking System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Built with modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
}
