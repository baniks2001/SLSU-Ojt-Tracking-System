'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Lock, Save } from 'lucide-react';

interface ProfileFormProps {
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    course: string;
    department: string;
    hostEstablishment: string;
    contactNumber?: string;
    address?: string;
    shiftType: 'regular' | 'graveyard' | 'custom';
    location?: string; // Optional, kept for backward compatibility
  };
  userEmail: string;
}

export default function ProfileForm({ student, userEmail }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactNumber: student.contactNumber || '',
    address: student.address || '',
    hostEstablishment: student.hostEstablishment || '',
    location: student.location || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: student._id,
          accountType: 'student',
          profileData: formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: student._id,
          updates: { password: passwordData.newPassword },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('An error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Student ID</Label>
              <p className="font-medium">{student.studentId}</p>
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <p className="font-medium">{userEmail}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600">First Name</Label>
              <p className="font-medium">{student.firstName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Middle Name</Label>
              <p className="font-medium">{student.middleName || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-600">Last Name</Label>
              <p className="font-medium">{student.lastName}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Course</Label>
              <p className="font-medium">{student.course}</p>
            </div>
            <div>
              <Label className="text-gray-600">Department</Label>
              <p className="font-medium">{student.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Information */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-number">Contact Number</Label>
                <Input
                  id="contact-number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="host-establishment">Host Establishment</Label>
              <Input
                id="host-establishment"
                value={formData.hostEstablishment}
                onChange={(e) => setFormData({ ...formData, hostEstablishment: e.target.value })}
                placeholder="Enter host establishment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isPasswordLoading}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
