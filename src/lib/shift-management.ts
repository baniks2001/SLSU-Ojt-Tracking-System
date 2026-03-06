// Shift configuration and management utilities

export interface ShiftConfig {
  name: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  gracePeriod: number; // minutes
  maxHours: number;   // maximum hours per shift
}

export const SHIFTS: Record<string, ShiftConfig> = {
  morning: {
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '12:00',
    gracePeriod: 60, // 1 hour grace period
    maxHours: 4
  },
  afternoon: {
    name: 'Afternoon Shift',
    startTime: '13:00',
    endTime: '17:00',
    gracePeriod: 30, // 30 minutes grace period
    maxHours: 4
  },
  evening: {
    name: 'Evening Shift',
    startTime: '17:00',
    endTime: '21:00',
    gracePeriod: 30, // 30 minutes grace period
    maxHours: 4
  }
};

// Get current active shift based on time
export function getActiveShift(currentTime: Date = new Date()): string | null {
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Morning shift: 08:00 - 12:00 + 60 min grace (until 13:00)
  if (currentMinutes >= 8 * 60 && currentMinutes < 13 * 60) {
    return 'morning';
  }
  
  // Afternoon shift: 13:00 - 17:00 + 30 min grace (until 17:30)
  if (currentMinutes >= 13 * 60 && currentMinutes < 17.5 * 60) {
    return 'afternoon';
  }
  
  // Evening shift: 17:00 - 21:00 + 30 min grace (until 21:30)
  if (currentMinutes >= 17 * 60 && currentMinutes < 21.5 * 60) {
    return 'evening';
  }

  return null; // No active shift
}

// Check if shift has expired - updated to handle grace periods properly
export function isShiftExpired(clockInTime: Date, currentTime: Date = new Date()): boolean {
  const shiftType = getActiveShift(new Date(clockInTime));
  if (!shiftType) return true;

  const shift = SHIFTS[shiftType];
  const shiftStartMinutes = parseTime(shift.startTime);
  const shiftEndMinutes = parseTime(shift.endTime);
  const graceEndMinutes = shiftEndMinutes + shift.gracePeriod;
  
  const clockInMinutes = clockInTime.getHours() * 60 + clockInTime.getMinutes();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // Shift expires if:
  // 1. Current time is beyond shift end + grace period
  // 2. AND it's been at least 1 minute since clock in (to prevent immediate expiration)
  const timeSinceClockIn = currentMinutes - clockInMinutes;
  
  return currentMinutes > graceEndMinutes && timeSinceClockIn > 0;
}

// Parse time string to minutes
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get next active shift
export function getNextShift(currentShift: string): string | null {
  const shiftOrder = ['morning', 'afternoon', 'evening'];
  const currentIndex = shiftOrder.indexOf(currentShift);
  
  if (currentIndex === -1) return null;
  
  const nextIndex = (currentIndex + 1) % shiftOrder.length;
  return shiftOrder[nextIndex];
}

// Calculate shift duration with grace period
export function calculateShiftDuration(clockIn: Date, clockOut: Date | null = null): {
  hours: number;
  minutes: number;
  isOvertime: boolean;
} {
  const endTime = clockOut || new Date();
  const clockInTime = clockIn.getTime();
  const endTimeMs = endTime.getTime();
  
  let durationMs = endTimeMs - clockInTime;
  let isOvertime = false;
  
  // Check if clock out is beyond grace period
  const shiftType = getActiveShift(clockIn);
  if (shiftType && clockOut) {
    const shift = SHIFTS[shiftType];
    const shiftEndMinutes = parseTime(shift.endTime);
    const graceEndMinutes = shiftEndMinutes + shift.gracePeriod;
    const clockOutMinutes = clockOut.getHours() * 60 + clockOut.getMinutes();
    
    if (clockOutMinutes > graceEndMinutes) {
      isOvertime = true;
    }
  }
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isOvertime };
}

// Handle shift expiration and transition
export function handleShiftExpiration(student: any): {
  shouldTransition: boolean;
  nextShift: string | null;
  expiredShift: string | null;
  message: string;
} {
  if (!student.attendance || student.attendance.length === 0) {
    return {
      shouldTransition: false,
      nextShift: null,
      expiredShift: null,
      message: 'No active attendance found'
    };
  }

  const latestAttendance = student.attendance[student.attendance.length - 1];
  const { clockIn, clockOut, shiftType } = latestAttendance;

  // If already clocked out, no transition needed
  if (clockOut) {
    return {
      shouldTransition: false,
      nextShift: null,
      expiredShift: null,
      message: 'Already clocked out'
    };
  }

  // Check if current shift has expired
  const currentTime = new Date();
  const expired = isShiftExpired(new Date(clockIn), currentTime);
  
  if (!expired) {
    return {
      shouldTransition: false,
      nextShift: null,
      expiredShift: null,
      message: 'Shift still active'
    };
  }

  // Shift has expired, calculate next shift
  const nextShift = getNextShift(shiftType);
  const activeShift = getActiveShift(currentTime);

  return {
    shouldTransition: true,
    nextShift: activeShift,
    expiredShift: shiftType,
    message: `Shift ${shiftType} has expired. Transitioning to ${activeShift} shift.`
  };
}
