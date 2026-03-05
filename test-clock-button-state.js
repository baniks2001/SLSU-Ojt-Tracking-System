// Test script to verify clock in/out button state updates
console.log('=== CLOCK BUTTON STATE TEST ===');

// Test 1: Check initial button state
function testInitialButtonState() {
  console.log('\n--- Testing Initial Button State ---');
  
  // Look for clock buttons
  const clockButtons = document.querySelectorAll('button');
  const clockInButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock In')
  );
  const clockOutButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock Out')
  );
  const completedButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Completed')
  );
  
  console.log('Clock In Button:', clockInButton ? '✅ Found' : '❌ Not found');
  console.log('Clock Out Button:', clockOutButton ? '✅ Found' : '❌ Not found');
  console.log('Completed Button:', completedButton ? '✅ Found' : '❌ Not found');
  
  // Check button visibility
  if (clockInButton) {
    const isVisible = clockInButton.offsetParent !== null;
    console.log('Clock In Button Visible:', isVisible ? '✅' : '❌');
  }
  
  if (clockOutButton) {
    const isVisible = clockOutButton.offsetParent !== null;
    console.log('Clock Out Button Visible:', isVisible ? '✅' : '❌');
  }
  
  if (completedButton) {
    const isVisible = completedButton.offsetParent !== null;
    console.log('Completed Button Visible:', isVisible ? '✅' : '❌');
  }
  
  return { clockInButton, clockOutButton, completedButton };
}

// Test 2: Simulate clock in and check button state change
function testClockInFlow() {
  console.log('\n--- Testing Clock In Flow ---');
  
  const clockInButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Clock In')
  );
  
  if (clockInButton) {
    console.log('Simulating Clock In button click...');
    
    // Check if verification modal opens
    clockInButton.click();
    
    setTimeout(() => {
      const verificationModal = document.querySelector('[role="dialog"]');
      if (verificationModal && verificationModal.textContent?.includes('Verify Your Identity')) {
        console.log('✅ Verification modal opened');
        
        // Look for Open Camera button
        const openCameraButton = Array.from(verificationModal.querySelectorAll('button'))
          .find(btn => btn.textContent?.includes('Open Camera'));
        
        if (openCameraButton) {
          console.log('Simulating Open Camera button click...');
          openCameraButton.click();
          
          setTimeout(() => {
            // Look for Capture Photo button
            const captureButton = Array.from(document.querySelectorAll('button'))
              .find(btn => btn.textContent?.includes('Capture Photo'));
            
            if (captureButton) {
              console.log('Simulating Capture Photo button click...');
              captureButton.click();
              
              setTimeout(() => {
                // Check if review modal opened
                const reviewModal = document.querySelector('[role="dialog"]');
                if (reviewModal && reviewModal.textContent?.includes('Review Your Photo')) {
                  console.log('✅ Review modal opened');
                  
                  // Look for Confirm button
                  const confirmButton = Array.from(reviewModal.querySelectorAll('button'))
                    .find(btn => btn.textContent?.includes('Confirm'));
                  
                  if (confirmButton) {
                    console.log('Simulating Confirm button click...');
                    confirmButton.click();
                    
                    setTimeout(() => {
                      // Check button state after successful clock in
                      checkButtonStateAfterClockIn();
                    }, 2000);
                  }
                }
              }, 1000);
            }
          }, 1000);
        }
      }
    }, 1000);
  } else {
    console.log('❌ No Clock In button found');
  }
}

// Test 3: Check button state after clock in
function checkButtonStateAfterClockIn() {
  console.log('\n--- Checking Button State After Clock In ---');
  
  // Wait for modals to close and buttons to update
  setTimeout(() => {
    const clockButtons = document.querySelectorAll('button');
    const clockInButton = Array.from(clockButtons).find(btn => 
      btn.textContent?.includes('Clock In')
    );
    const clockOutButton = Array.from(clockButtons).find(btn => 
      btn.textContent?.includes('Clock Out')
    );
    
    console.log('After Clock In - Clock In Button:', clockInButton ? '❌ Still visible' : '✅ Hidden');
    console.log('After Clock In - Clock Out Button:', clockOutButton ? '✅ Now visible' : '❌ Still hidden');
    
    if (clockOutButton) {
      const isVisible = clockOutButton.offsetParent !== null;
      console.log('Clock Out Button Visible:', isVisible ? '✅' : '❌');
    }
  }, 1000);
}

// Test 4: Check shift type display
function testShiftTypeDisplay() {
  console.log('\n--- Testing Shift Type Display ---');
  
  // Look for shift type information
  const shiftTypeElements = document.querySelectorAll('[class*="shift"], [class*="Shift"]');
  const shiftTypeText = Array.from(shiftTypeElements)
    .map(el => el.textContent?.trim())
    .filter(text => text && text.length > 0);
  
  console.log('Shift Type Elements Found:', shiftTypeElements.length);
  console.log('Shift Type Text:', shiftTypeText);
  
  // Check for specific shift type indicators
  const hasRegular = document.body.textContent?.includes('Regular') || false;
  const hasGraveyard = document.body.textContent?.includes('Graveyard') || false;
  const hasMorning = document.body.textContent?.includes('Morning') || false;
  const hasAfternoon = document.body.textContent?.includes('Afternoon') || false;
  
  console.log('Has Regular Shift:', hasRegular ? '✅' : '❌');
  console.log('Has Graveyard Shift:', hasGraveyard ? '✅' : '❌');
  console.log('Has Morning Shift:', hasMorning ? '✅' : '❌');
  console.log('Has Afternoon Shift:', hasAfternoon ? '✅' : '❌');
}

// Test 5: Check today's record display
function testTodayRecordDisplay() {
  console.log('\n--- Testing Today Record Display ---');
  
  // Look for attendance record cards
  const recordCards = document.querySelectorAll('.card');
  console.log('Record Cards Found:', recordCards.length);
  
  recordCards.forEach((card, index) => {
    const cardText = card.textContent?.trim();
    console.log(`Card ${index + 1}:`, cardText);
    
    // Check for time displays
    const hasTimeIn = cardText?.includes('In:') || false;
    const hasTimeOut = cardText?.includes('Out:') || false;
    const hasHours = cardText?.includes('Hours') || false;
    
    console.log(`  Has Time In:`, hasTimeIn ? '✅' : '❌');
    console.log(`  Has Time Out:`, hasTimeOut ? '✅' : '❌');
    console.log(`  Has Hours:`, hasHours ? '✅' : '❌');
  });
}

// Test 6: Test button state refresh
function testButtonStateRefresh() {
  console.log('\n--- Testing Button State Refresh ---');
  
  // Check if buttons update when data changes
  let initialButtonState = '';
  const clockButtons = document.querySelectorAll('button');
  
  Array.from(clockButtons).forEach(btn => {
    if (btn.textContent?.includes('Clock')) {
      initialButtonState += btn.textContent?.trim() + ' | ';
    }
  });
  
  console.log('Initial Button State:', initialButtonState);
  
  // Simulate time passing to trigger update
  setTimeout(() => {
    let updatedButtonState = '';
    const updatedButtons = document.querySelectorAll('button');
    
    Array.from(updatedButtons).forEach(btn => {
      if (btn.textContent?.includes('Clock')) {
        updatedButtonState += btn.textContent?.trim() + ' | ';
      }
    });
    
    console.log('Updated Button State:', updatedButtonState);
    console.log('Button state changed:', initialButtonState !== updatedButtonState ? '✅' : '❌');
  }, 3000);
}

// Run all tests
function runClockButtonStateTests() {
  console.log('Running clock button state tests...');
  
  testInitialButtonState();
  testShiftTypeDisplay();
  testTodayRecordDisplay();
  
  // Wait a bit then test clock in flow
  setTimeout(() => {
    testClockInFlow();
    testButtonStateRefresh();
  }, 2000);
  
  console.log('\n=== CLOCK BUTTON STATE TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Clock In/Out buttons should update based on today\'s record');
  console.log('2. After Clock In, Clock Out button should appear');
  console.log('3. After Clock Out, buttons should show Completed or next action');
  console.log('4. Shift type should be properly displayed');
  console.log('5. Today\'s record should show correct times');
  console.log('6. Button states should refresh when attendance data changes');
}

// Make functions available globally
window.testInitialButtonState = testInitialButtonState;
window.testClockInFlow = testClockInFlow;
window.checkButtonStateAfterClockIn = checkButtonStateAfterClockIn;
window.testShiftTypeDisplay = testShiftTypeDisplay;
window.testTodayRecordDisplay = testTodayRecordDisplay;
window.testButtonStateRefresh = testButtonStateRefresh;
window.runClockButtonStateTests = runClockButtonStateTests;

// Auto-run tests
setTimeout(runClockButtonStateTests, 1000);
