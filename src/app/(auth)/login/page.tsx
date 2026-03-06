'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful!');

        switch (data.user.accountType) {
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'department':
            router.push('/department/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'superadmin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/login');
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Logo and Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <Logo size="large" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Sign in to your SLSU OJT Tracking account</p>
        </div>

        {/* Login Card */}
        <div className="card animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div className="card-header" style={{ paddingBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>
              Sign In
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Enter your credentials to access your account
            </p>
          </div>
          
          <div className="card-content" style={{ paddingTop: '0' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#9ca3af' }} />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', height: '2.75rem', backgroundColor: '#ffffff', borderColor: '#d1d5db', transition: 'all 200ms' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#9ca3af' }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: '2.75rem', backgroundColor: '#ffffff', borderColor: '#d1d5db', transition: 'all 200ms' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    {showPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary hover-lift"
                style={{ width: '100%', height: '2.75rem', fontWeight: '500', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transition: 'all 200ms' }}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 className="loading" style={{ height: '1rem', width: '1rem' }} />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            {/* Register Link */}
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none', transition: 'color 200ms' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
                >
                  Register here
                </Link>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link 
                href="/forgot-password" 
                style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none', transition: 'color 200ms' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }} className="animate-fade-in">
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2026 Southern Leyte State University - OJT Tracking System
          </p>
          <p style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: '0.25rem' }}>
            Built with modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
}
