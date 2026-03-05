// Test script to verify grace period logic
// This can be run in browser console to test different time scenarios with grace periods

function testGracePeriodLogic(testHour, testMinute, shiftType) {
  console.log(`\n=== Testing ${shiftType} shift at ${testHour}:${testMinute.toString().padStart(2, '0')} ===`);
  
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
      case '2shift':
        return {
          morningStart: 7 * 60,    // 7:00 AM
          morningEnd: 11 * 60,     // 11:00 AM
          afternoonStart: 12 * 60, // 12:00 PM
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
    // Add 1-hour grace period (60 minutes) to shift end times
    switch (shift) {
      case 'morning':
        return shiftTimes.morningEnd && currentTime > (shiftTimes.morningEnd + 60);
      case 'afternoon':
        return shiftTimes.afternoonEnd && currentTime > (shiftTimes.afternoonEnd + 60);
      default:
        return false;
    }
  };
  
  const shiftTimes = getShiftTimes(shiftType);
  const morningExpired = isShiftTimeWindowPassed('morning', shiftTimes);
  const afternoonExpired = isShiftTimeWindowPassed('afternoon', shiftTimes);
  
  console.log(`Current Time: ${testHour}:${testMinute.toString().padStart(2, '0')}`);
  console.log(`Morning Shift Expired: ${morningExpired} (${shiftTimes.morningEnd ? (shiftTimes.morningEnd + 60) / 60 : 'N/A'}:00 expiry)`);
  console.log(`Afternoon Shift Expired: ${afternoonExpired} (${shiftTimes.afternoonEnd ? (shiftTimes.afternoonEnd + 60) / 60 : 'N/A'}:00 expiry)`);
  
  // Test button logic
  let nextAction = null;
  
  if (shiftType === 'regular') {
    if (!morningExpired) {
      nextAction = { action: 'morningIn', label: 'Clock In', shift: 'Morning' };
    } else if (!afternoonExpired) {
      nextAction = { action: 'afternoonIn', label: 'Clock In', shift: 'Afternoon' };
    } else {
      nextAction = { action: null, label: 'Shift Time Expired', shift: 'All' };
    }
  } else if (shiftType === '2shift') {
    if (!morningExpired) {
      nextAction = { action: 'morningIn', label: 'Clock In', shift: 'Morning' };
    } else if (!afternoonExpired) {
      nextAction = { action: 'afternoonIn', label: 'Clock In', shift: 'Afternoon' };
    } else {
      nextAction = { action: null, label: 'Shift Time Expired', shift: 'All' };
    }
  }
  
  console.log(`Next Action: ${nextAction ? `${nextAction.label} - ${nextAction.shift}` : 'None'}`);
}

// Test grace period scenarios
console.log('=== GRACE PERIOD LOGIC TEST ===');

// Test Regular shift with grace periods
testGracePeriodLogic(12, 30, 'regular');  // 12:30 PM - Should still allow morning clock out (grace period until 1:00 PM)
testGracePeriodLogic(13, 0, 'regular');   // 1:00 PM - Should switch to afternoon (morning grace period ended)
testGracePeriodLogic(17, 30, 'regular');  // 5:30 PM - Should still allow afternoon clock out (grace period until 6:00 PM)
testGracePeriodLogic(18, 30, 'regular');  // 6:30 PM - Should show expired (afternoon grace period ended)

// Test 2-shift with grace periods
testGracePeriodLogic(11, 30, '2shift');   // 11:30 AM - Should still allow morning clock out (grace period until 12:00 PM)
testGracePeriodLogic(12, 30, '2shift');  // 12:30 PM - Should switch to afternoon (morning grace period ended)
testGracePeriodLogic(17, 30, '2shift');  // 5:30 PM - Should still allow afternoon clock out (grace period until 6:00 PM)
testGracePeriodLogic(18, 30, '2shift');  // 6:30 PM - Should show expired (afternoon grace period ended)

// Test Morning shift with grace period
testGracePeriodLogic(12, 30, 'morning');  // 12:30 PM - Should still allow clock out (grace period until 1:00 PM)
testGracePeriodLogic(13, 30, 'morning');  // 1:30 PM - Should show expired (grace period ended)

// Test Afternoon shift with grace period
testGracePeriodLogic(17, 30, 'afternoon');  // 5:30 PM - Should still allow clock out (grace period until 6:00 PM)
testGracePeriodLogic(18, 30, 'afternoon');  // 6:30 PM - Should show expired (grace period ended)

console.log('\n=== GRACE PERIOD TEST COMPLETE ===');
console.log('\nSUMMARY:');
console.log('- All shifts now have 1-hour grace period after end time');
console.log('- Morning shifts (7:00-12:00) expire at 1:00 PM');
console.log('- Afternoon shifts (1:00-5:00) expire at 6:00 PM');
console.log('- 2-shift morning (7:00-11:00) expires at 12:00 PM');
console.log('- 2-shift afternoon (12:00-5:00) expires at 6:00 PM');
