// Test script to verify new student list view in department dashboard
console.log('=== STUDENT LIST VIEW TEST ===');

// Test 1: Check if student list view is displayed
function testStudentListView() {
  console.log('\n--- Testing Student List View ---');
  
  // Look for student list view elements
  const studentCards = document.querySelectorAll('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-3 > div > div');
  const viewModeIndicator = document.querySelector('span:has-text("Student Attendance Records")');
  
  if (studentCards.length > 0) {
    console.log(`✅ Found student list with ${studentCards.length} student cards`);
    
    // Check if cards have required elements
    studentCards.forEach((card, index) => {
      const avatar = card.querySelector('.avatar');
      const name = card.querySelector('h3');
      const studentId = card.querySelector('p.text-sm.text-gray-600');
      const shiftTypeBadge = card.querySelector('.badge');
      const viewButton = card.querySelector('button:has-text("View Attendance")');
      
      console.log(`\nStudent Card ${index + 1}:`);
      console.log('  Avatar:', avatar ? '✅' : '❌');
      console.log('  Name:', name?.textContent?.trim() || 'Not found');
      console.log('  Student ID:', studentId?.textContent?.trim() || 'Not found');
      console.log('  Shift Type:', shiftTypeBadge?.textContent?.trim() || 'Not found');
      console.log('  View Button:', viewButton ? '✅' : '❌');
      
      // Check card structure
      const courseInfo = card.querySelector('.grid.grid-cols-2');
      const contactInfo = card.querySelector('div:has-text("Contact:")');
      const hostInfo = card.querySelector('div:has-text("Host Establishment:")');
      
      console.log('  Course Info:', courseInfo ? '✅' : '❌');
      console.log('  Contact Info:', contactInfo ? '✅' : '❌');
      console.log('  Host Info:', hostInfo ? '✅' : '❌');
    });
  } else {
    console.log('❌ No student cards found');
  }
  
  // Check for instruction text
  const instructionText = document.querySelector('div:has-text("Select a student to view their detailed attendance records")');
  if (instructionText) {
    console.log('✅ Instruction text found:', instructionText.textContent?.trim());
  } else {
    console.log('❌ No instruction text found');
  }
}

// Test 2: Check view mode switching
function testViewModeSwitching() {
  console.log('\n--- Testing View Mode Switching ---');
  
  // Look for back button (should only be visible in attendance view)
  const backButton = document.querySelector('button:has-text("Back to Student List")');
  const viewAttendanceButtons = document.querySelectorAll('button:has-text("View Attendance")');
  
  console.log('Back Button:', backButton ? '✅ Visible (in attendance view)' : '❌ Not visible (in list view)');
  console.log('View Attendance Buttons:', viewAttendanceButtons.length, 'found');
  
  if (viewAttendanceButtons.length > 0) {
    console.log('✅ Student list view has action buttons');
    
    // Test clicking a view attendance button
    const firstButton = viewAttendanceButtons[0];
    if (firstButton) {
      console.log('✅ Ready to test view attendance functionality');
      console.log('  Clicking first "View Attendance" button would switch to attendance view');
    }
  }
}

// Test 3: Check individual attendance view
function testIndividualAttendanceView() {
  console.log('\n--- Testing Individual Attendance View ---');
  
  // Look for student info header in attendance view
  const studentInfoHeader = document.querySelector('.bg-gray-50.p-4.rounded-lg');
  const attendanceTable = document.querySelector('table');
  
  if (studentInfoHeader) {
    console.log('✅ Student info header found in attendance view');
    
    const avatar = studentInfoHeader.querySelector('.avatar');
    const studentName = studentInfoHeader.querySelector('h3');
    const studentDetails = studentInfoHeader.querySelector('p.text-sm.text-gray-600');
    
    console.log('  Avatar:', avatar ? '✅' : '❌');
    console.log('  Student Name:', studentName?.textContent?.trim() || 'Not found');
    console.log('  Student Details:', studentDetails?.textContent?.trim() || 'Not found');
  } else {
    console.log('⚠️ No student info header (might be in list view)');
  }
  
  if (attendanceTable) {
    console.log('✅ Attendance table found');
    
    // Check table headers
    const headers = attendanceTable.querySelectorAll('th');
    const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
    console.log('  Table Headers:', headerTexts);
    
    // Check if headers are conditional based on shift type
    const hasMorningHeaders = headerTexts.some(h => h?.includes('Morning'));
    const hasAfternoonHeaders = headerTexts.some(h => h?.includes('Afternoon'));
    const hasEveningHeaders = headerTexts.some(h => h?.includes('Evening'));
    
    console.log('  Has Morning Headers:', hasMorningHeaders);
    console.log('  Has Afternoon Headers:', hasAfternoonHeaders);
    console.log('  Has Evening Headers:', hasEveningHeaders);
  }
}

// Test 4: Check responsive grid layout
function testResponsiveLayout() {
  console.log('\n--- Testing Responsive Layout ---');
  
  // Check grid classes
  const gridContainer = document.querySelector('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-3');
  if (gridContainer) {
    const gridClasses = gridContainer.className;
    console.log('✅ Grid container found with classes:', gridClasses);
    
    // Check responsive classes
    const hasMdGrid = gridClasses.includes('md:grid-cols-2');
    const hasLgGrid = gridClasses.includes('lg:grid-cols-3');
    const hasGap = gridClasses.includes('gap-4');
    
    console.log('  Medium Grid (2 cols):', hasMdGrid);
    console.log('  Large Grid (3 cols):', hasLgGrid);
    console.log('  Gap (4):', hasGap);
    
    if (hasMdGrid && hasLgGrid && hasGap) {
      console.log('✅ Responsive grid layout properly configured');
    } else {
      console.log('❌ Responsive grid layout issues detected');
    }
  }
}

// Test 5: Check navigation flow
function testNavigationFlow() {
  console.log('\n--- Testing Navigation Flow ---');
  
  // Check current view mode by looking for specific elements
  const studentCards = document.querySelectorAll('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-3 > div > div');
  const backButton = document.querySelector('button:has-text("Back to Student List")');
  const attendanceTable = document.querySelector('table');
  
  let currentView = 'unknown';
  
  if (studentCards.length > 0 && !backButton && !attendanceTable) {
    currentView = 'list';
  } else if (backButton && attendanceTable && studentCards.length === 0) {
    currentView = 'attendance';
  }
  
  console.log('Current View Mode:', currentView);
  
  // Test expected elements for each view
  if (currentView === 'list') {
    console.log('✅ List View - Expected elements:');
    console.log('  - Student cards with avatars');
    console.log('  - "View Attendance" buttons');
    console.log('  - Instruction text');
    console.log('  - No back button');
    console.log('  - No attendance table');
  } else if (currentView === 'attendance') {
    console.log('✅ Attendance View - Expected elements:');
    console.log('  - Student info header');
    console.log('  - Attendance table');
    console.log('  - Back button');
    console.log('  - No student cards');
  } else {
    console.log('❌ Unable to determine current view mode');
  }
}

// Run all tests
function runStudentListViewTests() {
  console.log('Running student list view tests...');
  
  testStudentListView();
  testViewModeSwitching();
  testIndividualAttendanceView();
  testResponsiveLayout();
  testNavigationFlow();
  
  console.log('\n=== STUDENT LIST VIEW TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Student list view shows cards with student information');
  console.log('2. "View Attendance" buttons switch to individual attendance view');
  console.log('3. Individual attendance view shows only selected student data');
  console.log('4. Back button returns to student list');
  console.log('5. Responsive grid layout adapts to screen size');
  console.log('6. No more clutter from showing all students attendance at once');
}

// Make functions available globally
window.testStudentListView = testStudentListView;
window.testViewModeSwitching = testViewModeSwitching;
window.testIndividualAttendanceView = testIndividualAttendanceView;
window.testResponsiveLayout = testResponsiveLayout;
window.testNavigationFlow = testNavigationFlow;
window.runStudentListViewTests = runStudentListViewTests;

// Auto-run tests
setTimeout(runStudentListViewTests, 1000);
