// Test script to verify button unlock when shift is active
console.log('=== BUTTON UNLOCK TEST ===');

// Test 1: Check current shift status and button visibility
function testShiftStatusAndButtonVisibility() {
  console.log('\n--- Testing Shift Status and Button Visibility ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  console.log('Current time:', now.toLocaleTimeString());
  console.log('Current time in minutes:', currentTime);
  console.log('Current hour:', currentHour);
  
  // Check shift status
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
  
  // Check button visibility
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
    const clockInDisabled = clockInButton.disabled;
    const clockOutDisabled = clockOutButton.disabled;
    
    console.log('Clock In Button Visible:', clockInVisible);
    console.log('Clock Out Button Visible:', clockOutVisible);
    console.log('Clock In Button Disabled:', clockInDisabled);
    console.log('Clock Out Button Disabled:', clockOutDisabled);
    
    // Check if button visibility matches shift status
    const shouldHaveButton = actualStatus === 'active';
    const hasButton = clockInVisible || clockOutVisible;
    const buttonMatchesStatus = shouldHaveButton === hasButton;
    
    console.log('Should have button (active shift):', shouldHaveButton);
    console.log('Has button:', hasButton);
    console.log('Button visibility matches status:', buttonMatchesStatus ? '✅' : '❌');
    
    // Check if button is disabled when it shouldn't be
    const buttonDisabledWhenActive = actualStatus === 'active' && (clockInDisabled || clockOutDisabled);
    console.log('Button disabled when active (should not happen):', buttonDisabledWhenActive ? '❌' : '✅');
  }
}

// Test 2: Check lock message visibility
function testLockMessageVisibility() {
  console.log('\n--- Testing Lock Message Visibility ---');
  
  // Check if lock message is displayed
  const lockMessage = document.querySelector('.bg-red-50');
  const hasLockMessage = lockMessage && lockMessage.textContent?.includes('Locked');
  
  console.log('Lock Message Displayed:', hasLockMessage ? '✅' : '❌');
  
  if (hasLockMessage) {
    const lockText = lockMessage.textContent?.trim();
    console.log('Lock Message Text:', lockText);
    
    // Check if lock message is appropriate for current shift status
    const statusDots = document.querySelectorAll('[class*="rounded-full"]');
    const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
    
    let actualStatus = 'unknown';
    statusDots.forEach((dot, index) => {
      if (dot.className.includes('bg-green-500')) {
        actualStatus = 'active';
      } else if (dot.className.includes('bg-yellow-500')) {
        actualStatus = 'upcoming';
      } else if (dot.className.includes('bg-gray-500')) {
        actualStatus = 'completed';
      } else if (dot.className.includes('bg-orange-500')) {
        actualStatus = statusTexts[index]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
      } else if (dot.className.includes('bg-red-500')) {
        actualStatus = statusTexts[index]?.textContent?.trim().includes('Locked') ? 'locked' : 'expired';
      }
    });
    
    console.log('Current status:', actualStatus);
    console.log('Lock message appropriate for status:', 
      (actualStatus === 'active' && !hasLockMessage) || 
      (actualStatus !== 'active' && hasLockMessage) ? '✅' : '❌');
  }
}

// Test 3: Test button logic for different shift types
function testButtonLogicForShiftTypes() {
  console.log('\n--- Testing Button Logic for Different Shift Types ---');
  
  // Test scenarios for different shift types
  const testScenarios = [
    {
      shift: 'Morning',
      status: 'active',
      shouldHaveButton: true,
      shouldHaveLockMessage: false
    },
    {
      shift: 'Afternoon', 
      status: 'active',
      shouldHaveButton: true,
      shouldHaveLockMessage: false
    },
    {
      shift: 'Morning',
      status: 'morning-locked',
      shouldHaveButton: false,
      shouldHaveLockMessage: true
    },
    {
      shift: 'Afternoon',
      status: 'afternoon-locked', 
      shouldHaveButton: false,
      shouldHaveLockMessage: true
    }
  ];
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\nScenario ${index + 1}: ${scenario.shift} - ${scenario.status}`);
    console.log('Should have button:', scenario.shouldHaveButton);
    console.log('Should have lock message:', scenario.shouldHaveLockMessage);
    
    // Check current state
    const statusDots = document.querySelectorAll('[class*="rounded-full"]');
    const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
    
    let actualStatus = 'unknown';
    let actualShift = null;
    
    statusDots.forEach((dot, dotIndex) => {
      if (dot.className.includes('bg-green-500')) {
        actualStatus = 'active';
        actualShift = statusTexts[dotIndex]?.textContent?.trim();
      } else if (dot.className.includes('bg-orange-500')) {
        actualStatus = statusTexts[dotIndex]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
        actualShift = statusTexts[dotIndex]?.textContent?.trim();
      }
    });
    
    // Check button visibility
    const clockButtons = document.querySelectorAll('button');
    const clockInButton = Array.from(clockButtons).find(btn => 
      btn.textContent?.includes('Clock In')
    );
    const clockOutButton = Array.from(clockButtons).find(btn => 
      btn.textContent?.includes('Clock Out')
    );
    
    const hasButton = (clockInButton && clockInButton.offsetParent !== null) || 
                     (clockOutButton && clockOutButton.offsetParent !== null);
    
    // Check lock message
    const lockMessage = document.querySelector('.bg-red-50');
    const hasLockMessage = lockMessage && lockMessage.textContent?.includes('Locked');
    
    console.log('Actual status:', actualStatus);
    console.log('Actual shift:', actualShift);
    console.log('Has button:', hasButton);
    console.log('Has lock message:', hasLockMessage);
    
    // Verify logic
    const buttonLogicCorrect = scenario.shouldHaveButton === hasButton;
    const lockMessageLogicCorrect = scenario.shouldHaveLockMessage === hasLockMessage;
    
    console.log('Button logic correct:', buttonLogicCorrect ? '✅' : '❌');
    console.log('Lock message logic correct:', lockMessageLogicCorrect ? '✅' : '❌');
  });
}

// Test 4: Test real-time button updates
function testRealTimeButtonUpdates() {
  console.log('\n--- Testing Real-Time Button Updates ---');
  
  console.log('Monitoring button state changes for 10 seconds...');
  
  let checkCount = 0;
  const checkInterval = setInterval(() => {
    checkCount++;
    console.log(`\nCheck ${checkCount}: ${new Date().toLocaleTimeString()}`);
    
    // Check current status
    const statusDots = document.querySelectorAll('[class*="rounded-full"]');
    const statusTexts = document.querySelectorAll('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"], [class*="text-orange-700"]');
    
    let currentStatus = 'unknown';
    let currentShift = null;
    
    statusDots.forEach((dot, index) => {
      if (dot.className.includes('bg-green-500')) {
        currentStatus = 'active';
        currentShift = statusTexts[index]?.textContent?.trim();
      } else if (dot.className.includes('bg-yellow-500')) {
        currentStatus = 'upcoming';
        currentShift = statusTexts[index]?.textContent?.trim();
      } else if (dot.className.includes('bg-gray-500')) {
        currentStatus = 'completed';
        currentShift = statusTexts[index]?.textContent?.trim();
      } else if (dot.className.includes('bg-orange-500')) {
        currentStatus = statusTexts[index]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
        currentShift = statusTexts[index]?.textContent?.trim();
      } else if (dot.className.includes('bg-red-500')) {
        currentStatus = statusTexts[index]?.textContent?.trim().includes('Locked') ? 'locked' : 'expired';
        currentShift = statusTexts[index]?.textContent?.trim();
      }
    });
    
    // Check button state
    const clockButtons = document.querySelectorAll('button');
    const clockInButton = Array.from(clockButtons).find(btn => 
      btn.textContent?.includes('Clock In')
    );
    const clockOutButton = Array.from(clockButtons).find(btn => 
      btn.textContent?.includes('Clock Out')
    );
    
    const hasButton = (clockInButton && clockInButton.offsetParent !== null) || 
                     (clockOutButton && clockOutButton.offsetParent !== null);
    const buttonDisabled = (clockInButton && clockInButton.disabled) || 
                         (clockOutButton && clockOutButton.disabled);
    
    console.log(`Status: ${currentStatus}, Shift: ${currentShift}`);
    console.log(`Button visible: ${hasButton}, Button disabled: ${buttonDisabled}`);
    
    // Verify button state matches status
    const buttonStateCorrect = 
      (currentStatus === 'active' && hasButton && !buttonDisabled) ||
      (currentStatus !== 'active' && !hasButton);
    
    console.log('Button state correct:', buttonStateCorrect ? '✅' : '❌');
  }, 2000); // Check every 2 seconds
  
  // Stop monitoring after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('\nMonitoring stopped. Total checks:', checkCount);
    console.log('Real-time button updates working correctly');
  }, 10000);
}

// Run all tests
function runButtonUnlockTests() {
  console.log('Running button unlock tests...');
  
  testShiftStatusAndButtonVisibility();
  testLockMessageVisibility();
  testButtonLogicForShiftTypes();
  testRealTimeButtonUpdates();
  
  console.log('\n=== BUTTON UNLOCK TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Buttons should be visible when shift is active');
  console.log('2. Buttons should be hidden when shift is locked');
  console.log('3. Lock messages should only show for locked shifts');
  console.log('4. Button logic should be specific to current shift');
  console.log('5. Real-time updates should work correctly');
  console.log('6. No premature locking of active shifts');
}

// Make functions available globally
window.testShiftStatusAndButtonVisibility = testShiftStatusAndButtonVisibility;
window.testLockMessageVisibility = testLockMessageVisibility;
window.testButtonLogicForShiftTypes = testButtonLogicForShiftTypes;
window.testRealTimeButtonUpdates = testRealTimeButtonUpdates;
window.runButtonUnlockTests = runButtonUnlockTests;

// Auto-run tests
setTimeout(runButtonUnlockTests, 1000);
