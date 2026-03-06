'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  Building, 
  GraduationCap, 
  Calendar, 
  Clock,
  TrendingUp,
  Award,
  Shield
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Redirect to appropriate dashboard
          if (parsedUser.accountType === 'student') {
            router.push('/student/dashboard');
          } else if (parsedUser.accountType === 'admin') {
            router.push('/admin/dashboard');
          } else if (parsedUser.accountType === 'department') {
            router.push('/department/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)' }}>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap style={{ width: '1.5rem', height: '1.5rem', color: '#ffffff' }} />
                </div>
                <div style={{ display: 'none' }}>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>SLSU OJT Tracking</h1>
                  <p style={{ fontSize: '0.75rem', color: '#dbeafe', margin: 0 }}>Southern Leyte State University</p>
                </div>
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/login">
                <button className="btn btn-primary">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="btn btn-outline">
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, marginBottom: '1rem', display: 'inline-block' }}>v2.0</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            OJT Tracking System
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '48rem', margin: '0 auto 2rem' }}>
            Comprehensive monitoring and management system for student On-the-Job Training experiences at Southern Leyte State University
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login">
              <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Get Started
              </button>
            </Link>
            <Link href="/register">
              <button className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 1rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Key Features</h2>
            <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Everything you need for effective OJT management</p>
          </div>
          
          <div className="responsive-grid">
            <div className="card">
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Time Tracking</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Automated attendance monitoring with shift management and real-time tracking
                </p>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• Clock in/out functionality</li>
                  <li>• Shift scheduling</li>
                  <li>• Attendance reports</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Users style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Student Management</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Comprehensive student profiles and progress tracking throughout OJT
                </p>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• Student profiles</li>
                  <li>• Progress monitoring</li>
                  <li>• Performance analytics</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#f3e8ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Building style={{ width: '1.5rem', height: '1.5rem', color: '#9333ea' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Department Portal</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Department-level oversight and coordination of OJT programs
                </p>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• Department analytics</li>
                  <li>• Student supervision</li>
                  <li>• Report generation</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#fed7aa', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#ea580c' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Schedule Management</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Flexible scheduling system for different shift types and work arrangements
                </p>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• Multiple shift types</li>
                  <li>• Schedule requests</li>
                  <li>• Approval workflows</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#fecaca', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Award style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Performance Tracking</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Detailed performance metrics and evaluation tools for students
                </p>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• Performance metrics</li>
                  <li>• Evaluation tools</li>
                  <li>• Achievement tracking</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#e0e7ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#4f46e5' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Admin Controls</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Comprehensive administrative tools for system management
                </p>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• User management</li>
                  <li>• System configuration</li>
                  <li>• Security controls</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '5rem 1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>500+</div>
              <div style={{ color: '#6b7280' }}>Active Students</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem' }}>50+</div>
              <div style={{ color: '#6b7280' }}>Partner Companies</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#9333ea', marginBottom: '0.5rem' }}>15+</div>
              <div style={{ color: '#6b7280' }}>Departments</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem' }}>98%</div>
              <div style={{ color: '#6b7280' }}>Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: '#ffffff', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap style={{ width: '1.5rem', height: '1.5rem', color: '#ffffff' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>SLSU OJT Tracking</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Professional OJT Management</p>
                </div>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Southern Leyte State University - OJT Tracking System v2.0
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Sign In
                </Link>
                <Link href="/register" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Register
                </Link>
                <Link href="/about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  About
                </Link>
                <Link href="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Contact
                </Link>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/help" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Help Center
                </Link>
                <Link href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Privacy Policy
                </Link>
                <Link href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Terms of Service
                </Link>
                <Link href="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              © 2026 Southern Leyte State University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
