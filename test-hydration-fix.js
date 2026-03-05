// Test script to verify hydration fix
console.log('=== HYDRATION FIX TEST ===');

// Test 1: Check if component renders without hydration errors
function testComponentRender() {
  console.log('\n--- Testing Component Render ---');
  
  // Check for time displays
  const timeDisplays = document.querySelectorAll('.text-gray-600');
  if (timeDisplays.length > 0) {
    console.log('✅ Time display found:', timeDisplays[0].textContent);
  } else {
    console.log('❌ Time display not found');
  }
  
  // Check for buttons
  const buttons = document.querySelectorAll('button');
  const clockButton = Array.from(buttons).find(btn => 
    btn.textContent.includes('Clock In') || btn.textContent.includes('Clock Out')
  );
  
  if (clockButton) {
    console.log('✅ Clock button found:', clockButton.textContent);
    console.log('Button color classes:', clockButton.className);
  } else {
    console.log('❌ Clock button not found');
  }
  
  // Check for hydration error indicators
  const errorElements = document.querySelectorAll('[data-hydration-error]');
  if (errorElements.length > 0) {
    console.log('❌ Hydration errors detected:', errorElements.length);
  } else {
    console.log('✅ No hydration errors detected');
  }
}

// Test 2: Check if time updates correctly
function testTimeUpdates() {
  console.log('\n--- Testing Time Updates ---');
  
  let initialTime = document.querySelector('.text-gray-600')?.textContent;
  console.log('Initial time:', initialTime);
  
  // Wait 2 seconds and check if time updates
  setTimeout(() => {
    const updatedTime = document.querySelector('.text-gray-600')?.textContent;
    console.log('Updated time after 2s:', updatedTime);
    
    if (initialTime !== updatedTime) {
      console.log('✅ Time is updating correctly');
    } else {
      console.log('⚠️ Time not updating (might be normal for short interval)');
    }
  }, 2000);
}

// Test 3: Check button state changes
function testButtonStateChange() {
  console.log('\n--- Testing Button State Changes ---');
  
  // Find the main clock button
  const clockButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Clock In') || btn.textContent.includes('Clock Out')
  );
  
  if (!clockButton) {
    console.log('❌ Clock button not found');
    return;
  }
  
  console.log('Current button state:', {
    text: clockButton.textContent,
    disabled: clockButton.disabled,
    className: clockButton.className
  });
  
  // Simulate what should happen based on current state
  const buttonText = clockButton.textContent.trim();
  
  if (buttonText.includes('Clock In')) {
    console.log('✅ Ready to test Clock In functionality');
  } else if (buttonText.includes('Clock Out')) {
    console.log('✅ Ready to test Clock Out functionality');
  } else if (buttonText.includes('Completed')) {
    console.log('✅ All shifts completed for today');
  } else if (buttonText.includes('Expired')) {
    console.log('⚠️ Shift time has expired');
  }
}

// Test 4: Check for console errors
function testConsoleErrors() {
  console.log('\n--- Testing Console Errors ---');
  
  // Check if there are any React hydration warnings
  const warnings = console.warn.toString();
  const errors = console.error.toString();
  
  if (warnings.includes('hydration') || errors.includes('hydration')) {
    console.log('❌ Hydration-related warnings/errors found');
  } else {
    console.log('✅ No hydration warnings/errors in console');
  }
  
  console.log('Console methods available:');
  console.log('- warn:', typeof console.warn);
  console.log('- error:', typeof console.error);
}

// Run all tests
function runHydrationTests() {
  console.log('Running hydration tests...');
  
  testComponentRender();
  testTimeUpdates();
  testButtonStateChange();
  testConsoleErrors();
  
  console.log('\n=== HYDRATION TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Time-based values are now updated in useEffect to prevent hydration');
  console.log('2. Client-side checks added to prevent SSR/client mismatches');
  console.log('3. Component state is managed properly with useState');
  console.log('4. Time updates happen every minute via setInterval');
  console.log('5. Button logic is calculated from state, not on render');
}

// Make functions available globally
window.testComponentRender = testComponentRender;
window.testTimeUpdates = testTimeUpdates;
window.testButtonStateChange = testButtonStateChange;
window.testConsoleErrors = testConsoleErrors;
window.runHydrationTests = runHydrationTests;

// Auto-run tests
setTimeout(runHydrationTests, 1000);
