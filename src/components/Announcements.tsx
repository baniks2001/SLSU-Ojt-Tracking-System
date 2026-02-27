'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  department?: {
    departmentName: string;
  };
  postedBy: {
    email: string;
  };
  isForAll: boolean;
  isActive: boolean;
  createdAt: string;
}

interface AnnouncementsProps {
  studentId: string;
}

export default function Announcements({ studentId }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [studentId]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`/api/announcements?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        toast.error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('An error occurred while fetching announcements');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading announcements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Announcements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No announcements at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement._id} className="border-l-4 border-l-[#003366]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <div className="flex items-center space-x-2">
                        {announcement.isForAll ? (
                          <Badge variant="default">General</Badge>
                        ) : (
                          <Badge variant="outline">Department</Badge>
                        )}
                        {!announcement.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{announcement.postedBy?.email || 'Unknown'}</span>
                        </div>
                        {announcement.department && !announcement.isForAll && (
                          <Badge variant="outline" className="text-xs">
                            {announcement.department.departmentName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(announcement.createdAt), 'MMM dd, yyyy hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
