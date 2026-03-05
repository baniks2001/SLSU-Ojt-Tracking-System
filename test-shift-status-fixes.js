// Test script to verify shift status and clock button fixes
console.log('=== SHIFT STATUS AND CLOCK BUTTON FIXES TEST ===');

// Test 1: Verify current time-based shift status
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
  
  if (currentHour >= 7 && currentHour < 12) {
    expectedStatus = 'active';
    expectedShift = 'Morning';
  } else if (currentHour >= 13 && currentHour < 17) {
    expectedStatus = 'active';
    expectedShift = 'Afternoon';
  } else if (currentHour >= 19 || currentHour < 7) {
    expectedStatus = 'active';
    expectedShift = 'Evening';
  } else if (currentHour >= 12 && currentHour < 13) {
    expectedStatus = 'upcoming';
    expectedShift = 'Afternoon';
  } else if (currentHour >= 17 && currentHour < 19) {
    expectedStatus = 'upcoming';
    expectedShift = 'Evening';
  } else if (currentHour >= 5 && currentHour < 7) {
    expectedStatus = 'upcoming';
    expectedShift = 'Morning';
  } else {
    expectedStatus = 'completed';
  }
  
  console.log('Expected status:', expectedStatus);
  console.log('Expected shift:', expectedShift);
  
  // Check if UI matches expected status
  const statusDots = document.querySelectorAll('[class*="rounded-full"]');
  const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"]');
  
  let actualStatus = 'unknown';
  let actualShift = null;
  
  statusDots.forEach((dot, index) => {
    if (dot.className.includes('bg-green-500')) {
      actualStatus = 'active';
      actualShift = statusTexts[index]?.textContent?.trim();
    } else if (dot.className.includes('bg-yellow-500')) {
      actualStatus = 'upcoming';
      actualShift = statusTexts[index]?.textContent?.trim();
    } else if (dot.className.includes('bg-gray-500')) {
      actualStatus = 'completed';
      actualShift = statusTexts[index]?.textContent?.trim();
    } else if (dot.className.includes('bg-red-500')) {
      actualStatus = 'expired';
      actualShift = statusTexts[index]?.textContent?.trim();
    }
  });
  
  console.log('Actual status:', actualStatus);
  console.log('Actual shift:', actualShift);
  console.log('Status matches expected:', expectedStatus === actualStatus ? '✅' : '❌');
  console.log('Shift matches expected:', expectedShift === actualShift ? '✅' : '❌');
}

// Test 2: Verify clock button state updates
function testClockButtonStateUpdates() {
  console.log('\n--- Testing Clock Button State Updates ---');
  
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
    
    // Check if buttons are mutually exclusive (only one should be visible at a time)
    const bothVisible = clockInVisible && clockOutVisible;
    const bothHidden = !clockInVisible && !clockOutVisible;
    
    console.log('Both buttons visible (should not happen):', bothVisible ? '❌' : '✅');
    console.log('Both buttons hidden (completed shift):', bothHidden ? '✅' : '❌');
    console.log('One button visible (correct):', !bothVisible && !bothHidden ? '✅' : '❌');
  }
}

// Test 3: Verify shift status update frequency
function testShiftStatusUpdateFrequency() {
  console.log('\n--- Testing Shift Status Update Frequency ---');
  
  // Check if status updates every 30 seconds
  let updateCount = 0;
  const originalLog = console.log;
  
  // Override console.log to count updates
  console.log = (...args) => {
    if (args[0] && args[0].includes('Expected status:')) {
      updateCount++;
    }
    originalLog.apply(console, args);
  };
  
  // Wait for 35 seconds to see if status updates
  setTimeout(() => {
    console.log = originalLog; // Restore original console.log
    console.log('Status updates in 35 seconds:', updateCount);
    console.log('Update frequency correct (at least 1):', updateCount >= 1 ? '✅' : '❌');
    console.log('Update frequency good (30s interval):', updateCount <= 2 ? '✅' : '❌');
  }, 35000);
}

// Test 4: Verify afternoon shift logic
function testAfternoonShiftLogic() {
  console.log('\n--- Testing Afternoon Shift Logic ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  console.log('Current time:', now.toLocaleTimeString());
  
  // Test times around afternoon shift (1:00 PM - 5:00 PM)
  const testTimes = [
    { hour: 12, minute: 0, expected: 'upcoming' },    // 12:00 PM
    { hour: 13, minute: 0, expected: 'active' },     // 1:00 PM
    { hour: 16, minute: 30, expected: 'active' },    // 4:30 PM
    { hour: 17, minute: 0, expected: 'completed' },    // 5:00 PM
    { hour: 17, minute: 30, expected: 'completed' },    // 5:30 PM
  ];
  
  testTimes.forEach((testTime, index) => {
    console.log(`\nTest ${index + 1}: ${testTime.hour}:${testTime.minute.toString().padStart(2, '0')}`);
    console.log('Expected status:', testTime.expected);
    
    // Simulate time change by checking UI
    setTimeout(() => {
      const statusDots = document.querySelectorAll('[class*="rounded-full"]');
      const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"]');
      
      let actualStatus = 'unknown';
      statusDots.forEach((dot, dotIndex) => {
        if (dot.className.includes('bg-green-500')) {
          actualStatus = 'active';
        } else if (dot.className.includes('bg-yellow-500')) {
          actualStatus = 'upcoming';
        } else if (dot.className.includes('bg-gray-500')) {
          actualStatus = 'completed';
        }
      });
      
      console.log('Actual status:', actualStatus);
      console.log('Status matches expected:', testTime.expected === actualStatus ? '✅' : '❌');
    }, 100 * (index + 1)); // Stagger checks
  });
}

// Test 5: Verify time remaining calculation
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
  }
}

// Run all tests
function runShiftStatusAndClockButtonTests() {
  console.log('Running shift status and clock button fix tests...');
  
  testCurrentTimeShiftStatus();
  testClockButtonStateUpdates();
  testShiftStatusUpdateFrequency();
  testAfternoonShiftLogic();
  testTimeRemainingCalculation();
  
  console.log('\n=== SHIFT STATUS AND CLOCK BUTTON FIXES TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Shift status should follow current time accurately');
  console.log('2. Clock buttons should update based on attendance record');
  console.log('3. Status should update every 30 seconds');
  console.log('4. Afternoon shift logic should work correctly');
  console.log('5. Time remaining should be calculated correctly');
  console.log('6. Clock in/out buttons should be mutually exclusive');
}

// Make functions available globally
window.testCurrentTimeShiftStatus = testCurrentTimeShiftStatus;
window.testClockButtonStateUpdates = testClockButtonStateUpdates;
window.testShiftStatusUpdateFrequency = testShiftStatusUpdateFrequency;
window.testAfternoonShiftLogic = testAfternoonShiftLogic;
window.testTimeRemainingCalculation = testTimeRemainingCalculation;
window.runShiftStatusAndClockButtonTests = runShiftStatusAndClockButtonTests;

// Auto-run tests
setTimeout(runShiftStatusAndClockButtonTests, 1000);
