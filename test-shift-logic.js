// Test script to verify time-based shift logic
// This can be run in the browser console to test different time scenarios

// Mock the current time for testing
function testShiftLogic(testHour, testMinute, shiftType) {
  const originalDate = Date;
  const mockDate = new Date(2024, 0, 15, testHour, testMinute, 0); // Jan 15, 2024 at test time
  
  // Mock Date constructor
  global.Date = function() {
    return mockDate;
  };
  global.Date.now = function() {
    return mockDate.getTime();
  };
  global.Date.prototype = originalDate.prototype;
  
  console.log(`\n=== Testing ${shiftType} shift at ${testHour}:${testMinute.toString().padStart(2, '0')} ===`);
  
  // Test the time-based logic (simplified version)
  const currentTime = testHour * 60 + testMinute;
  
  const getShiftTimes = (type) => {
    switch (type) {
      case 'regular':
        return {
          morningStart: 7 * 60,    // 7:00 AM
          morningEnd: 12 * 60,     // 12:00 PM
          afternoonStart: 13 * 60, // 1:00 PM
          afternoonEnd: 17 * 60,   // 5:00 PM
        };
      case 'morning':
        return {
          morningStart: 7 * 60,
          morningEnd: 12 * 60,
        };
      case 'afternoon':
        return {
          afternoonStart: 13 * 60,
          afternoonEnd: 17 * 60,
        };
      default:
        return {};
    }
  };
  
  const isShiftTimeWindowPassed = (shift, shiftTimes) => {
    switch (shift) {
      case 'morning':
        return shiftTimes.morningEnd && currentTime > shiftTimes.morningEnd;
      case 'afternoon':
        return shiftTimes.afternoonEnd && currentTime > shiftTimes.afternoonEnd;
      default:
        return false;
    }
  };
  
  const getCurrentActiveShift = (type, shiftTimes) => {
    if (type === 'regular') {
      if (currentTime >= shiftTimes.morningStart && currentTime <= shiftTimes.morningEnd) {
        return 'morning';
      }
      if (currentTime >= shiftTimes.afternoonStart && currentTime <= shiftTimes.afternoonEnd) {
        return 'afternoon';
      }
    } else if (type === 'morning') {
      if (currentTime >= shiftTimes.morningStart && currentTime <= shiftTimes.morningEnd) {
        return 'morning';
      }
    } else if (type === 'afternoon') {
      if (currentTime >= shiftTimes.afternoonStart && currentTime <= shiftTimes.afternoonEnd) {
        return 'afternoon';
      }
    }
    return null;
  };
  
  const shiftTimes = getShiftTimes(shiftType);
  const activeShift = getCurrentActiveShift(shiftType, shiftTimes);
  const morningExpired = isShiftTimeWindowPassed('morning', shiftTimes);
  const afternoonExpired = isShiftTimeWindowPassed('afternoon', shiftTimes);
  
  console.log(`Current Time: ${testHour}:${testMinute.toString().padStart(2, '0')}`);
  console.log(`Active Shift: ${activeShift || 'None'}`);
  console.log(`Morning Shift Expired: ${morningExpired}`);
  console.log(`Afternoon Shift Expired: ${afternoonExpired}`);
  
  // Simulate getNextClockAction logic
  let nextAction = null;
  
  if (shiftType === 'regular') {
    if (!morningExpired) {
      nextAction = { action: 'morningIn', label: 'Clock In', shift: 'Morning' };
    } else if (!afternoonExpired) {
      nextAction = { action: 'afternoonIn', label: 'Clock In', shift: 'Afternoon' };
    } else {
      nextAction = { action: null, label: 'Shift Time Expired', shift: 'All' };
    }
  } else if (shiftType === 'morning') {
    if (!morningExpired) {
      nextAction = { action: 'morningIn', label: 'Clock In', shift: 'Morning' };
    } else {
      nextAction = { action: null, label: 'Shift Time Expired', shift: 'Morning' };
    }
  } else if (shiftType === 'afternoon') {
    if (!afternoonExpired) {
      nextAction = { action: 'afternoonIn', label: 'Clock In', shift: 'Afternoon' };
    } else {
      nextAction = { action: null, label: 'Shift Time Expired', shift: 'Afternoon' };
    }
  }
  
  console.log(`Next Action: ${nextAction ? `${nextAction.label} - ${nextAction.shift}` : 'None'}`);
  
  // Restore original Date
  global.Date = originalDate;
}

// Test scenarios
console.log('=== TIME-BASED SHIFT LOGIC TEST ===');

// Test Regular shift scenarios
testShiftLogic(8, 0, 'regular');   // 8:00 AM - Should show Morning In
testShiftLogic(12, 30, 'regular');  // 12:30 PM - Should show Afternoon In
testShiftLogic(17, 30, 'regular');  // 5:30 PM - Should show Expired

// Test Morning shift scenarios
testShiftLogic(8, 0, 'morning');    // 8:00 AM - Should show Morning In
testShiftLogic(12, 30, 'morning');  // 12:30 PM - Should show Expired

// Test Afternoon shift scenarios
testShiftLogic(12, 30, 'afternoon'); // 12:30 PM - Should show Afternoon In
testShiftLogic(17, 30, 'afternoon'); // 5:30 PM - Should show Expired

console.log('\n=== TEST COMPLETE ===');
