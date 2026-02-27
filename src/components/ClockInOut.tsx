'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, Clock, LogIn, LogOut } from 'lucide-react';

interface ClockInOutProps {
  studentId: string;
  shiftType: 'regular' | 'graveyard';
  isAccepted: boolean;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  morningIn?: string;
  morningOut?: string;
  afternoonIn?: string;
  afternoonOut?: string;
  eveningIn?: string;
  eveningOut?: string;
  shiftType: 'regular' | 'graveyard';
  totalHours: number;
}

export default function ClockInOut({ studentId, shiftType, isAccepted }: ClockInOutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchTodayRecord();
  }, [studentId]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const fetchTodayRecord = async () => {
    try {
      const response = await fetch(`/api/attendance?studentId=${studentId}&date=${new Date().toISOString().split('T')[0]}`);
      if (response.ok) {
        const data = await response.json();
        if (data.attendance && data.attendance.length > 0) {
          setTodayRecord(data.attendance[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching today record:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      toast.error('Could not access camera. Please allow camera permissions.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleClockAction = async (action: string) => {
    if (!capturedImage) {
      toast.error('Please capture your image first');
      return;
    }

    if (!isAccepted) {
      toast.error('Your account is pending approval');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          action,
          imageData: capturedImage,
          shiftType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${action.replace(/([A-Z])/g, ' $1').trim()} recorded successfully!`);
        setCapturedImage(null);
        setShowCamera(false);
        setCountdown(10); // Start 10 second countdown
        fetchTodayRecord();
      } else {
        toast.error(data.error || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('Clock action error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getClockButtonState = (action: string) => {
    if (!todayRecord) return false;
    switch (action) {
      case 'morningIn': return !!todayRecord.morningIn;
      case 'morningOut': return !!todayRecord.morningOut;
      case 'afternoonIn': return !!todayRecord.afternoonIn;
      case 'afternoonOut': return !!todayRecord.afternoonOut;
      case 'eveningIn': return !!todayRecord.eveningIn;
      case 'eveningOut': return !!todayRecord.eveningOut;
      default: return false;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Image Capture Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCamera && !capturedImage && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You must capture your image before clocking in or out</p>
              <Button onClick={startCamera} className="bg-[#003366] hover:bg-[#002244]">
                <Camera className="h-4 w-4 mr-2" />
                Open Camera
              </Button>
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button onClick={captureImage} className="bg-[#003366] hover:bg-[#002244]">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => { setCapturedImage(null); startCamera(); }}>
                  Retake Photo
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Clock Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Clock In / Clock Out</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shiftType === 'regular' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Morning In</p>
                <Badge variant="outline" className="mb-2">
                  {formatTime(todayRecord?.morningIn)}
                </Badge>
                <Button
                  onClick={() => handleClockAction('morningIn')}
                  disabled={isLoading || countdown > 0 || getClockButtonState('morningIn') || !capturedImage || !isAccepted}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Clock In
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Morning Out</p>
                <Badge variant="outline" className="mb-2">
                  {formatTime(todayRecord?.morningOut)}
                </Badge>
                <Button
                  onClick={() => handleClockAction('morningOut')}
                  disabled={isLoading || countdown > 0 || getClockButtonState('morningOut') || !capturedImage || !isAccepted || !todayRecord?.morningIn}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Clock Out
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Afternoon In</p>
                <Badge variant="outline" className="mb-2">
                  {formatTime(todayRecord?.afternoonIn)}
                </Badge>
                <Button
                  onClick={() => handleClockAction('afternoonIn')}
                  disabled={isLoading || countdown > 0 || getClockButtonState('afternoonIn') || !capturedImage || !isAccepted}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Clock In
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Afternoon Out</p>
                <Badge variant="outline" className="mb-2">
                  {formatTime(todayRecord?.afternoonOut)}
                </Badge>
                <Button
                  onClick={() => handleClockAction('afternoonOut')}
                  disabled={isLoading || countdown > 0 || getClockButtonState('afternoonOut') || !capturedImage || !isAccepted || !todayRecord?.afternoonIn}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Clock Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Evening In</p>
                <Badge variant="outline" className="mb-2">
                  {formatTime(todayRecord?.eveningIn)}
                </Badge>
                <Button
                  onClick={() => handleClockAction('eveningIn')}
                  disabled={isLoading || countdown > 0 || getClockButtonState('eveningIn') || !capturedImage || !isAccepted}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Clock In
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Evening Out</p>
                <Badge variant="outline" className="mb-2">
                  {formatTime(todayRecord?.eveningOut)}
                </Badge>
                <Button
                  onClick={() => handleClockAction('eveningOut')}
                  disabled={isLoading || countdown > 0 || getClockButtonState('eveningOut') || !capturedImage || !isAccepted || !todayRecord?.eveningIn}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            </div>
          )}

          {!isAccepted && (
            <p className="text-center text-yellow-600 mt-4 text-sm">
              Your account is pending approval. You cannot clock in/out until approved.
            </p>
          )}
          {countdown > 0 && (
            <p className="text-center text-blue-600 mt-4 text-sm">
              Please wait {countdown} seconds before next clock action...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      {todayRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Morning Hours</p>
                <p className="text-lg font-bold">
                  {todayRecord.morningIn && todayRecord.morningOut
                    ? ((new Date(todayRecord.morningOut).getTime() - new Date(todayRecord.morningIn).getTime()) / (1000 * 60 * 60)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Afternoon Hours</p>
                <p className="text-lg font-bold">
                  {todayRecord.afternoonIn && todayRecord.afternoonOut
                    ? ((new Date(todayRecord.afternoonOut).getTime() - new Date(todayRecord.afternoonIn).getTime()) / (1000 * 60 * 60)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Evening Hours</p>
                <p className="text-lg font-bold">
                  {todayRecord.eveningIn && todayRecord.eveningOut
                    ? ((new Date(todayRecord.eveningOut).getTime() - new Date(todayRecord.eveningIn).getTime()) / (1000 * 60 * 60)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-lg font-bold text-[#003366]">
                  {todayRecord.totalHours?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
