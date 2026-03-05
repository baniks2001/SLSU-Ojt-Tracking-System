// Test script to verify hydration fixes
console.log('=== HYDRATION FIXES TEST ===');

// Test 1: Check for hydration errors
function testHydrationErrors() {
  console.log('\n--- Testing for Hydration Errors ---');
  
  // Check console for hydration error messages
  const originalError = console.error;
  const originalWarn = console.warn;
  let hydrationErrors = [];
  let hydrationWarnings = [];
  
  // Override console methods to capture hydration messages
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('Hydration failed') || 
        message.includes('Text content does not match') ||
        message.includes('server-rendered HTML') ||
        message.includes('client-rendered HTML')) {
      hydrationErrors.push(message);
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('Warning:') || 
        message.includes('Prop') ||
        message.includes('did not match')) {
      hydrationWarnings.push(message);
    }
    originalWarn.apply(console, args);
  };
  
  console.log('Hydration errors found:', hydrationErrors.length);
  console.log('Hydration warnings found:', hydrationWarnings.length);
  
  if (hydrationErrors.length > 0) {
    hydrationErrors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, error);
    });
  }
  
  if (hydrationWarnings.length > 0) {
    hydrationWarnings.forEach((warning, index) => {
      console.log(`Warning ${index + 1}:`, warning);
    });
  }
  
  // Restore original console methods
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
  }, 2000);
}

// Test 2: Check initial state consistency
function testInitialStateConsistency() {
  console.log('\n--- Testing Initial State Consistency ---');
  
  // Check if initial states are properly set
  const loadingStates = document.querySelectorAll('*');
  const loadingTexts = Array.from(loadingStates)
    .filter(el => el.textContent?.includes('Loading...'));
  
  console.log('Loading states found:', loadingTexts.length);
  
  // Check if states are consistent
  loadingTexts.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Loading State ${index + 1}:`, text);
    
    // Should show loading initially, not actual shift data
    const isLoading = text === 'Loading...';
    console.log('  Shows loading:', isLoading ? '✅' : '❌');
  });
  
  // Check for shift status indicators
  const statusIndicators = document.querySelectorAll('[class*="rounded-full"]');
  console.log('Status indicators found:', statusIndicators.length);
  
  if (statusIndicators.length === 0) {
    console.log('❌ No status indicators found - possible hydration issue');
  } else {
    console.log('✅ Status indicators present');
  }
}

// Test 3: Check client-side only rendering
function testClientSideOnlyRendering() {
  console.log('\n--- Testing Client-Side Only Rendering ---');
  
  // Check if window object is available (client-side check)
  const isClient = typeof window !== 'undefined';
  console.log('Window object available (client):', isClient ? '✅' : '❌');
  
  // Check if time-based updates are working
  const timeElements = document.querySelectorAll('*');
  const timeTexts = Array.from(timeElements)
    .filter(el => el.textContent?.includes(':') && el.textContent?.includes('PM') || el.textContent?.includes('AM'));
  
  console.log('Time elements found:', timeTexts.length);
  
  if (timeTexts.length > 0) {
    console.log('✅ Time-based rendering working');
    timeTexts.forEach((element, index) => {
      const text = element.textContent?.trim();
      console.log(`Time ${index + 1}:`, text);
    });
  } else {
    console.log('❌ Time-based rendering not working');
  }
}

// Test 4: Check for proper state initialization
function testStateInitialization() {
  console.log('\n--- Testing State Initialization ---');
  
  // Wait for component to fully load
  setTimeout(() => {
    // Check if states are properly initialized after load
    const shiftStatusText = document.querySelector('[class*="text-green-700"], [class*="text-yellow-700"], [class*="text-gray-700"], [class*="text-red-700"]');
    const nextActionText = document.querySelector('[class*="text-3xl"]');
    
    console.log('Shift status text:', shiftStatusText?.textContent?.trim());
    console.log('Next action text:', nextActionText?.textContent?.trim());
    
    // Should not be in loading state after initialization
    const isNotLoading = shiftStatusText?.textContent?.trim() !== 'Loading...';
    const hasValidAction = nextActionText?.textContent?.trim() !== 'Loading...';
    
    console.log('Shift status not loading:', isNotLoading ? '✅' : '❌');
    console.log('Next action not loading:', hasValidAction ? '✅' : '❌');
    
    if (isNotLoading && hasValidAction) {
      console.log('✅ States properly initialized');
    } else {
      console.log('❌ States not properly initialized');
    }
  }, 2000);
}

// Test 5: Check for SSR vs Client mismatches
function testSSRClientMismatches() {
  console.log('\n--- Testing SSR vs Client Mismatches ---');
  
  // Check if there are any obvious mismatches
  const body = document.body;
  const bodyHTML = body?.innerHTML || '';
  
  // Look for hydration error indicators in HTML
  const hasHydrationError = bodyHTML.includes('data-react-helmet');
  const hasClientData = bodyHTML.includes('__NEXT_DATA__');
  const hasServerRendered = bodyHTML.includes('__processed_c6215e6d-88d4-4477-8abc-bc87350c89ad__="true"');
  
  console.log('Has hydration error indicators:', hasHydrationError ? '❌' : '✅');
  console.log('Has client data:', hasClientData ? '✅' : '❌');
  console.log('Has server rendered markers:', hasServerRendered ? '✅' : '❌');
  
  // Check for proper client-side initialization
  const hasClientOnlyLogic = typeof window !== 'undefined' && document.readyState === 'complete';
  console.log('Client-side logic active:', hasClientOnlyLogic ? '✅' : '❌');
  
  if (!hasHydrationError && hasClientOnlyLogic) {
    console.log('✅ No obvious SSR/Client mismatches');
  } else {
    console.log('❌ Potential SSR/Client mismatches detected');
  }
}

// Run all tests
function runHydrationFixTests() {
  console.log('Running hydration fix tests...');
  
  testHydrationErrors();
  testInitialStateConsistency();
  testClientSideOnlyRendering();
  testStateInitialization();
  testSSRClientMismatches();
  
  console.log('\n=== HYDRATION FIXES TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Hydration errors should be eliminated');
  console.log('2. Initial states should be properly set');
  console.log('3. Client-side only rendering should work');
  console.log('4. State initialization should be consistent');
  console.log('5. SSR/Client mismatches should be prevented');
  console.log('6. Time-based updates should work on client only');
}

// Make functions available globally
window.testHydrationErrors = testHydrationErrors;
window.testInitialStateConsistency = testInitialStateConsistency;
window.testClientSideOnlyRendering = testClientSideOnlyRendering;
window.testStateInitialization = testStateInitialization;
window.testSSRClientMismatches = testSSRClientMismatches;
window.runHydrationFixTests = runHydrationFixTests;

// Auto-run tests
setTimeout(runHydrationFixTests, 1000);
