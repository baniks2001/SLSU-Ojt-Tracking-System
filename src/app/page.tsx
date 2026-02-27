import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Shield, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold">SLSU OJT Tracking System</h1>
              <p className="text-xs text-blue-200">Southern Leyte State University</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-blue-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-[#003366] hover:bg-gray-100">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#003366] mb-4">
            Daily Time Record Tracking System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive On-the-Job Training (OJT) management system for Southern Leyte State University. 
            Track student attendance, manage departments, and streamline your OJT processes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-[#003366]" />
              </div>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Clock in and out with image capture. Support for regular and graveyard shifts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Manage student registrations, approvals, and monitor their OJT progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Secure Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Role-based access control with Student, Department, Admin, and Super Admin levels.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>DTR Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Generate and print Daily Time Record reports matching official Civil Service Form No. 48.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-8">
            Join thousands of students and departments already using our system.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-[#003366] hover:bg-[#002244]">
                Register Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Southern Leyte State University - OJT Tracking System</p>
          <p>Version 1.0 | © 2026 All Rights Reserved</p>
        </div>
      </main>
    </div>
  );
}
