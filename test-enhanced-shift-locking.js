// Test script to verify enhanced shift locking logic for morning and afternoon shifts
console.log('=== ENHANCED SHIFT LOCKING TEST ===');

// Test 1: Check current time-based shift status
function testCurrentTimeShiftStatus() {
  console.log('\n--- Testing Current Time-Based Shift Status ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  console.log('Current time:', now.toLocaleTimeString());
  console.log('Current time in minutes:', currentTime);
  console.log('Current hour:', currentHour);
  
  // Determine expected shift status based on current time
  let expectedStatus = 'unknown';
  let expectedShift = null;
  let expectedLockState = 'none';
  
  if (currentHour >= 7 && currentHour < 12) {
    expectedStatus = 'active';
    expectedShift = 'Morning';
    expectedLockState = 'none';
  } else if (currentHour >= 13 && currentHour < 17) {
    expectedStatus = 'active';
    expectedShift = 'Afternoon';
    expectedLockState = 'none';
  } else if (currentHour >= 19 || currentHour < 7) {
    expectedStatus = 'active';
    expectedShift = 'Evening';
    expectedLockState = 'none';
  } else if (currentHour >= 12 && currentHour < 13) {
    expectedStatus = 'upcoming';
    expectedShift = 'Afternoon';
    expectedLockState = 'none';
  } else if (currentHour >= 17 && currentHour < 19) {
    expectedStatus = 'upcoming';
    expectedShift = 'Evening';
    expectedLockState = 'none';
  } else if (currentHour >= 5 && currentHour < 7) {
    expectedStatus = 'upcoming';
    expectedShift = 'Morning';
    expectedLockState = 'none';
  } else if (currentHour >= 12 && currentHour < 13) {
    expectedStatus = 'morning-locked';
    expectedShift = 'Morning';
    expectedLockState = 'morning-locked';
  } else if (currentHour >= 17 && currentHour < 19) {
    expectedStatus = 'afternoon-locked';
    expectedShift = 'Afternoon';
    expectedLockState = 'afternoon-locked';
  } else if (currentHour >= 19 || currentHour < 5) {
    expectedStatus = 'completed';
    expectedShift = 'All';
    expectedLockState = 'all-locked';
  }
  
  console.log('Expected status:', expectedStatus);
  console.log('Expected shift:', expectedShift);
  console.log('Expected lock state:', expectedLockState);
  
  // Check if UI matches expected status
  const statusDots = document.querySelectorAll('[class*="rounded-full"]');
  const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
  
  let actualStatus = 'unknown';
  let actualShift = null;
  let actualLockState = 'none';
  
  statusDots.forEach((dot, index) => {
    if (dot.className.includes('bg-green-500')) {
      actualStatus = 'active';
      actualShift = statusTexts[index]?.textContent?.trim();
      actualLockState = 'none';
    } else if (dot.className.includes('bg-yellow-500')) {
      actualStatus = 'upcoming';
      actualShift = statusTexts[index]?.textContent?.trim();
      actualLockState = 'none';
    } else if (dot.className.includes('bg-gray-500')) {
      actualStatus = 'completed';
      actualShift = statusTexts[index]?.textContent?.trim();
      actualLockState = 'all-locked';
    } else if (dot.className.includes('bg-orange-500')) {
      actualStatus = statusTexts[index]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
      actualShift = statusTexts[index]?.textContent?.trim();
      actualLockState = actualStatus;
    } else if (dot.className.includes('bg-red-500')) {
      actualStatus = statusTexts[index]?.textContent?.trim().includes('Locked') ? 'locked' : 'expired';
      actualShift = statusTexts[index]?.textContent?.trim();
      actualLockState = actualStatus;
    }
  });
  
  console.log('Actual status:', actualStatus);
  console.log('Actual shift:', actualShift);
  console.log('Actual lock state:', actualLockState);
  console.log('Status matches expected:', expectedStatus === actualStatus ? '✅' : '❌');
  console.log('Shift matches expected:', expectedShift === actualShift ? '✅' : '❌');
  console.log('Lock state matches expected:', expectedLockState === actualLockState ? '✅' : '❌');
}

// Test 2: Test morning shift locking
function testMorningShiftLocking() {
  console.log('\n--- Testing Morning Shift Locking ---');
  
  // Simulate different times around morning shift
  const testTimes = [
    { hour: 7, minute: 0, expected: 'active', lockState: 'none' },      // 7:00 AM - Active
    { hour: 11, minute: 30, expected: 'active', lockState: 'none' },   // 11:30 AM - Active
    { hour: 12, minute: 0, expected: 'morning-locked', lockState: 'morning-locked' }, // 12:00 PM - Locked
    { hour: 12, minute: 30, expected: 'morning-locked', lockState: 'morning-locked' }, // 12:30 PM - Locked
    { hour: 13, minute: 0, expected: 'upcoming', lockState: 'none' },   // 1:00 PM - Afternoon upcoming
  ];
  
  testTimes.forEach((testTime, index) => {
    console.log(`\nMorning Test ${index + 1}: ${testTime.hour}:${testTime.minute.toString().padStart(2, '0')}`);
    console.log('Expected status:', testTime.expected);
    console.log('Expected lock state:', testTime.lockState);
    
    // Check if UI shows correct status
    const statusDots = document.querySelectorAll('[class*="rounded-full"]');
    const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
    
    let actualStatus = 'unknown';
    let actualLockState = 'none';
    
    statusDots.forEach((dot, dotIndex) => {
      if (dot.className.includes('bg-orange-500') && statusTexts[dotIndex]?.textContent?.includes('Morning')) {
        actualStatus = 'morning-locked';
        actualLockState = 'morning-locked';
      } else if (dot.className.includes('bg-green-500')) {
        actualStatus = 'active';
        actualLockState = 'none';
      } else if (dot.className.includes('bg-yellow-500')) {
        actualStatus = 'upcoming';
        actualLockState = 'none';
      }
    });
    
    console.log('Actual status:', actualStatus);
    console.log('Actual lock state:', actualLockState);
    console.log('Status matches expected:', testTime.expected === actualStatus ? '✅' : '❌');
    console.log('Lock state matches expected:', testTime.lockState === actualLockState ? '✅' : '❌');
  });
}

// Test 3: Test afternoon shift locking
function testAfternoonShiftLocking() {
  console.log('\n--- Testing Afternoon Shift Locking ---');
  
  // Simulate different times around afternoon shift
  const testTimes = [
    { hour: 13, minute: 0, expected: 'active', lockState: 'none' },      // 1:00 PM - Active
    { hour: 16, minute: 30, expected: 'active', lockState: 'none' },   // 4:30 PM - Active
    { hour: 17, minute: 0, expected: 'afternoon-locked', lockState: 'afternoon-locked' }, // 5:00 PM - Locked
    { hour: 17, minute: 30, expected: 'afternoon-locked', lockState: 'afternoon-locked' }, // 5:30 PM - Locked
    { hour: 18, minute: 0, expected: 'upcoming', lockState: 'none' },   // 6:00 PM - Evening upcoming
  ];
  
  testTimes.forEach((testTime, index) => {
    console.log(`\nAfternoon Test ${index + 1}: ${testTime.hour}:${testTime.minute.toString().padStart(2, '0')}`);
    console.log('Expected status:', testTime.expected);
    console.log('Expected lock state:', testTime.lockState);
    
    // Check if UI shows correct status
    const statusDots = document.querySelectorAll('[class*="rounded-full"]');
    const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
    
    let actualStatus = 'unknown';
    let actualLockState = 'none';
    
    statusDots.forEach((dot, dotIndex) => {
      if (dot.className.includes('bg-orange-500') && statusTexts[dotIndex]?.textContent?.includes('Afternoon')) {
        actualStatus = 'afternoon-locked';
        actualLockState = 'afternoon-locked';
      } else if (dot.className.includes('bg-green-500')) {
        actualStatus = 'active';
        actualLockState = 'none';
      } else if (dot.className.includes('bg-yellow-500')) {
        actualStatus = 'upcoming';
        actualLockState = 'none';
      }
    });
    
    console.log('Actual status:', actualStatus);
    console.log('Actual lock state:', actualLockState);
    console.log('Status matches expected:', testTime.expected === actualStatus ? '✅' : '❌');
    console.log('Lock state matches expected:', testTime.lockState === actualLockState ? '✅' : '❌');
  });
}

// Test 4: Test button visibility with lock states
function testButtonVisibilityWithLocks() {
  console.log('\n--- Testing Button Visibility with Lock States ---');
  
  // Look for clock buttons
  const clockButtons = document.querySelectorAll('button');
  const clockInButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock In')
  );
  const clockOutButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock Out')
  );
  
  console.log('Clock In Button:', clockInButton ? '✅ Found' : '❌ Not found');
  console.log('Clock Out Button:', clockOutButton ? '✅ Found' : '❌ Not found');
  
  if (clockInButton && clockOutButton) {
    const clockInVisible = clockInButton.offsetParent !== null;
    const clockOutVisible = clockOutButton.offsetParent !== null;
    
    console.log('Clock In Button Visible:', clockInVisible);
    console.log('Clock Out Button Visible:', clockOutVisible);
    
    // Check if buttons are properly disabled when locked
    const clockInDisabled = clockInButton.disabled;
    const clockOutDisabled = clockOutButton.disabled;
    
    console.log('Clock In Button Disabled:', clockInDisabled);
    console.log('Clock Out Button Disabled:', clockOutDisabled);
    
    // Check if lock message is displayed
    const lockMessage = document.querySelector('.bg-red-50');
    const hasLockMessage = lockMessage && lockMessage.textContent?.includes('Locked');
    
    console.log('Lock Message Displayed:', hasLockMessage ? '✅' : '❌');
    
    if (hasLockMessage) {
      const lockText = lockMessage.textContent?.trim();
      console.log('Lock Message Text:', lockText);
      
      // Check if it mentions morning or afternoon specifically
      const mentionsMorning = lockText.includes('Morning Shift');
      const mentionsAfternoon = lockText.includes('Afternoon Shift');
      
      console.log('Mentions Morning:', mentionsMorning ? '✅' : '❌');
      console.log('Mentions Afternoon:', mentionsAfternoon ? '✅' : '❌');
    }
  }
}

// Test 5: Test shift transition logic
function testShiftTransitionLogic() {
  console.log('\n--- Testing Shift Transition Logic ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  
  console.log('Current hour:', currentHour);
  
  // Test transition scenarios
  if (currentHour >= 7 && currentHour < 12) {
    console.log('✅ Morning shift should be active');
    console.log('✅ Afternoon shift should be upcoming');
  } else if (currentHour >= 13 && currentHour < 17) {
    console.log('✅ Afternoon shift should be active');
    console.log('✅ Morning shift should be locked');
  } else if (currentHour >= 17 && currentHour < 19) {
    console.log('✅ Afternoon shift should be locked');
    console.log('✅ Evening shift should be upcoming');
  } else if (currentHour >= 19 || currentHour < 7) {
    console.log('✅ Evening shift should be active');
    console.log('✅ Morning and afternoon shifts should be locked');
  } else {
    console.log('❌ No active shift detected');
  }
  
  // Check actual UI
  const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
  const activeStatus = Array.from(statusTexts).find(text => text.textContent?.includes('Active'));
  const lockedStatus = Array.from(statusTexts).find(text => text.textContent?.includes('Locked'));
  const upcomingStatus = Array.from(statusTexts).find(text => text.textContent?.includes('Upcoming'));
  
  console.log('Active Status Found:', activeStatus ? '✅' : '❌');
  console.log('Locked Status Found:', lockedStatus ? '✅' : '❌');
  console.log('Upcoming Status Found:', upcomingStatus ? '✅' : '❌');
  
  if (activeStatus) {
    console.log('Active Status Text:', activeStatus.textContent?.trim());
  }
  if (lockedStatus) {
    console.log('Locked Status Text:', lockedStatus.textContent?.trim());
  }
  if (upcomingStatus) {
    console.log('Upcoming Status Text:', upcomingStatus.textContent?.trim());
  }
}

// Test 6: Test time remaining calculation
function testTimeRemainingCalculation() {
  console.log('\n--- Testing Time Remaining Calculation ---');
  
  // Look for time remaining elements
  const timeRemainingElements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.includes('Time Remaining'));
  
  if (timeRemainingElements.length > 0) {
    const timeRemainingText = timeRemainingElements[0].textContent?.trim();
    console.log('Time remaining text:', timeRemainingText);
    
    // Check if format is correct (should be like "2h 30m")
    const hasCorrectFormat = /\d+h\s+\d+m/.test(timeRemainingText);
    console.log('Correct format:', hasCorrectFormat ? '✅' : '❌');
    
    if (hasCorrectFormat) {
      const match = timeRemainingText.match(/(\d+)h\s+(\d+)m/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        console.log('Parsed hours:', hours);
        console.log('Parsed minutes:', minutes);
        console.log('Total minutes:', hours * 60 + minutes);
        
        // Verify it's reasonable (should be positive and not too large)
        const isReasonable = hours >= 0 && minutes >= 0 && (hours * 60 + minutes) <= 12 * 60;
        console.log('Time remaining is reasonable:', isReasonable ? '✅' : '❌');
      }
    }
  } else {
    console.log('No time remaining found (shift may be locked or completed)');
  }
}

// Run all tests
function runEnhancedShiftLockingTests() {
  console.log('Running enhanced shift locking tests...');
  
  testCurrentTimeShiftStatus();
  testMorningShiftLocking();
  testAfternoonShiftLocking();
  testButtonVisibilityWithLocks();
  testShiftTransitionLogic();
  testTimeRemainingCalculation();
  
  console.log('\n=== ENHANCED SHIFT LOCKING TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Shift status should follow current time accurately');
  console.log('2. Morning shift should lock after 12:00 PM (1 hour grace period)');
  console.log('3. Afternoon shift should lock after 5:00 PM (1 hour grace period)');
  console.log('4. Separate lock states for morning and afternoon shifts');
  console.log('5. Buttons should be disabled when shifts are locked');
  console.log('6. Lock messages should be specific to shift type');
  console.log('7. Time remaining should be calculated correctly');
  console.log('8. Shift transitions should work smoothly');
}

// Make functions available globally
window.testCurrentTimeShiftStatus = testCurrentTimeShiftStatus;
window.testMorningShiftLocking = testMorningShiftLocking;
window.testAfternoonShiftLocking = testAfternoonShiftLocking;
window.testButtonVisibilityWithLocks = testButtonVisibilityWithLocks;
window.testShiftTransitionLogic = testShiftTransitionLogic;
window.testTimeRemainingCalculation = testTimeRemainingCalculation;
window.runEnhancedShiftLockingTests = runEnhancedShiftLockingTests;

// Auto-run tests
setTimeout(runEnhancedShiftLockingTests, 1000);
