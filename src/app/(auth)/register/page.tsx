'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  BookOpen, 
  MapPin,
  Eye,
  EyeOff,
  GraduationCap,
  Users
} from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Student form state
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
    hostEstablishment: '',
    contactNumber: '',
    address: ''
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentCode: '',
    departmentName: '',
    position: '',
    contactNumber: '',
    officeAddress: ''
  });

  // Options for dropdowns
  const [courses] = useState([
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Engineering',
    'Bachelor of Science in Information Systems'
  ]);

  const [departments] = useState([
    'College of Computer Studies',
    'College of Engineering',
    'College of Business Administration',
    'College of Arts and Sciences'
  ]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentForm,
          accountType: 'student'
        }),
      });

      if (response.ok) {
        router.push('/login?message=Registration successful! Please login.');
      } else {
        const data = await response.json();
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...departmentForm,
          accountType: 'department'
        }),
      });

      if (response.ok) {
        router.push('/login?message=Registration successful! Please login.');
      } else {
        const data = await response.json();
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Register for SLSU OJT Tracking System</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Register
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose your account type and fill in the required information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="student" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 font-medium transition-all duration-200"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Student
                </TabsTrigger>
                <TabsTrigger 
                  value="department" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 font-medium transition-all duration-200"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Department
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-6 mt-6">
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-id" className="text-sm font-medium text-gray-700">
                        Student ID
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="student-id"
                          placeholder="Enter student ID"
                          value={studentForm.studentId}
                          onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                          required
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="Enter email address"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          required
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-firstname" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="student-firstname"
                        placeholder="Enter first name"
                        value={studentForm.firstName}
                        onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-lastname" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="student-lastname"
                        placeholder="Enter last name"
                        value={studentForm.lastName}
                        onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-course" className="text-sm font-medium text-gray-700">
                        Course
                      </Label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          id="student-course"
                          value={studentForm.course}
                          onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                          required
                          className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                        >
                          <option value="">Select course</option>
                          {courses.map((course) => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-department" className="text-sm font-medium text-gray-700">
                        Department
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          id="student-department"
                          value={studentForm.department}
                          onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                          required
                          className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="student-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          required
                          className="pl-10 pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-confirm-password" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="student-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={studentForm.confirmPassword}
                          onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                          required
                          className="pl-10 pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-contact" className="text-sm font-medium text-gray-700">
                        Contact Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="student-contact"
                          placeholder="Enter contact number"
                          value={studentForm.contactNumber}
                          onChange={(e) => setStudentForm({ ...studentForm, contactNumber: e.target.value })}
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-establishment" className="text-sm font-medium text-gray-700">
                        Host Establishment
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="student-establishment"
                          placeholder="Enter host establishment"
                          value={studentForm.hostEstablishment}
                          onChange={(e) => setStudentForm({ ...studentForm, hostEstablishment: e.target.value })}
                          required
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-address" className="text-sm font-medium text-gray-700">
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="student-address"
                        placeholder="Enter address"
                        value={studentForm.address}
                        onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                        className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Student Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="department" className="space-y-6 mt-6">
                <form onSubmit={handleDepartmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dept-code" className="text-sm font-medium text-gray-700">
                        Department Code
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="dept-code"
                          placeholder="Enter department code"
                          value={departmentForm.departmentCode}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, departmentCode: e.target.value })}
                          required
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="dept-email"
                          type="email"
                          placeholder="Enter email address"
                          value={departmentForm.email}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })}
                          required
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-firstname" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="dept-firstname"
                        placeholder="Enter first name"
                        value={departmentForm.firstName}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, firstName: e.target.value })}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-lastname" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="dept-lastname"
                        placeholder="Enter last name"
                        value={departmentForm.lastName}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, lastName: e.target.value })}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-name" className="text-sm font-medium text-gray-700">
                        Department Name
                      </Label>
                      <Input
                        id="dept-name"
                        placeholder="Enter department name"
                        value={departmentForm.departmentName}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, departmentName: e.target.value })}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-position" className="text-sm font-medium text-gray-700">
                        Position
                      </Label>
                      <Input
                        id="dept-position"
                        placeholder="Enter position"
                        value={departmentForm.position}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, position: e.target.value })}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="dept-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          value={departmentForm.password}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                          required
                          className="pl-10 pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-confirm-password" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="dept-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={departmentForm.confirmPassword}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, confirmPassword: e.target.value })}
                          required
                          className="pl-10 pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dept-contact" className="text-sm font-medium text-gray-700">
                        Contact Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="dept-contact"
                          placeholder="Enter contact number"
                          value={departmentForm.contactNumber}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, contactNumber: e.target.value })}
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept-office" className="text-sm font-medium text-gray-700">
                        Office Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="dept-office"
                          placeholder="Enter office address"
                          value={departmentForm.officeAddress}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, officeAddress: e.target.value })}
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Department Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <div className="flex justify-center pt-6 px-6">
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </div>
          </div>
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
