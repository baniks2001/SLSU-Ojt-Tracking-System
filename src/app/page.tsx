'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Clock, Award, ArrowRight, CheckCircle, Shield, TrendingUp, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Navigation */}
        <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Image 
                    src="/logo.png" 
                    alt="SLSU Logo" 
                    width={24}
                    height={24}
                    className="rounded"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">SLSU OJT Tracking</h1>
                  <p className="text-xs text-gray-600">Daily Time Record System</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-700 hover:text-sky-600 transition-colors font-medium">Features</Link>
                <Link href="#how-it-works" className="text-gray-700 hover:text-sky-600 transition-colors font-medium">How It Works</Link>
                <Link href="#testimonials" className="text-gray-700 hover:text-sky-600 transition-colors font-medium">Testimonials</Link>
                <Link href="/login" className="text-sky-600 hover:text-sky-700 font-medium">Sign In</Link>
                <Button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Get Started
                </Button>
              </nav>
              <div className="md:hidden">
                <Button variant="ghost" size="sm" className="text-sky-600">
                  Menu
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl shadow-2xl mb-8 animate-fadeIn">
                <Image 
                  src="/logo.png" 
                  alt="SLSU Logo" 
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fadeIn">
                Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">OJT Journey</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fadeIn">
                Southern Leyte State University's comprehensive OJT tracking system. Monitor your daily time records, 
                manage schedules, and stay connected with your department - all in one modern platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn">
                <Button 
                  onClick={handleGetStarted}
                  className="h-14 px-8 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 text-lg"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 border-2 border-sky-500 text-sky-600 hover:bg-sky-50 font-semibold rounded-2xl transition-all duration-200 text-lg"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-2">500+</div>
                <p className="text-gray-600 font-medium">Active Students</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-2">50+</div>
                <p className="text-gray-600 font-medium">Partner Companies</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-2">15+</div>
                <p className="text-gray-600 font-medium">Departments</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-2">99%</div>
                <p className="text-gray-600 font-medium">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage your OJT experience efficiently and effectively
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Time Tracking</h3>
                  <p className="text-gray-600">Easy clock-in/clock-out with biometric verification and automatic time calculation</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Schedule Management</h3>
                  <p className="text-gray-600">Flexible scheduling with shift management and change request functionality</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Reliable</h3>
                  <p className="text-gray-600">Enterprise-grade security with data encryption and regular backups</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Department Integration</h3>
                  <p className="text-gray-600">Seamless coordination between students, departments, and partner companies</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Tracking</h3>
                  <p className="text-gray-600">Comprehensive reports and analytics for monitoring OJT progress</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
                  <p className="text-gray-600">Live dashboards and insights for better decision making</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with our OJT tracking system in just a few simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Account</h3>
                <p className="text-gray-600">Register as a student or department with your official credentials</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Profile</h3>
                <p className="text-gray-600">Fill in your personal and professional information</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Tracking</h3>
                <p className="text-gray-600">Begin clocking in/out and managing your OJT activities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor Progress</h3>
                <p className="text-gray-600">Track your hours and generate reports for completion</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-sky-500 to-sky-600 border-0 rounded-3xl shadow-2xl">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Start Your OJT Journey?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join hundreds of students who are already tracking their OJT experience with our modern system
                </p>
                <Button 
                  onClick={handleGetStarted}
                  className="h-14 px-8 bg-white text-sky-600 hover:bg-gray-50 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 text-lg"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <Image 
                      src="/logo.png" 
                      alt="SLSU Logo" 
                      width={24}
                      height={24}
                      className="rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">SLSU OJT</h3>
                    <p className="text-sm text-gray-400">Tracking System</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Southern Leyte State University's comprehensive OJT tracking and management system.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>ojt@slsu.edu.ph</li>
                  <li>+63 123 456 7890</li>
                  <li>Southern Leyte State University</li>
                  <li>Hinundayan, Southern Leyte</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 Southern Leyte State University. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
