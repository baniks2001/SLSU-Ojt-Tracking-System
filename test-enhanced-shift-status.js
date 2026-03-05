// Test script to verify enhanced shift status logic
console.log('=== ENHANCED SHIFT STATUS TEST ===');

// Test 1: Check shift status display
function testShiftStatusDisplay() {
  console.log('\n--- Testing Shift Status Display ---');
  
  // Look for shift status elements
  const shiftStatusElements = document.querySelectorAll('[class*="bg-gray-50"]');
  console.log('Found shift status containers:', shiftStatusElements.length);
  
  shiftStatusElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Status Container ${index + 1}:`, text);
    
    // Check for status indicators
    const hasStatusText = text?.includes('Current Shift Status');
    const hasActiveIndicator = element.innerHTML.includes('bg-green-500');
    const hasUpcomingIndicator = element.innerHTML.includes('bg-yellow-500');
    const hasCompletedIndicator = element.innerHTML.includes('bg-gray-500');
    const hasExpiredIndicator = element.innerHTML.includes('bg-red-500');
    
    console.log(`  Has status text:`, hasStatusText ? '✅' : '❌');
    console.log(`  Active indicator:`, hasActiveIndicator ? '✅' : '❌');
    console.log(`  Upcoming indicator:`, hasUpcomingIndicator ? '✅' : '❌');
    console.log(`  Completed indicator:`, hasCompletedIndicator ? '✅' : '❌');
    console.log(`  Expired indicator:`, hasExpiredIndicator ? '✅' : '❌');
  });
}

// Test 2: Check time remaining display
function testTimeRemainingDisplay() {
  console.log('\n--- Testing Time Remaining Display ---');
  
  // Look for time remaining elements
  const timeRemainingElements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.includes('Time Remaining'));
  
  console.log('Found time remaining elements:', timeRemainingElements.length);
  
  timeRemainingElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Time Remaining ${index + 1}:`, text);
    
    // Check if time format is correct (e.g., "2h 30m")
    const hasCorrectFormat = /\d+h\s+\d+m/.test(text);
    console.log('  Correct time format:', hasCorrectFormat ? '✅' : '❌');
  });
}

// Test 3: Check next shift time display
function testNextShiftTimeDisplay() {
  console.log('\n--- Testing Next Shift Time Display ---');
  
  // Look for next shift time elements
  const nextShiftElements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.includes('Next Shift Starts At'));
  
  console.log('Found next shift time elements:', nextShiftElements.length);
  
  nextShiftElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Next Shift ${index + 1}:`, text);
    
    // Check if time format is correct (e.g., "1:00 PM")
    const hasCorrectFormat = /\d{1,2}:\d{2}\s+(AM|PM)/.test(text);
    console.log('  Correct time format:', hasCorrectFormat ? '✅' : '❌');
  });
}

// Test 4: Check shift type badge
function testShiftTypeBadge() {
  console.log('\n--- Testing Shift Type Badge ---');
  
  // Look for shift type badges
  const badges = document.querySelectorAll('.badge');
  console.log('Found badges:', badges.length);
  
  badges.forEach((badge, index) => {
    const text = badge.textContent?.trim();
    console.log(`Badge ${index + 1}:`, text);
    
    // Check for known shift types
    const hasRegular = text?.includes('Regular');
    const hasGraveyard = text?.includes('Graveyard');
    const hasMorning = text?.includes('Morning');
    const hasAfternoon = text?.includes('Afternoon');
    const hasSingle = text?.includes('Single');
    const hasTwo = text?.includes('Two');
    
    console.log('  Has Regular:', hasRegular ? '✅' : '❌');
    console.log('  Has Graveyard:', hasGraveyard ? '✅' : '❌');
    console.log('  Has Morning:', hasMorning ? '✅' : '❌');
    console.log('  Has Afternoon:', hasAfternoon ? '✅' : '❌');
    console.log('  Has Single:', hasSingle ? '✅' : '❌');
    console.log('  Has Two:', hasTwo ? '✅' : '❌');
  });
}

// Test 5: Check status indicators (colored dots)
function testStatusIndicators() {
  console.log('\n--- Testing Status Indicators ---');
  
  // Look for colored status dots
  const statusDots = document.querySelectorAll('[class*="rounded-full"]');
  console.log('Found status dots:', statusDots.length);
  
  statusDots.forEach((dot, index) => {
    const classes = dot.className;
    console.log(`Status Dot ${index + 1}:`, classes);
    
    // Check for different status colors
    const hasGreen = classes.includes('bg-green-500');
    const hasYellow = classes.includes('bg-yellow-500');
    const hasGray = classes.includes('bg-gray-500');
    const hasRed = classes.includes('bg-red-500');
    const hasPulse = classes.includes('animate-pulse');
    
    console.log('  Green (active):', hasGreen ? '✅' : '❌');
    console.log('  Yellow (upcoming):', hasYellow ? '✅' : '❌');
    console.log('  Gray (completed):', hasGray ? '✅' : '❌');
    console.log('  Red (expired):', hasRed ? '✅' : '❌');
    console.log('  Pulse animation:', hasPulse ? '✅' : '❌');
  });
}

// Test 6: Check current time-based status
function testCurrentTimeBasedStatus() {
  console.log('\n--- Testing Current Time-Based Status ---');
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentHour = now.getHours();
  
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
  }
  
  console.log('Expected status:', expectedStatus);
  console.log('Expected shift:', expectedShift);
  
  // Check if UI matches expected status
  const activeIndicator = document.querySelector('.bg-green-500');
  const upcomingIndicator = document.querySelector('.bg-yellow-500');
  const completedIndicator = document.querySelector('.bg-gray-500');
  
  console.log('UI shows active:', activeIndicator ? '✅' : '❌');
  console.log('UI shows upcoming:', upcomingIndicator ? '✅' : '❌');
  console.log('UI shows completed:', completedIndicator ? '✅' : '❌');
  
  // Verify consistency
  const isConsistent = 
    (expectedStatus === 'active' && activeIndicator) ||
    (expectedStatus === 'upcoming' && upcomingIndicator) ||
    (expectedStatus === 'completed' && completedIndicator);
  
  console.log('Status is consistent:', isConsistent ? '✅' : '❌');
}

// Test 7: Check clock button alignment with shift status
function testClockButtonAlignment() {
  console.log('\n--- Testing Clock Button Alignment ---');
  
  // Look for clock buttons
  const clockButtons = document.querySelectorAll('button');
  const clockInButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock In')
  );
  const clockOutButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock Out')
  );
  
  // Look for shift status
  const activeShiftText = document.querySelector('.text-green-700')?.textContent?.trim();
  const upcomingShiftText = document.querySelector('.text-yellow-700')?.textContent?.trim();
  
  console.log('Clock In Button:', clockInButton ? '✅ Found' : '❌ Not found');
  console.log('Clock Out Button:', clockOutButton ? '✅ Found' : '❌ Not found');
  console.log('Active Shift Text:', activeShiftText || 'None');
  console.log('Upcoming Shift Text:', upcomingShiftText || 'None');
  
  // Check alignment
  if (activeShiftText && clockInButton) {
    const isAligned = activeShiftText.includes('Active') && clockInButton.textContent?.includes('Clock In');
    console.log('Active shift shows Clock In:', isAligned ? '✅' : '❌');
  }
  
  if (activeShiftText && clockOutButton) {
    const isAligned = activeShiftText.includes('Active') && clockOutButton.textContent?.includes('Clock Out');
    console.log('Active shift shows Clock Out:', isAligned ? '✅' : '❌');
  }
}

// Run all tests
function runEnhancedShiftStatusTests() {
  console.log('Running enhanced shift status tests...');
  
  testShiftStatusDisplay();
  testTimeRemainingDisplay();
  testNextShiftTimeDisplay();
  testShiftTypeBadge();
  testStatusIndicators();
  testCurrentTimeBasedStatus();
  testClockButtonAlignment();
  
  console.log('\n=== ENHANCED SHIFT STATUS TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Shift status should show current time-based status');
  console.log('2. Status indicators should be color-coded (green/yellow/gray/red)');
  console.log('3. Time remaining should show countdown for active shifts');
  console.log('4. Next shift time should show for upcoming shifts');
  console.log('5. Shift type badge should display student\'s shift type');
  console.log('6. Clock buttons should align with current shift status');
  console.log('7. Status should update every minute based on current time');
}

// Make functions available globally
window.testShiftStatusDisplay = testShiftStatusDisplay;
window.testTimeRemainingDisplay = testTimeRemainingDisplay;
window.testNextShiftTimeDisplay = testNextShiftTimeDisplay;
window.testShiftTypeBadge = testShiftTypeBadge;
window.testStatusIndicators = testStatusIndicators;
window.testCurrentTimeBasedStatus = testCurrentTimeBasedStatus;
window.testClockButtonAlignment = testClockButtonAlignment;
window.runEnhancedShiftStatusTests = runEnhancedShiftStatusTests;

// Auto-run tests
setTimeout(runEnhancedShiftStatusTests, 1000);
