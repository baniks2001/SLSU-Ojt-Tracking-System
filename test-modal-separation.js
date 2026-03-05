// Test script to verify modal separation for Verify Your Identity and Review Image
console.log('=== MODAL SEPARATION TEST ===');

// Test 1: Check if both modals exist
function testModalExistence() {
  console.log('\n--- Testing Modal Existence ---');
  
  // Look for modal elements
  const dialogs = document.querySelectorAll('[role="dialog"]');
  console.log(`Found ${dialogs.length} modal dialogs`);
  
  // Check for verification modal
  const verificationModal = Array.from(dialogs).find(dialog => 
    dialog.textContent?.includes('Verify Your Identity')
  );
  
  // Check for review modal
  const reviewModal = Array.from(dialogs).find(dialog => 
    dialog.textContent?.includes('Review Your Photo')
  );
  
  console.log('Verification Modal:', verificationModal ? '✅ Found' : '❌ Not found');
  console.log('Review Modal:', reviewModal ? '✅ Found' : '❌ Not found');
  
  return { verificationModal, reviewModal };
}

// Test 2: Test modal flow simulation
function testModalFlow() {
  console.log('\n--- Testing Modal Flow ---');
  
  // Look for clock in/out buttons
  const clockButtons = document.querySelectorAll('button');
  const clockInButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock In')
  );
  const clockOutButton = Array.from(clockButtons).find(btn => 
    btn.textContent?.includes('Clock Out')
  );
  
  console.log('Clock In Button:', clockInButton ? '✅ Found' : '❌ Not found');
  console.log('Clock Out Button:', clockOutButton ? '✅ Found' : '❌ Not found');
  
  // Simulate clicking a clock button to open verification modal
  if (clockInButton) {
    console.log('Simulating Clock In button click...');
    clockInButton.click();
    
    setTimeout(() => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const verificationModal = Array.from(dialogs).find(dialog => 
        dialog.textContent?.includes('Verify Your Identity')
      );
      
      if (verificationModal) {
        console.log('✅ Verification modal opened successfully');
        
        // Check modal content
        const hasCameraIcon = verificationModal.innerHTML.includes('camera') || 
                            verificationModal.querySelector('svg');
        const hasOpenCameraButton = Array.from(verificationModal.querySelectorAll('button'))
          .some(btn => btn.textContent?.includes('Open Camera'));
        
        console.log('  Has camera icon:', hasCameraIcon ? '✅' : '❌');
        console.log('  Has Open Camera button:', hasOpenCameraButton ? '✅' : '❌');
        console.log('  Should NOT have image review section:', 
          !verificationModal.textContent?.includes('Review Your Photo') ? '✅' : '❌');
      } else {
        console.log('❌ Verification modal did not open');
      }
    }, 500);
  }
}

// Test 3: Test image capture flow
function testImageCaptureFlow() {
  console.log('\n--- Testing Image Capture Flow ---');
  
  // Look for capture photo button
  const captureButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Capture Photo')
  );
  
  console.log('Capture Photo Button:', captureButton ? '✅ Found' : '❌ Not found');
  
  if (captureButton) {
    console.log('Simulating Capture Photo button click...');
    captureButton.click();
    
    setTimeout(() => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      
      // Check if verification modal closed
      const verificationModal = Array.from(dialogs).find(dialog => 
        dialog.textContent?.includes('Verify Your Identity')
      );
      
      // Check if review modal opened
      const reviewModal = Array.from(dialogs).find(dialog => 
        dialog.textContent?.includes('Review Your Photo')
      );
      
      console.log('Verification modal closed:', !verificationModal ? '✅' : '❌');
      console.log('Review modal opened:', reviewModal ? '✅' : '❌');
      
      if (reviewModal) {
        // Check review modal content
        const hasCheckIcon = reviewModal.innerHTML.includes('check-circle') || 
                           reviewModal.querySelector('svg');
        const hasRetakeButton = Array.from(reviewModal.querySelectorAll('button'))
          .some(btn => btn.textContent?.includes('Retake Photo'));
        const hasConfirmButton = Array.from(reviewModal.querySelectorAll('button'))
          .some(btn => btn.textContent?.includes('Confirm'));
        const hasSuccessMessage = reviewModal.textContent?.includes('Photo Captured Successfully');
        
        console.log('  Has check icon:', hasCheckIcon ? '✅' : '❌');
        console.log('  Has success message:', hasSuccessMessage ? '✅' : '❌');
        console.log('  Has Retake Photo button:', hasRetakeButton ? '✅' : '❌');
        console.log('  Has Confirm button:', hasConfirmButton ? '✅' : '❌');
        console.log('  Has image display:', reviewModal.querySelector('img') ? '✅' : '❌');
      }
    }, 500);
  }
}

// Test 4: Test retake functionality
function testRetakeFunctionality() {
  console.log('\n--- Testing Retake Functionality ---');
  
  // Look for retake photo button in review modal
  const retakeButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Retake Photo')
  );
  
  console.log('Retake Photo Button:', retakeButton ? '✅ Found' : '❌ Not found');
  
  if (retakeButton) {
    console.log('Simulating Retake Photo button click...');
    retakeButton.click();
    
    setTimeout(() => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      
      // Check if review modal closed
      const reviewModal = Array.from(dialogs).find(dialog => 
        dialog.textContent?.includes('Review Your Photo')
      );
      
      // Check if verification modal reopened
      const verificationModal = Array.from(dialogs).find(dialog => 
        dialog.textContent?.includes('Verify Your Identity')
      );
      
      console.log('Review modal closed:', !reviewModal ? '✅' : '❌');
      console.log('Verification modal reopened:', verificationModal ? '✅' : '❌');
    }, 500);
  }
}

// Test 5: Test modal styling and accessibility
function testModalStyling() {
  console.log('\n--- Testing Modal Styling and Accessibility ---');
  
  const dialogs = document.querySelectorAll('[role="dialog"]');
  
  dialogs.forEach((dialog, index) => {
    const isVerification = dialog.textContent?.includes('Verify Your Identity');
    const isReview = dialog.textContent?.includes('Review Your Photo');
    
    if (isVerification || isReview) {
      console.log(`Modal ${index + 1} (${isVerification ? 'Verification' : 'Review'}):`);
      
      // Check modal properties
      const hasAriaRole = dialog.getAttribute('role') === 'dialog';
      const hasAriaModal = dialog.getAttribute('aria-modal') === 'true';
      const hasBackdrop = document.querySelector('[data-state="open"]');
      
      console.log('  Has aria role="dialog":', hasAriaRole ? '✅' : '❌');
      console.log('  Has aria-modal="true":', hasAriaModal ? '✅' : '❌');
      console.log('  Has backdrop:', hasBackdrop ? '✅' : '❌');
      
      // Check modal title
      const title = dialog.querySelector('[role="heading"]');
      console.log('  Has proper title:', title ? '✅' : '❌');
      
      // Check modal content structure
      const hasDialogContent = dialog.querySelector('.sm\\:max-w-2xl');
      const hasDialogHeader = dialog.querySelector('.dialog-header');
      const hasProperButtons = dialog.querySelectorAll('button').length > 0;
      
      console.log('  Has proper content structure:', hasDialogContent ? '✅' : '❌');
      console.log('  Has dialog header:', hasDialogHeader ? '✅' : '❌');
      console.log('  Has action buttons:', hasProperButtons ? '✅' : '❌');
    }
  });
}

// Run all tests
function runModalSeparationTests() {
  console.log('Running modal separation tests...');
  
  testModalExistence();
  
  // Wait a bit then test flow
  setTimeout(() => {
    testModalFlow();
    
    setTimeout(() => {
      testImageCaptureFlow();
      
      setTimeout(() => {
        testRetakeFunctionality();
        
        setTimeout(() => {
          testModalStyling();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 500);
  
  console.log('\n=== MODAL SEPARATION TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Verify Your Identity modal should only show camera capture');
  console.log('2. Review Your Photo modal should show captured image with retake/confirm');
  console.log('3. Image capture should close verification modal and open review modal');
  console.log('4. Retake should close review modal and reopen verification modal');
  console.log('5. Both modals should have proper styling and accessibility');
}

// Make functions available globally
window.testModalExistence = testModalExistence;
window.testModalFlow = testModalFlow;
window.testImageCaptureFlow = testImageCaptureFlow;
window.testRetakeFunctionality = testRetakeFunctionality;
window.testModalStyling = testModalStyling;
window.runModalSeparationTests = runModalSeparationTests;

// Auto-run tests
setTimeout(runModalSeparationTests, 1000);
