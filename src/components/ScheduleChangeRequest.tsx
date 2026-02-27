'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, Calendar, Send, History } from 'lucide-react';

interface ScheduleChangeRequestProps {
  studentId: string;
  currentShiftType: string;
  departmentId: string;
}

interface ScheduleRequest {
  _id: string;
  currentShiftType: string;
  requestedShiftType: string;
  requestedShiftConfig: {
    description?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  comments?: string;
}

export default function ScheduleChangeRequest({ studentId, currentShiftType, departmentId }: ScheduleChangeRequestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    requestedShiftType: 'custom',
    eveningStart: '19:00',
    eveningEnd: '07:00',
    reason: '',
  });

  // Fetch existing requests
  useEffect(() => {
    fetchRequests();
  }, [studentId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/schedule-requests?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requestedShiftConfig = {
        type: 'custom',
        eveningStart: formData.eveningStart,
        eveningEnd: formData.eveningEnd,
        description: `Custom shift: ${formData.eveningStart} to ${formData.eveningEnd}`,
      };

      const response = await fetch('/api/schedule-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          currentShiftType,
          requestedShiftType: formData.requestedShiftType,
          requestedShiftConfig,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Schedule change request submitted successfully!');
        setShowForm(false);
        setFormData({
          requestedShiftType: 'custom',
          eveningStart: '19:00',
          eveningEnd: '07:00',
          reason: '',
        });
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Schedule Change Request</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Current Schedule: <strong>{currentShiftType === 'regular' ? 'Regular (7AM-12PM / 1PM-5PM)' : 'Graveyard (7PM-7AM)'}</strong>
            </p>
          </div>

          {!showForm ? (
            <div className="space-y-4">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#003366] hover:bg-[#002244]"
              >
                <Send className="h-4 w-4 mr-2" />
                Request Schedule Change
              </Button>

              {requests.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Request History
                  </h4>
                  <div className="space-y-2">
                    {requests.map((request) => (
                      <div key={request._id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{request.requestedShiftConfig?.description || 'Custom Shift'}</p>
                            <p className="text-gray-500 text-xs">{new Date(request.requestedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-gray-600">{request.reason}</p>
                        {request.comments && (
                          <p className="text-gray-500 mt-2 text-xs">Admin: {request.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shift-type">Requested Shift Type</Label>
                <Select
                  value={formData.requestedShiftType}
                  onValueChange={(value) => setFormData({ ...formData, requestedShiftType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                    <SelectItem value="graveyard">Graveyard (7PM - 7AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.requestedShiftType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="evening-start">Start Time</Label>
                    <Input
                      id="evening-start"
                      type="time"
                      value={formData.eveningStart}
                      onChange={(e) => setFormData({ ...formData, eveningStart: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="evening-end">End Time</Label>
                    <Input
                      id="evening-end"
                      type="time"
                      value={formData.eveningEnd}
                      onChange={(e) => setFormData({ ...formData, eveningEnd: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Schedule Change</Label>
                <Textarea
                  id="reason"
                  placeholder="Please explain why you need to change your schedule..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-[#003366] hover:bg-[#002244]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
