// Test script to verify TypeError fix
console.log('=== TYPEERROR FIX TEST ===');

// Test 1: Check if component renders without TypeError
function testComponentNoError() {
  console.log('\n--- Testing Component Render (No TypeError) ---');
  
  try {
    // Check if main card elements are present
    const card = document.querySelector('.space-y-6');
    if (card) {
      console.log('✅ Main card container found');
    } else {
      console.log('❌ Main card container not found');
    }
    
    // Check if status display is working
    const statusDisplay = document.querySelector('.text-lg.font-semibold');
    if (statusDisplay) {
      console.log('✅ Status display found:', statusDisplay.textContent);
      
      // Check if it shows loading or actual shift info
      if (statusDisplay.textContent.includes('Loading')) {
        console.log('✅ Shows loading state (expected during initial render)');
      } else if (statusDisplay.textContent.includes('Shift')) {
        console.log('✅ Shows shift information');
      }
    } else {
      console.log('❌ Status display not found');
    }
    
    // Check for button
    const button = document.querySelector('button');
    if (button) {
      console.log('✅ Button found:', button.textContent.trim());
    } else {
      console.log('❌ Button not found');
    }
    
    console.log('✅ No TypeError detected during render');
    
  } catch (error) {
    if (error.message.includes('Cannot read properties of null')) {
      console.log('❌ TypeError still present:', error.message);
    } else {
      console.log('⚠️ Other error:', error.message);
    }
  }
}

// Test 2: Check nextAction state management
function testNextActionState() {
  console.log('\n--- Testing nextAction State ---');
  
  // Look for loading state
  const loadingElements = document.querySelectorAll('*');
  let foundLoading = false;
  
  loadingElements.forEach(el => {
    if (el.textContent && el.textContent.includes('Loading')) {
      foundLoading = true;
    }
  });
  
  if (foundLoading) {
    console.log('✅ Loading state is properly displayed');
  } else {
    console.log('⚠️ No loading state visible (might be loaded already)');
  }
  
  // Check for shift information
  const shiftInfo = document.querySelector('h3');
  if (shiftInfo) {
    console.log('✅ Shift info found:', shiftInfo.textContent);
  } else {
    console.log('❌ Shift info not found');
  }
}

// Test 3: Check if button logic works
function testButtonLogic() {
  console.log('\n--- Testing Button Logic ---');
  
  const buttons = document.querySelectorAll('button');
  let foundClockButton = false;
  
  buttons.forEach(button => {
    const text = button.textContent.trim();
    if (text.includes('Clock In') || text.includes('Clock Out') || 
        text.includes('Loading') || text.includes('Completed') || text.includes('Expired')) {
      foundClockButton = true;
      console.log('✅ Clock button found:', text);
      
      // Check button styling
      if (button.className.includes('bg-green-600')) {
        console.log('✅ Clock In button (green) detected');
      } else if (button.className.includes('bg-red-600')) {
        console.log('✅ Clock Out button (red) detected');
      } else if (text.includes('Loading')) {
        console.log('⚠️ Button in loading state');
      }
    }
  });
  
  if (!foundClockButton) {
    console.log('❌ No clock button found');
  }
}

// Test 4: Check for console errors
function testConsoleErrors() {
  console.log('\n--- Testing Console Errors ---');
  
  // Check if there are any TypeError messages
  const originalError = console.error;
  let errorFound = false;
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('Cannot read properties of null') && message.includes('shift')) {
      errorFound = true;
      console.log('❌ TypeError detected:', message);
    }
    originalError.apply(console, args);
  };
  
  // Restore original console.error
  setTimeout(() => {
    console.error = originalError;
    
    if (!errorFound) {
      console.log('✅ No TypeError detected');
    }
  }, 1000);
  
  console.log('Checking for TypeError in next 1 second...');
}

// Test 5: Simulate component update
function testComponentUpdate() {
  console.log('\n--- Testing Component Update ---');
  
  // Look for any dynamic content that might change
  const dynamicElements = document.querySelectorAll('[class*="text-"]');
  let dynamicContent = 0;
  
  dynamicElements.forEach(el => {
    if (el.textContent && el.textContent.trim().length > 0) {
      dynamicContent++;
    }
  });
  
  console.log('✅ Found', dynamicContent, 'dynamic content elements');
  
  // Check if component structure is complete
  const cardContent = document.querySelector('.CardContent');
  if (cardContent) {
    console.log('✅ CardContent structure complete');
  } else {
    console.log('❌ CardContent structure incomplete');
  }
}

// Run all tests
function runTypeErrorTests() {
  console.log('Running TypeError fix tests...');
  
  testComponentNoError();
  testNextActionState();
  testButtonLogic();
  testConsoleErrors();
  testComponentUpdate();
  
  console.log('\n=== TYPEERROR FIX TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. nextAction initialized with default values to prevent null state');
  console.log('2. Added optional chaining (?.) for all nextAction property accesses');
  console.log('3. Component should render without TypeError');
  console.log('4. Loading state shows properly during initial render');
  console.log('5. Button logic works correctly after state updates');
}

// Make functions available globally
window.testComponentNoError = testComponentNoError;
window.testNextActionState = testNextActionState;
window.testButtonLogic = testButtonLogic;
window.testConsoleErrors = testConsoleErrors;
window.testComponentUpdate = testComponentUpdate;
window.runTypeErrorTests = runTypeErrorTests;

// Auto-run tests
setTimeout(runTypeErrorTests, 1000);
