'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Camera, Clock, LogIn, LogOut, Calendar, CheckCircle, Lock } from 'lucide-react';

interface ClockInOutProps {
  studentId: string;
  shiftType: 'regular' | 'regular-split' | 'graveyard' | 'custom' | 'morning' | 'afternoon' | 'evening' | 'midnight' | '1shift' | '2shift';
  shiftConfig?: {
    morningStart?: string;
    morningEnd?: string;
    afternoonStart?: string;
    afternoonEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    description?: string;
    shiftCount?: number; // Number of shifts for custom schedules
  };
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
  shiftType: string;
  totalHours: number;
}

export default function ClockInOut({ studentId, shiftType, shiftConfig, isAccepted }: ClockInOutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [shiftExpired, setShiftExpired] = useState(false);
  const [expiredShiftInfo, setExpiredShiftInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchTodayRecord = useCallback(async () => {
    if (!studentId) {
      console.warn('Student ID is undefined, skipping attendance fetch');
      return;
    }
    
    try {
      const response = await fetch(`/api/attendance?studentId=${studentId}&date=${new Date().toISOString().split('T')[0]}`);
      if (response.ok) {
        const data = await response.json();
        if (data.attendance && data.attendance.length > 0) {
          setTodayRecord(data.attendance[0]);
        } else {
          setTodayRecord(null);
        }
      }
    } catch (error) {
      console.error('Error fetching today record:', error);
    }
  }, [studentId]);

  // Check for shift expiration
  const checkShiftExpiration = useCallback(async () => {
    if (!todayRecord) return;

    // Check if any shift is active and has expired
    const shifts = ['morning', 'afternoon', 'evening'];
    
    for (const shift of shifts) {
      const clockInTime = todayRecord[`${shift}In` as keyof AttendanceRecord];
      const clockOutTime = todayRecord[`${shift}Out` as keyof AttendanceRecord];
      
      if (clockInTime && !clockOutTime) {
        try {
          const response = await fetch('/api/shift-management', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
          });
          
          const data = await response.json();
          
          if (data.requiresAction) {
            setShiftExpired(true);
            setExpiredShiftInfo(data);
            toast.error(`Shift expired: ${data.message}`);
            
            // Refresh attendance record
            fetchTodayRecord();
          }
        } catch (error) {
          console.error('Error checking shift expiration:', error);
        }
      }
    }
  }, [studentId, todayRecord, fetchTodayRecord]);

  useEffect(() => {
    fetchTodayRecord();
  }, [studentId, fetchTodayRecord]);

  // Update nextAction when todayRecord changes
  useEffect(() => {
    setNextAction(getNextClockAction());
  }, [todayRecord, shiftType]);

  // Update shift status based on current time
  useEffect(() => {
    const updateShiftStatus = () => {
      const status = getShiftStatus();
      if (status) {
        setCurrentShiftStatus(status);
      }
      // Also update nextAction when shift status changes
      setNextAction(getNextClockAction());
      
      // Check for shift expiration
      checkShiftExpiration();
    };

    // Only update on client side
    if (typeof window !== 'undefined') {
      updateShiftStatus();
    }
    
    // Update every 5 seconds for real-time tracking
    const interval = setInterval(updateShiftStatus, 5000);
    return () => clearInterval(interval);
  }, [shiftType, todayRecord, checkShiftExpiration]); // Add dependencies

  // Update time-based values only on client side to prevent hydration issues
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setNextAction(getNextClockAction());
    };
    
    if (typeof window !== 'undefined') {
      updateDateTime(); // Set initial values only on client
    }
    
    // Update every 5 seconds for more responsive time tracking
    const interval = setInterval(updateDateTime, 5000);
    return () => clearInterval(interval);
  }, [todayRecord, shiftType]);

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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera not supported in this browser. Please try using Chrome, Firefox, or Safari.');
      return;
    }

    try {
      // Stop any existing stream first
      stopCamera();
      
      // Request camera with device default and standard quality
      let constraints = {
        video: {
          width: { min: 320, ideal: 640 },
          height: { min: 240, ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };
      
      // Try to get user's preferred camera first
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Use first available camera or default to user-facing
        if (videoDevices.length > 0) {
          const deviceId = videoDevices[0].deviceId;
          (constraints.video as any).deviceId = deviceId;
        }
      } catch (deviceError) {
        console.warn('Could not enumerate devices:', deviceError);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // If high quality fails, fallback to standard quality
      if (!stream) {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          
          if (fallbackStream && videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
            setShowCamera(true);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback camera failed:', fallbackError);
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Play video explicitly
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Video play error:', playError);
          toast.error('Could not start camera preview. Please try again.');
          stopCamera();
          return;
        }
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setShowCamera(true);
        };
        
        // Handle video errors
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          toast.error('Camera error occurred. Please try again.');
          stopCamera();
        };
        
        // Set a timeout in case video doesn't load
        setTimeout(() => {
          if (!showCamera) {
            console.warn('Video loading timeout');
            setShowCamera(true); // Show camera anyway to allow user to try capture
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera permission denied. Please allow camera access in your browser settings and refresh.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found. Please connect a camera and try again.');
        } else if (error.name === 'NotReadableError') {
          toast.error('Camera is already in use by another application. Please close other apps using the camera.');
        } else if (error.name === 'OverconstrainedError') {
          toast.error('Camera constraints cannot be satisfied. Trying with lower quality...');
          try {
            setShowCamera(true);
          } catch (fallbackError) {
            toast.error('Could not access camera with any settings.');
          }
        } else {
          toast.error('Could not access camera: ' + error.message);
        }
      } else {
        toast.error('Could not access camera. Please check camera permissions.');
      }
    }
  };

  const stopCamera = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
    } finally {
      setShowCamera(false);
    }
  };

  const handleClockAction = async (action: string) => {
    if (!isAccepted) {
      toast.error('Your account is pending approval');
      return;
    }

    setCurrentAction(action);
    setShowCameraModal(true);
    // Don't start camera immediately - wait for user to click start button
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Check if video is ready and has valid dimensions
        if (!video.readyState || video.readyState < 2) {
          toast.error('Camera is still loading. Please wait a moment and try again.');
          return;
        }
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          toast.error('Camera is not ready yet. Please wait a moment and try again.');
          return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Flip the image horizontally to match mirror effect
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          
          // Draw the video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Reset transform
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          
          // Convert to JPEG with good quality
          const imageData = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedImage(imageData);
          
          // Close verification modal and open review modal
          setShowCameraModal(false);
          setShowReviewModal(true);
          stopCamera();
        } else {
          toast.error('Could not capture image. Please try again.');
        }
      } catch (error) {
        console.error('Capture error:', error);
        toast.error('Failed to capture photo. Please try again.');
      }
    } else {
      toast.error('Camera not available. Please try again.');
    }
  };

  const executeClockAction = async (action: string) => {
    if (!capturedImage) {
      toast.error('Please capture your image first');
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
        const actionText = action.replace(/([A-Z])/g, ' $1').trim();
        toast.success(`${actionText} recorded successfully!`);
        setCapturedImage(null);
        setShowCamera(false);
        setShowCameraModal(false);
        setShowReviewModal(false);
        stopCamera();
        setCurrentAction(null);
        setCountdown(5); // Start 5 second countdown
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

  const getShiftTimes = useCallback(() => {
    switch (shiftType) {
      case 'regular':
        return {
          morningStart: 6 * 60,    // 6:00 AM
          morningEnd: 12 * 60,     // 12:00 PM (Noon)
          afternoonStart: 12 * 60, // 12:00 PM (Noon)
          afternoonEnd: 18 * 60,   // 6:00 PM
        };
      case 'morning':
        return {
          morningStart: 6 * 60,    // 6:00 AM
          morningEnd: 12 * 60,     // 12:00 PM (Noon)
        };
      case 'afternoon':
        return {
          afternoonStart: 12 * 60, // 12:00 PM (Noon)
          afternoonEnd: 18 * 60,   // 6:00 PM
        };
      case 'evening':
        return {
          eveningStart: 18 * 60,   // 6:00 PM
          eveningEnd: 0 * 60,      // 12:00 AM (Midnight)
        };
      case 'midnight':
        return {
          eveningStart: 0 * 60,     // 12:00 AM (Midnight)
          eveningEnd: 6 * 60,      // 6:00 AM
        };
      case '1shift':
        return {
          morningStart: 6 * 60,    // 6:00 AM
          morningEnd: 18 * 60,     // 6:00 PM
        };
      case '2shift':
        return {
          morningStart: 6 * 60,    // 6:00 AM
          morningEnd: 12 * 60,     // 12:00 PM (Noon)
          afternoonStart: 12 * 60, // 12:00 PM (Noon)
          afternoonEnd: 18 * 60,   // 6:00 PM
        };
      case 'graveyard':
        return {
          eveningStart: 22 * 60,   // 10:00 PM
          eveningEnd: 6 * 60,      // 6:00 AM (next day)
        };
      case 'custom':
        if (shiftConfig) {
          return {
            morningStart: shiftConfig.morningStart ? parseInt(shiftConfig.morningStart.split(':')[0]) * 60 + parseInt(shiftConfig.morningStart.split(':')[1]) : undefined,
            morningEnd: shiftConfig.morningEnd ? parseInt(shiftConfig.morningEnd.split(':')[0]) * 60 + parseInt(shiftConfig.morningEnd.split(':')[1]) : undefined,
            afternoonStart: shiftConfig.afternoonStart ? parseInt(shiftConfig.afternoonStart.split(':')[0]) * 60 + parseInt(shiftConfig.afternoonStart.split(':')[1]) : undefined,
            afternoonEnd: shiftConfig.afternoonEnd ? parseInt(shiftConfig.afternoonEnd.split(':')[0]) * 60 + parseInt(shiftConfig.afternoonEnd.split(':')[1]) : undefined,
            eveningStart: shiftConfig.eveningStart ? parseInt(shiftConfig.eveningStart.split(':')[0]) * 60 + parseInt(shiftConfig.eveningStart.split(':')[1]) : undefined,
            eveningEnd: shiftConfig.eveningEnd ? parseInt(shiftConfig.eveningEnd.split(':')[0]) * 60 + parseInt(shiftConfig.eveningEnd.split(':')[1]) : undefined,
          };
        }
        break;
      default:
        return {
          morningStart: 6 * 60,
          morningEnd: 12 * 60,
          afternoonStart: 12 * 60,
          afternoonEnd: 18 * 60,
        };
    }
    return {};
  }, [shiftType]);

  // Helper function to format time with AM/PM
  const formatTimeWithAMPM = (minutes: number | undefined) => {
    if (minutes === undefined) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Helper function to get shift display name
  const getShiftDisplayName = (shift: string) => {
    const shiftNames = {
      morning: 'Morning (6:00 AM - 12:00 PM)',
      afternoon: 'Afternoon (12:00 PM - 6:00 PM)', 
      evening: 'Evening (6:00 PM - 12:00 AM)',
      midnight: 'Midnight (12:00 AM - 6:00 AM)',
      graveyard: 'Graveyard (10:00 PM - 6:00 AM)',
      '1shift': 'Single Shift (6:00 AM - 6:00 PM)',
      '2shift': 'Two Shifts (6:00 AM-12:00 PM, 12:00 PM-6:00 PM)',
      regular: 'Regular (6:00 AM - 6:00 PM)',
      custom: shiftConfig?.description || 'Custom Shift'
    };
    return shiftNames[shift as keyof typeof shiftNames] || shift;
  };

  const isShiftTimeWindowPassed = useCallback((shift: 'morning' | 'afternoon' | 'evening') => {
    // Prevent hydration issues by running only on client
    if (typeof window === 'undefined') return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const shiftTimes = getShiftTimes();
    
    // Add 1-hour grace period (60 minutes) to shift end times
    switch (shift) {
      case 'morning':
        return shiftTimes.morningEnd && currentTime > (shiftTimes.morningEnd + 60);
      case 'afternoon':
        return shiftTimes.afternoonEnd && currentTime > (shiftTimes.afternoonEnd + 60);
      case 'evening':
        return shiftTimes.eveningEnd && currentTime > (shiftTimes.eveningEnd + 60);
      default:
        return false;
    }
  }, [getShiftTimes]);

  const getCurrentActiveShift = () => {
    // Prevent hydration issues by running only on client
    if (typeof window === 'undefined') return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const shiftTimes = getShiftTimes();
    
    // Check if we're in graveyard shift (crosses midnight)
    if (shiftType === 'graveyard' && shiftTimes.eveningStart !== undefined) {
      if (currentTime >= shiftTimes.eveningStart || currentTime < (shiftTimes.eveningEnd || 6 * 60)) {
        return 'evening';
      }
    }
    
    // Check if we're in evening shift (crosses midnight)
    if (shiftType === 'evening' && shiftTimes.eveningStart !== undefined && shiftTimes.eveningEnd !== undefined) {
      if (currentTime >= shiftTimes.eveningStart || currentTime < shiftTimes.eveningEnd) {
        return 'evening';
      }
    }
    
    // Check if we're in midnight shift (crosses midnight)
    if (shiftType === 'midnight' && shiftTimes.eveningStart !== undefined && shiftTimes.eveningEnd !== undefined) {
      if (currentTime >= shiftTimes.eveningStart || currentTime < shiftTimes.eveningEnd) {
        return 'evening';
      }
    }
    
    // Check morning shift (with 1-hour grace period)
    if (shiftTimes.morningStart !== undefined && shiftTimes.morningEnd !== undefined) {
      if (currentTime >= shiftTimes.morningStart && currentTime <= (shiftTimes.morningEnd + 60)) {
        return 'morning';
      }
    }
    
    // Check afternoon shift (with 1-hour grace period)
    if (shiftTimes.afternoonStart !== undefined && shiftTimes.afternoonEnd !== undefined) {
      if (currentTime >= shiftTimes.afternoonStart && currentTime <= (shiftTimes.afternoonEnd + 60)) {
        return 'afternoon';
      }
    }
    
    // Check evening shift (non-graveyard, with 1-hour grace period)
    if (shiftTimes.eveningStart !== undefined && shiftTimes.eveningEnd !== undefined && 
        shiftType !== 'graveyard' && shiftType !== 'evening' && shiftType !== 'midnight') {
      if (currentTime >= shiftTimes.eveningStart && currentTime <= (shiftTimes.eveningEnd + 60)) {
        return 'evening';
      }
    }
    
    return null; // No active shift
  };

  const getShiftStatus = useCallback(() => {
    // Prevent hydration issues by running only on client
    if (typeof window === 'undefined') return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const shiftTimes = getShiftTimes();
    
    let status: 'active' | 'upcoming' | 'completed' | 'expired' | 'locked' | 'morning-locked' | 'afternoon-locked' = 'active';
    let currentShift: string | null = null;
    let nextShiftTime: string | null = null;
    let timeRemaining: string | null = null;
    let isLocked = false;
    let isMorningLocked = false;
    let isAfternoonLocked = false;

    // Helper function to format minutes to time
    const formatMinutes = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    };

    // Helper function to calculate time difference
    const getTimeRemaining = (targetTime: number) => {
      const diff = targetTime - currentTime;
      if (diff > 0) {
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
      }
      return null;
    };

    // Enhanced shift logic with separate lock states
    switch (shiftType) {
      case 'graveyard':
        if (shiftTimes.eveningStart !== undefined && shiftTimes.eveningEnd !== undefined) {
          // Graveyard shift crosses midnight (7 PM - 7 AM next day)
          if (currentTime >= shiftTimes.eveningStart || currentTime < (shiftTimes.eveningEnd || 7 * 60)) {
            currentShift = 'Evening';
            status = 'active';
            timeRemaining = getTimeRemaining((shiftTimes.eveningEnd || 7 * 60) + (currentTime < (shiftTimes.eveningEnd || 7 * 60) ? 24 * 60 : 0));
          } else {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.eveningStart);
            timeRemaining = getTimeRemaining(shiftTimes.eveningStart);
          }
        }
        break;

      case 'evening':
        if (shiftTimes.eveningStart !== undefined && shiftTimes.eveningEnd !== undefined) {
          // Evening shift crosses midnight (6 PM - 12 AM next day)
          if (currentTime >= shiftTimes.eveningStart || currentTime < shiftTimes.eveningEnd) {
            currentShift = 'Evening';
            status = 'active';
            timeRemaining = getTimeRemaining(shiftTimes.eveningEnd + (currentTime < shiftTimes.eveningEnd ? 24 * 60 : 0));
          } else {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.eveningStart);
            timeRemaining = getTimeRemaining(shiftTimes.eveningStart);
          }
        }
        break;

      case 'midnight':
        if (shiftTimes.eveningStart !== undefined && shiftTimes.eveningEnd !== undefined) {
          // Midnight shift crosses midnight (12 AM - 6 AM next day)
          if (currentTime >= shiftTimes.eveningStart || currentTime < shiftTimes.eveningEnd) {
            currentShift = 'Midnight';
            status = 'active';
            timeRemaining = getTimeRemaining(shiftTimes.eveningEnd + (currentTime < shiftTimes.eveningEnd ? 24 * 60 : 0));
          } else {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.eveningStart + (currentTime > shiftTimes.eveningEnd ? 24 * 60 : 0));
            timeRemaining = getTimeRemaining(shiftTimes.eveningStart + (currentTime > shiftTimes.eveningEnd ? 24 * 60 : 0));
          }
        }
        break;

      case 'morning':
        if (shiftTimes.morningStart !== undefined && shiftTimes.morningEnd !== undefined) {
          if (currentTime >= shiftTimes.morningStart && currentTime <= (shiftTimes.morningEnd + 60)) {
            currentShift = 'Morning';
            status = 'active';
            timeRemaining = getTimeRemaining(shiftTimes.morningEnd + 60);
          } else if (currentTime < shiftTimes.morningStart) {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.morningStart);
            timeRemaining = getTimeRemaining(shiftTimes.morningStart);
          } else {
            // Morning shift has expired
            currentShift = 'Morning';
            status = 'morning-locked';
            isMorningLocked = true;
            timeRemaining = null;
          }
        }
        break;

      case 'afternoon':
        if (shiftTimes.afternoonStart !== undefined && shiftTimes.afternoonEnd !== undefined) {
          if (currentTime >= shiftTimes.afternoonStart && currentTime <= (shiftTimes.afternoonEnd + 60)) {
            currentShift = 'Afternoon';
            status = 'active';
            timeRemaining = getTimeRemaining(shiftTimes.afternoonEnd + 60);
          } else if (currentTime < shiftTimes.afternoonStart) {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.afternoonStart);
            timeRemaining = getTimeRemaining(shiftTimes.afternoonStart);
          } else {
            // Afternoon shift has expired
            currentShift = 'Afternoon';
            status = 'afternoon-locked';
            isAfternoonLocked = true;
            timeRemaining = null;
          }
        }
        break;

      case '1shift':
        if (shiftTimes.morningStart !== undefined && shiftTimes.morningEnd !== undefined) {
          if (currentTime >= shiftTimes.morningStart && currentTime <= (shiftTimes.morningEnd + 60)) {
            currentShift = 'Shift';
            status = 'active';
            timeRemaining = getTimeRemaining(shiftTimes.morningEnd + 60);
          } else if (currentTime < shiftTimes.morningStart) {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.morningStart);
            timeRemaining = getTimeRemaining(shiftTimes.morningStart);
          } else {
            // Single shift has expired
            currentShift = 'Shift';
            status = 'locked';
            isLocked = true;
            timeRemaining = null;
          }
        }
        break;

      case 'regular':
      case '2shift':
        // Enhanced logic for regular/2shift types
        if (shiftTimes.morningStart !== undefined && shiftTimes.morningEnd !== undefined &&
            currentTime >= shiftTimes.morningStart && currentTime <= (shiftTimes.morningEnd + 60)) {
          // Morning shift is active
          currentShift = 'Morning';
          status = 'active';
          timeRemaining = getTimeRemaining(shiftTimes.morningEnd + 60);
        } else if (shiftTimes.morningStart !== undefined && currentTime < shiftTimes.morningStart) {
          // Morning shift is upcoming
          status = 'upcoming';
          nextShiftTime = formatMinutes(shiftTimes.morningStart);
          timeRemaining = getTimeRemaining(shiftTimes.morningStart);
        } else if (shiftTimes.morningEnd !== undefined && currentTime >= shiftTimes.morningEnd + 60 && 
                   shiftTimes.afternoonStart !== undefined && currentTime < shiftTimes.afternoonStart) {
          // Morning shift completed, afternoon shift is upcoming
          if (shiftTimes.afternoonStart !== undefined && shiftTimes.afternoonEnd !== undefined) {
            status = 'upcoming';
            nextShiftTime = formatMinutes(shiftTimes.afternoonStart);
            timeRemaining = getTimeRemaining(shiftTimes.afternoonStart);
            // Morning shift is now locked
            isMorningLocked = true;
          } else {
            // No afternoon shift available, morning shift is completed
            currentShift = null;
            status = 'completed';
            isLocked = true;
            timeRemaining = null;
          }
        } else if (shiftTimes.afternoonStart !== undefined && shiftTimes.afternoonEnd !== undefined &&
                   currentTime >= shiftTimes.afternoonStart && currentTime <= (shiftTimes.afternoonEnd + 60)) {
          // Afternoon shift is active
          currentShift = 'Afternoon';
          status = 'active';
          timeRemaining = getTimeRemaining(shiftTimes.afternoonEnd + 60);
          // Morning shift should be locked now
          isMorningLocked = true;
        } else if (shiftTimes.afternoonEnd !== undefined && currentTime >= shiftTimes.afternoonEnd + 60) {
          // Afternoon shift has expired
          currentShift = 'Afternoon';
          status = 'afternoon-locked';
          isAfternoonLocked = true;
          timeRemaining = null;
          // Morning shift should also be locked
          isMorningLocked = true;
        } else {
          // Both shifts completed
          currentShift = null;
          status = 'completed';
          isLocked = true;
          timeRemaining = null;
        }
        break;

      default:
        status = 'expired';
        isLocked = true;
        break;
    }

    return {
      shift: currentShift,
      status,
      nextShiftTime,
      timeRemaining,
      isLocked,
      isMorningLocked,
      isAfternoonLocked
    };
  }, [shiftType, getShiftTimes]);

  const getNextClockAction = useCallback(() => {
    const shiftStatus = getShiftStatus();
    
    // If shift is locked, prevent any clock actions
    if (shiftStatus && shiftStatus.isLocked) {
      return { action: null, label: 'Shift Locked', type: 'locked', shift: shiftStatus.shift || 'Expired' };
    }
    
    // For single shift types, only show their specific shifts
    if (shiftType === 'morning') {
      if (!todayRecord?.morningIn) {
        if (isShiftTimeWindowPassed('morning')) {
          return { action: null, label: 'Shift Time Expired', type: 'expired', shift: 'Morning' };
        }
        return { action: 'morningIn', label: 'Clock In', type: 'in', shift: 'Morning' };
      }
      if (!todayRecord?.morningOut) {
        return { action: 'morningOut', label: 'Clock Out', type: 'out', shift: 'Morning' };
      }
      return { action: null, label: 'Completed', type: 'completed', shift: 'Morning' };
    }
    
    if (shiftType === 'afternoon') {
      if (!todayRecord?.morningIn) { // Using morningIn for afternoon shift
        if (isShiftTimeWindowPassed('afternoon')) {
          return { action: null, label: 'Shift Time Expired', type: 'expired', shift: 'Afternoon' };
        }
        return { action: 'afternoonIn', label: 'Clock In', type: 'in', shift: 'Afternoon' };
      }
      if (!todayRecord?.morningOut) { // Using morningOut for afternoon shift
        return { action: 'afternoonOut', label: 'Clock Out', type: 'out', shift: 'Afternoon' };
      }
      return { action: null, label: 'Completed', type: 'completed', shift: 'Afternoon' };
    }
    
    if (shiftType === '1shift') {
      if (!todayRecord?.morningIn) {
        if (isShiftTimeWindowPassed('morning')) {
          return { action: null, label: 'Shift Time Expired', type: 'expired', shift: 'Shift' };
        }
        return { action: 'morningIn', label: 'Clock In', type: 'in', shift: 'Shift' };
      }
      if (!todayRecord?.morningOut) {
        return { action: 'morningOut', label: 'Clock Out', type: 'out', shift: 'Shift' };
      }
      return { action: null, label: 'Completed', type: 'completed', shift: 'Shift' };
    }
    
    if (shiftType === 'graveyard') {
      if (!todayRecord?.eveningIn) {
        return { action: 'eveningIn', label: 'Clock In', type: 'in', shift: 'Evening' };
      }
      if (!todayRecord?.eveningOut) {
        return { action: 'eveningOut', label: 'Clock Out', type: 'out', shift: 'Evening' };
      }
      return { action: null, label: 'Completed', type: 'completed', shift: 'Evening' };
    }
    
    // For regular and 2shift types
    // First check if morning shift is completed
    if (todayRecord?.morningIn) {
      if (!todayRecord?.morningOut) {
        return { action: 'morningOut', label: 'Clock Out', type: 'out', shift: 'Morning' };
      }
      
      // Morning is completed, check afternoon shift
      if (shiftType === 'regular' || shiftType === '2shift') {
        if (!todayRecord?.afternoonIn) {
          if (isShiftTimeWindowPassed('afternoon')) {
            return { action: null, label: 'Shift Time Expired', type: 'expired', shift: 'Afternoon' };
          }
          return { action: 'afternoonIn', label: 'Clock In', type: 'in', shift: 'Afternoon' };
        }
        
        if (!todayRecord?.afternoonOut) {
          return { action: 'afternoonOut', label: 'Clock Out', type: 'out', shift: 'Afternoon' };
        }
      }
      
      // All actions completed for today
      return { action: null, label: 'Completed', type: 'completed', shift: 'All' };
    }
    
    // Morning shift not started yet
    if (!todayRecord?.morningIn) {
      if (isShiftTimeWindowPassed('morning')) {
        // If morning shift time has passed, move to afternoon if it's available
        if (shiftType === '2shift' || shiftType === 'regular') {
          if (!todayRecord?.afternoonIn) {
            if (isShiftTimeWindowPassed('afternoon')) {
              return { action: null, label: 'Shift Time Expired', type: 'expired', shift: 'All' };
            }
            return { action: 'afternoonIn', label: 'Clock In', type: 'in', shift: 'Afternoon' };
          }
        } else {
          return { action: null, label: 'Shift Time Expired', type: 'expired', shift: 'Morning' };
        }
      }
      return { action: 'morningIn', label: 'Clock In', type: 'in', shift: 'Morning' };
    }
    
    // All actions completed for today
    return { action: null, label: 'Completed', type: 'completed', shift: 'All' };
  }, [shiftType, todayRecord, getShiftStatus]);

  
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [nextAction, setNextAction] = useState<{
    action: string | null;
    label: string;
    type: string;
    shift?: string;
  }>({
    action: null,
    label: 'Loading...',
    type: 'loading',
    shift: 'Loading'
  });
  
  // Initialize nextAction on client side only
  useEffect(() => {
    setNextAction(getNextClockAction());
  }, [todayRecord, shiftType]);
  const [currentShiftStatus, setCurrentShiftStatus] = useState<{
    shift: string | null;
    status: 'active' | 'upcoming' | 'completed' | 'expired' | 'locked' | 'morning-locked' | 'afternoon-locked';
    nextShiftTime: string | null;
    timeRemaining: string | null;
    isLocked: boolean;
    isMorningLocked: boolean;
    isAfternoonLocked: boolean;
  }>({
    shift: null,
    status: 'active' as const, // Start with active state instead of loading
    nextShiftTime: null,
    timeRemaining: null,
    isLocked: false,
    isMorningLocked: false,
    isAfternoonLocked: false
  });
  
  // Initialize shift status on client side only
  useEffect(() => {
    const status = getShiftStatus();
    if (status) {
      setCurrentShiftStatus(status);
    }
  }, [shiftType]);

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Shift Expiration Warning */}
      {shiftExpired && expiredShiftInfo && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Shift Expired</h3>
                <p className="text-sm text-orange-700 mt-1">
                  {expiredShiftInfo.message}
                </p>
                {expiredShiftInfo.newShift && (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      Current Shift: {expiredShiftInfo.newShift}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Current Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shift Type */}
          <Badge variant="outline" className="text-base px-3 py-1">
            {getShiftDisplayName(shiftType)}
          </Badge>
          
          {/* Current Shift Status */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Shift Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {currentShiftStatus.status === 'locked' && (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-red-700">
                        Shift Locked - {currentShiftStatus.shift}
                      </span>
                    </>
                  )}
                  {currentShiftStatus.status === 'morning-locked' && (
                    <>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-orange-700">
                        Morning Shift Locked
                      </span>
                    </>
                  )}
                  {currentShiftStatus.status === 'afternoon-locked' && (
                    <>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-orange-700">
                        Afternoon Shift Locked
                      </span>
                    </>
                  )}
                  {currentShiftStatus.status === 'active' && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-700">
                        {currentShiftStatus.shift} Shift - Active
                      </span>
                    </>
                  )}
                  {currentShiftStatus.status === 'upcoming' && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-yellow-700">
                        Upcoming - {currentShiftStatus.nextShiftTime}
                      </span>
                    </>
                  )}
                  {currentShiftStatus.status === 'completed' && (
                    <>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="font-semibold text-gray-700">
                        Shift Completed
                      </span>
                    </>
                  )}
                  {currentShiftStatus.status === 'expired' && (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-semibold text-red-700">
                        Shift Time Expired
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Time Remaining */}
            {currentShiftStatus.timeRemaining && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className="text-lg font-bold text-[#003366]">
                  {currentShiftStatus.timeRemaining}
                </p>
              </div>
            )}
            
            {/* Next Shift Time */}
            {currentShiftStatus.nextShiftTime && currentShiftStatus.status === 'upcoming' && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">Next Shift Starts At</p>
                <p className="text-lg font-bold text-[#003366]">
                  {currentShiftStatus.nextShiftTime}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unified Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{nextAction?.shift || 'Loading'} Shift</h3>
              <p className="text-3xl font-bold text-[#003366]">{nextAction?.label || 'Loading...'}</p>
            </div>
            
            {nextAction?.action && !currentShiftStatus.isLocked && 
  ((currentShiftStatus.shift === 'Morning' && !currentShiftStatus.isMorningLocked) ||
   (currentShiftStatus.shift === 'Afternoon' && !currentShiftStatus.isAfternoonLocked) ||
   (currentShiftStatus.shift === 'Evening' && !currentShiftStatus.isLocked) ||
   (currentShiftStatus.shift === 'Shift' && !currentShiftStatus.isLocked) ||
   (currentShiftStatus.shift === null && !currentShiftStatus.isLocked)) && (
              <Button
                onClick={() => handleClockAction(nextAction.action!)}
                disabled={isLoading || countdown > 0 || !isAccepted}
                className={`w-full max-w-xs ${nextAction?.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-900 hover:bg-blue-800'} text-white`}
                size="lg"
              >
                {nextAction?.type === 'in' ? <LogIn className="h-5 w-5 mr-2" /> : <LogOut className="h-5 w-5 mr-2" />}
                {nextAction?.label}
              </Button>
            )}
            
            {(currentShiftStatus.isLocked || 
  (currentShiftStatus.isMorningLocked && currentShiftStatus.shift === 'Morning') ||
  (currentShiftStatus.isAfternoonLocked && currentShiftStatus.shift === 'Afternoon')) && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">
                      {currentShiftStatus.status === 'morning-locked' && 'Morning Shift Locked'}
                      {currentShiftStatus.status === 'afternoon-locked' && 'Afternoon Shift Locked'}
                      {currentShiftStatus.status === 'locked' && 'Shift Locked'}
                    </p>
                    <p className="text-sm text-red-600">
                      {currentShiftStatus.status === 'morning-locked' && 'Morning shift time has expired (8:00 AM - 12:00 PM). No clock actions allowed for morning shift.'}
                      {currentShiftStatus.status === 'afternoon-locked' && 'Afternoon shift time has expired (1:00 PM - 5:00 PM). No clock actions allowed for afternoon shift.'}
                      {currentShiftStatus.status === 'locked' && `${currentShiftStatus.shift} shift time has expired. No clock actions allowed.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {nextAction?.type === 'expired' && (
              <div className="text-center space-y-2">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  {nextAction?.label}
                </Badge>
                <p className="text-sm text-gray-600">
                  The time window for this shift has passed
                </p>
              </div>
            )}
            
            {!nextAction?.action && nextAction?.type !== 'expired' && (
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  All shifts completed for today
                </Badge>
              </div>
            )}

            {/* Current Time and Shift Status */}
            <div className="text-center space-y-2 mt-4">
              <p className="text-sm text-gray-600">
                Current Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {getCurrentActiveShift() && (
                <Badge variant="outline" className="text-xs">
                  Active Shift: {getCurrentActiveShift()}
                </Badge>
              )}
            </div>
          </div>

          {/* Today's Progress */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Today&apos;s Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Morning Shift */}
              {(shiftType === 'regular' || shiftType === '2shift' || shiftType === 'morning' || shiftType === '1shift') && (
                <div className="text-center space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Morning</p>
                    {isShiftTimeWindowPassed('morning') && !todayRecord?.morningIn && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                    {!isShiftTimeWindowPassed('morning') && !todayRecord?.morningIn && (
                      <Badge variant="secondary" className="text-xs">Available</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Badge variant={todayRecord?.morningIn ? "default" : "outline"} className="w-full">
                      In: {formatTime(todayRecord?.morningIn)}
                    </Badge>
                    <Badge variant={todayRecord?.morningOut ? "default" : "outline"} className="w-full">
                      Out: {formatTime(todayRecord?.morningOut)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {shiftType === '2shift' ? '7:00 AM - 11:00 AM (12:00 PM expiry)' : '7:00 AM - 12:00 PM (1:00 PM expiry)'}
                  </p>
                </div>
              )}
              
              {/* Afternoon Shift */}
              {(shiftType === 'regular' || shiftType === '2shift' || shiftType === 'afternoon') && (
                <div className="text-center space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Afternoon</p>
                    {isShiftTimeWindowPassed('afternoon') && !todayRecord?.afternoonIn && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                    {!isShiftTimeWindowPassed('afternoon') && !todayRecord?.afternoonIn && (
                      <Badge variant="secondary" className="text-xs">Available</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Badge variant={todayRecord?.afternoonIn ? "default" : "outline"} className="w-full">
                      In: {formatTime(todayRecord?.afternoonIn)}
                    </Badge>
                    <Badge variant={todayRecord?.afternoonOut ? "default" : "outline"} className="w-full">
                      Out: {formatTime(todayRecord?.afternoonOut)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {shiftType === '2shift' ? '12:00 PM - 5:00 PM (6:00 PM expiry)' : '1:00 PM - 5:00 PM (6:00 PM expiry)'}
                  </p>
                </div>
              )}

              {/* Single Shift */}
              {shiftType === '1shift' && (
                <div className="text-center space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Shift</p>
                    {isShiftTimeWindowPassed('morning') && !todayRecord?.morningIn && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                    {!isShiftTimeWindowPassed('morning') && !todayRecord?.morningIn && (
                      <Badge variant="secondary" className="text-xs">Available</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Badge variant={todayRecord?.morningIn ? "default" : "outline"} className="w-full">
                      In: {formatTime(todayRecord?.morningIn)}
                    </Badge>
                    <Badge variant={todayRecord?.morningOut ? "default" : "outline"} className="w-full">
                      Out: {formatTime(todayRecord?.morningOut)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">7:00 AM - 5:00 PM (6:00 PM expiry)</p>
                </div>
              )}

              {/* Graveyard Shift */}
              {shiftType === 'graveyard' && (
                <div className="text-center space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Graveyard</p>
                    {!todayRecord?.eveningIn && (
                      <Badge variant="secondary" className="text-xs">Available</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Badge variant={todayRecord?.eveningIn ? "default" : "outline"} className="w-full">
                      In: {formatTime(todayRecord?.eveningIn)}
                    </Badge>
                    <Badge variant={todayRecord?.eveningOut ? "default" : "outline"} className="w-full">
                      Out: {formatTime(todayRecord?.eveningOut)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">7:00 PM - 7:00 AM (8:00 AM expiry)</p>
                </div>
              )}
            </div>
          </div>

          {!isAccepted && (
            <p className="text-center text-yellow-600 text-sm">
              Your account is pending approval. You cannot clock in/out until approved.
            </p>
          )}
          
          {countdown > 0 && (
            <p className="text-center text-blue-600 text-sm">
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

      {/* Camera Modal - Verify Your Identity */}
      <Dialog open={showCameraModal} onOpenChange={setShowCameraModal}>
        <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-1rem)] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-t-2xl border-b border-gray-200 pb-4">
            <DialogTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span>Verify Your Identity</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6">
            {/* Date and Time Display */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 text-center border border-sky-200">
              <div className="flex items-center justify-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-sky-600" />
                <span className="font-medium text-lg">{currentDateTime}</span>
              </div>
            </div>

            {/* Camera Section */}
            {!showCamera && !capturedImage && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                    <Camera className="h-10 w-10 text-sky-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Access Required</h3>
                  <p className="text-gray-600 text-base mb-6">Please allow camera access to verify your identity for clocking {currentAction === 'clockIn' ? 'in' : 'out'}.</p>
                </div>
                <Button 
                  onClick={startCamera} 
                  className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl shadow-lg transition-all duration-200"
                >
                  <Camera className="h-5 w-5 mr-3" />
                  Start Camera
                </Button>
              </div>
            )}

            {showCamera && (
              <div className="space-y-6">
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                    onError={(e) => {
                      console.error('Video error:', e);
                      toast.error('Camera error occurred. Please try again.');
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Camera Active
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6">
                  <Button 
                    onClick={captureImage} 
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl shadow-lg transition-all duration-200"
                  >
                    <Camera className="h-5 w-5 mr-3" />
                    Capture Photo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setShowCameraModal(false); stopCamera(); }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Image Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-1rem)] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl border-b border-gray-200 pb-4">
            <DialogTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span>Review Your Photo</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6">
            {/* Date and Time Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
              <div className="flex items-center justify-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-medium text-lg">{currentDateTime}</span>
              </div>
            </div>

            {/* Captured Image Review */}
            {capturedImage && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-2 text-sm sm:text-base">✓ Photo Captured Successfully</p>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-green-500">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Please review your photo and confirm to {nextAction?.label?.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => { 
                      setCapturedImage(null); 
                      setShowReviewModal(false);
                      setShowCameraModal(true);
                    }}
                  >
                    Retake Photo
                  </Button>
                  <Button 
                    onClick={() => handleClockAction(nextAction?.action!)}
                    className="px-4 py-2 text-sm sm:px-6 sm:py-3 bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : `Confirm ${nextAction?.label}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
