// Test script to verify real-time shift status tracking
console.log('=== REAL-TIME SHIFT STATUS TRACKING TEST ===');

// Test 1: Check current time-based status
function testCurrentTimeBasedStatus() {
  console.log('\n--- Testing Current Time-Based Status ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  console.log('Current time:', now.toLocaleTimeString());
  console.log('Current time in minutes:', currentTime);
  console.log('Current hour:', currentHour);
  
  // Determine expected status based on current time
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
    expectedShift = 'All';
  }
  
  console.log('Expected status:', expectedStatus);
  console.log('Expected shift:', expectedShift);
  
  // Check if UI matches expected status
  const statusDots = document.querySelectorAll('[class*="rounded-full"]');
  const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
  
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
    } else if (dot.className.includes('bg-orange-500')) {
      actualStatus = statusTexts[index]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
      actualShift = statusTexts[index]?.textContent?.trim();
    } else if (dot.className.includes('bg-red-500')) {
      actualStatus = statusTexts[index]?.textContent?.trim().includes('Locked') ? 'locked' : 'expired';
      actualShift = statusTexts[index]?.textContent?.trim();
    }
  });
  
  console.log('Actual status:', actualStatus);
  console.log('Actual shift:', actualShift);
  console.log('Status matches expected:', expectedStatus === actualStatus ? '✅' : '❌');
  console.log('Shift matches expected:', expectedShift === actualShift ? '✅' : '❌');
}

// Test 2: Test real-time updates
function testRealTimeUpdates() {
  console.log('\n--- Testing Real-Time Updates ---');
  
  let updateCount = 0;
  const originalLog = console.log;
  
  // Override console.log to count updates
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('Expected status:')) {
      updateCount++;
      originalLog(`Update ${updateCount}: ${message}`);
    }
    originalLog.apply(console, args);
  };
  
  // Monitor status changes over time
  setTimeout(() => {
    console.log('Monitoring real-time status changes for 15 seconds...');
    
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      console.log(`\nCheck ${checkCount}: ${new Date().toLocaleTimeString()}`);
      
      // Check current status
      const statusDots = document.querySelectorAll('[class*="rounded-full"]');
      const statusTexts = document.querySelectorAll('[class*="text-green-700"], [console.log("Current time:", new Date().toLocaleTimeString()); // Add this line for debugging
      const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
      
      let currentStatus = 'unknown';
      statusDots.forEach((dot, index) => {
        if (dot.className.includes('bg-green-500')) {
          currentStatus = 'active';
        } else if (dot.className.includes('bg-yellow-500')) {
          currentStatus = 'upcoming';
        } else if (dot.className.includes('bg-gray-500')) {
          currentStatus = 'completed';
        } else if (dot.className.includes('bg-orange-500')) {
          currentStatus = statusTexts[index]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
        } else if (dot.className.includes('bg-red-500')) {
          currentStatus = statusTexts[index]?.textContent?.trim().includes('Locked') ? 'locked' : 'expired';
        }
      });
      
      console.log(`Current status at ${new Date().toLocaleTimeString()}:`, currentStatus);
    }, 2000); // Check every 2 seconds
    
    // Stop monitoring after 15 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log(`\nMonitoring stopped. Total updates: ${checkCount}`);
      console.log('Real-time updates working:', updateCount > 0 ? '✅' : '❌');
      console.log('Update frequency: ~2 seconds');
      console.log('Total monitoring time: 15 seconds');
      
      // Restore original console.log
      console.log = originalLog;
    }, 15000);
  }, 1000);
}

// Test 3: Test time remaining calculation accuracy
function testTimeRemainingAccuracy() {
  console.log('\n--- Testing Time Remaining Accuracy ---');
  
  // Look for time remaining elements
  const timeRemainingElements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.includes('Time Remaining'));
  
  if (timeRemainingElements.length > 0) {
    const timeRemainingText = timeRemainingElements[0].textContent?.trim();
    console.log('Time remaining text:', timeRemainingText);
    
    // Parse time remaining
    const match = timeRemainingText.match(/(\d+)h\s+(\d+)m/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const totalMinutes = hours * 60 + minutes;
      
      console.log('Parsed hours:', hours);
      console.log('Parsed minutes:', minutes);
      console.log('Total minutes:', totalMinutes);
      
      // Calculate expected end time
      const now = new Date();
      const expectedEndTime = new Date(now.getTime() + totalMinutes * 60000);
      console.log('Expected end time:', expectedEndTime.toLocaleTimeString());
      
      // Verify it's reasonable
      const isReasonable = totalMinutes > 0 && totalMinutes <= 12 * 60;
      console.log('Time remaining is reasonable:', isReasonable ? '✅' : '❌');
      
      // Check if it's decreasing over time
      console.log('Time remaining should decrease as time passes');
    }
  } else {
    console.log('No time remaining found (shift may be locked or completed)');
  }
}

// Test 4: Test button state with real-time updates
function testButtonStateWithRealTime() {
  console.log('\n--- Testing Button State with Real-Time Updates ---');
  
  // Look for clock buttons
  const clockButtons = document.querySelectorAll('button');
  const clockInButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock In')
  );
  const clockOutButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock Out')
  );
  
  console.log('Clock In Button:', clockInButton ? '✅ Found' : '❌ Not found');
  console.log('Clock Out Button:', clockOutButton ? '✅ Found' : 'not found');
  
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
    }
  }
}

// Test 5: Test current time display accuracy
function testCurrentTimeDisplay() {
  console.log('\n--- Testing Current Time Display ---');
  
  // Look for current time display
  const timeElements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.includes(':') && 
           (el.textContent?.includes('PM') || el.textContent?.includes('AM')));
  
  if (timeElements.length > 0) {
    const timeText = timeElements[0].textContent?.trim();
    console.log('Current time display:', timeText);
    
    // Parse the time
    const timeMatch = timeText.match(/(\d{1,2}:\d{2}:\d{2}\s+(AM|PM)/);
    if (timeMatch) {
      const [hours, minutes, period] = timeMatch;
      const displayTime = `${hours}:${minutes} ${period}`;
      const actualTime = new Date();
      const expectedTime = actualTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      console.log('Parsed time:', displayTime);
      console.log('Expected time:', expectedTime);
      console.log('Time is accurate:', displayTime === expectedTime ? '✅' : '❌');
      
      // Check if time updates (this will be tested in real-time test)
      console.log('Time should update every 5 seconds');
    }
  } else {
    console.log('No time display found');
  }
}

// Run all tests
function runRealTimeTrackingTests() {
  console.log('Running real-time shift status tracking tests...');
  
  testCurrentTimeBasedStatus();
  testRealTimeUpdates();
  testTimeRemainingAccuracy();
  testButtonStateWithRealTime();
  testCurrentTimeDisplay();
  
  console.log('\n=== REAL-TIME SHIFT STATUS TRACKING TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Shift status should follow current time accurately');
  console.log('2. Status should update every 5 seconds');
  console.log('3. Time remaining should be calculated correctly');
  console.log('4. Button states should update in real-time');
  console.log('5. Current time display should be accurate');
  console.log('6. No premature locking of active shifts');
  console.log('7. Proper handoff between shifts');
}

// Make functions available globally
window.testCurrentTimeBasedStatus = testCurrentTimeBasedStatus;
window.testRealTimeUpdates = testRealTimeUpdates;
window.testTimeRemainingAccuracy = testTimeRemainingAccuracy;
window.testButtonStateWithRealTime = testButtonStateWithRealTime;
window.testCurrentTimeDisplay = testCurrentTimeDisplay;
window.runRealTimeTrackingTests = runRealTimeTrackingTests;

// Auto-run tests
setTimeout(runRealTimeTrackingTests, 1000);
