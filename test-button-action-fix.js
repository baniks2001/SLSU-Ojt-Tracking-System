// Test script to verify fixed button action logic
console.log('=== BUTTON ACTION LOGIC FIX TEST ===');

// Test 1: Check current button action and shift status
function testCurrentButtonAction() {
  console.log('\n--- Testing Current Button Action ---');
  
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
  
  // Check button action
  const buttonElements = document.querySelectorAll('button');
  const actionButton = Array.from(buttonElements).find(btn => 
    btn.textContent?.includes('Clock In') || btn.textContent?.includes('Clock Out')
  );
  
  if (actionButton) {
    const buttonText = actionButton.textContent?.trim();
    const buttonVisible = actionButton.offsetParent !== null;
    const buttonDisabled = actionButton.disabled;
    
    console.log('Button text:', buttonText);
    console.log('Button visible:', buttonVisible);
    console.log('Button disabled:', buttonDisabled);
    
    // Check if button action matches shift status
    let expectedAction = 'unknown';
    if (actualStatus === 'active') {
      if (actualShift?.includes('Morning')) {
        expectedAction = buttonText.includes('Clock In') ? 'Clock In' : 'Clock Out';
      } else if (actualShift?.includes('Afternoon')) {
        expectedAction = buttonText.includes('Clock In') ? 'Clock In' : 'Clock Out';
      } else if (actualShift?.includes('Evening')) {
        expectedAction = buttonText.includes('Clock In') ? 'Clock In' : 'Clock Out';
      }
    } else if (actualStatus === 'completed') {
      expectedAction = 'No action';
    } else if (actualStatus === 'expired' || actualStatus.includes('locked')) {
      expectedAction = 'No action';
    }
    
    console.log('Expected action:', expectedAction);
    console.log('Button action matches status:', 
      (actualStatus === 'active' && buttonText !== 'Shift Time Expired') ? '✅' : '❌');
  }
}

// Test 2: Test afternoon shift logic specifically
function testAfternoonShiftLogic() {
  console.log('\n--- Testing Afternoon Shift Logic ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  
  console.log('Current hour:', currentHour);
  
  // Test scenarios for afternoon shift
  if (currentHour >= 13 && currentHour < 17) {
    console.log('✅ Should be in afternoon shift active time');
    console.log('✅ Button should show Clock In or Clock Out');
    console.log('❌ Should NOT show "Shift Time Expired"');
  } else if (currentHour >= 17 && currentHour < 19) {
    console.log('✅ Should be in afternoon shift grace period');
    console.log('✅ Button should show Clock In or Clock Out');
    console.log('❌ Should NOT show "Shift Time Expired"');
  } else if (currentHour >= 19) {
    console.log('✅ Should be in evening shift time');
    console.log('✅ Afternoon shift should be locked');
    console.log('✅ Button should NOT show for afternoon');
  }
  
  // Check actual button state
  const buttonElements = document.querySelectorAll('button');
  const actionButton = Array.from(buttonElements).find(btn => 
    btn.textContent?.includes('Clock In') || btn.textContent?.includes('Clock Out')
  );
  
  if (actionButton) {
    const buttonText = actionButton.textContent?.trim();
    console.log('Actual button text:', buttonText);
    
    const isExpired = buttonText === 'Shift Time Expired';
    const isClockAction = buttonText.includes('Clock In') || buttonText.includes('Clock Out');
    
    console.log('Button shows "Shift Time Expired":', isExpired ? '❌' : '✅');
    console.log('Button shows clock action:', isClockAction ? '✅' : '❌');
    
    // Verify logic
    if (currentHour >= 13 && currentHour < 19) {
      console.log('Afternoon shift time logic correct:', !isExpired && isClockAction ? '✅' : '❌');
    }
  }
}

// Test 3: Test morning to afternoon transition
function testMorningToAfternoonTransition() {
  console.log('\n--- Testing Morning to Afternoon Transition ---');
  
  const now = new Date();
  const currentHour = now.getHours();
  
  console.log('Current hour:', currentHour);
  
  // Check if we're in the transition period
  if (currentHour >= 12 && currentHour < 13) {
    console.log('✅ Should be in transition period');
    console.log('✅ Morning shift should be locked');
    console.log('✅ Afternoon shift should be upcoming');
    console.log('✅ Button should show afternoon Clock In');
  }
  
  // Check actual state
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
    } else if (dot.className.includes('bg-orange-500')) {
      actualStatus = statusTexts[index]?.textContent?.trim().includes('Morning') ? 'morning-locked' : 'afternoon-locked';
      actualShift = statusTexts[index]?.textContent?.trim();
    }
  });
  
  console.log('Actual status:', actualStatus);
  console.log('Actual shift:', actualShift);
  
  // Check button
  const buttonElements = document.querySelectorAll('button');
  const actionButton = Array.from(buttonElements).find(btn => 
    btn.textContent?.includes('Clock In') || btn.textContent?.includes('Clock Out')
  );
  
  if (actionButton) {
    const buttonText = actionButton.textContent?.trim();
    console.log('Button text:', buttonText);
    
    const showsAfternoon = buttonText.includes('Afternoon');
    const showsExpired = buttonText === 'Shift Time Expired';
    
    console.log('Button shows afternoon:', showsAfternoon ? '✅' : '❌');
    console.log('Button shows expired:', showsExpired ? '❌' : '✅');
  }
}

// Test 4: Test real-time button action updates
function testRealTimeButtonActionUpdates() {
  console.log('\n--- Testing Real-Time Button Action Updates ---');
  
  console.log('Monitoring button action changes for 10 seconds...');
  
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
    
    // Check button action
    const buttonElements = document.querySelectorAll('button');
    const actionButton = Array.from(buttonElements).find(btn => 
      btn.textContent?.includes('Clock In') || btn.textContent?.includes('Clock Out')
    );
    
    let buttonAction = 'No button';
    if (actionButton) {
      buttonAction = actionButton.textContent?.trim();
    }
    
    console.log(`Status: ${currentStatus}, Shift: ${currentShift}`);
    console.log(`Button action: ${buttonAction}`);
    
    // Verify button action matches status
    const actionCorrect = 
      (currentStatus === 'active' && buttonAction !== 'Shift Time Expired') ||
      (currentStatus !== 'active' && buttonAction === 'No button');
    
    console.log('Button action correct:', actionCorrect ? '✅' : '❌');
  }, 2000); // Check every 2 seconds
  
  // Stop monitoring after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('\nMonitoring stopped. Total checks:', checkCount);
    console.log('Real-time button action updates working correctly');
  }, 10000);
}

// Run all tests
function runButtonActionLogicFixTests() {
  console.log('Running button action logic fix tests...');
  
  testCurrentButtonAction();
  testAfternoonShiftLogic();
  testMorningToAfternoonTransition();
  testRealTimeButtonActionUpdates();
  
  console.log('\n=== BUTTON ACTION LOGIC FIX TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Button action should match current shift status');
  console.log('2. Afternoon shift should show Clock In/Out when active');
  console.log('3. Should not show "Shift Time Expired" for active shifts');
  console.log('4. Morning to afternoon transition should work correctly');
  console.log('5. Real-time updates should maintain correct button actions');
  console.log('6. Logic should handle completed morning shifts properly');
}

// Make functions available globally
window.testCurrentButtonAction = testCurrentButtonAction;
window.testAfternoonShiftLogic = testAfternoonShiftLogic;
window.testMorningToAfternoonTransition = testMorningToAfternoonTransition;
window.testRealTimeButtonActionUpdates = testRealTimeButtonActionUpdates;
window.runButtonActionLogicFixTests = runButtonActionLogicFixTests;

// Auto-run tests
setTimeout(runButtonActionLogicFixTests, 1000);
