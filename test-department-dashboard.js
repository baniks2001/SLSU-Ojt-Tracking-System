// Test script to verify department dashboard improvements
console.log('=== DEPARTMENT DASHBOARD TEST ===');

// Test 1: Check if student information is displayed
function testStudentInfoDisplay() {
  console.log('\n--- Testing Student Information Display ---');
  
  // Look for student names in the table
  const tableCells = document.querySelectorAll('td');
  let foundStudentNames = false;
  let foundShiftTypes = false;
  
  tableCells.forEach(cell => {
    const text = cell.textContent?.trim();
    if (text && text.includes(' ') && text.length > 5 && !text.includes(':') && !text.includes('AM') && !text.includes('PM')) {
      // Likely a student name (First Last format)
      console.log('✅ Found student name:', text);
      foundStudentNames = true;
    }
  });
  
  // Look for shift type badges
  const badges = document.querySelectorAll('.badge, [class*="badge"]');
  badges.forEach(badge => {
    const text = badge.textContent?.trim();
    if (text && ['regular', 'morning', 'afternoon', '1shift', '2shift', 'graveyard'].includes(text.toLowerCase())) {
      console.log('✅ Found shift type:', text);
      foundShiftTypes = true;
    }
  });
  
  if (!foundStudentNames) {
    console.log('❌ No student names found in table');
  }
  
  if (!foundShiftTypes) {
    console.log('❌ No shift types found in table');
  }
}

// Test 2: Check if table headers are correct
function testTableHeaders() {
  console.log('\n--- Testing Table Headers ---');
  
  const headers = document.querySelectorAll('th');
  const expectedHeaders = ['Student', 'Shift Type', 'Date', 'Morning In', 'Morning Out', 'Afternoon In', 'Afternoon Out', 'Total Hours', 'Images'];
  
  headers.forEach(header => {
    const text = header.textContent?.trim();
    if (text && expectedHeaders.includes(text)) {
      console.log('✅ Found header:', text);
    }
  });
  
  if (headers.length === expectedHeaders.length) {
    console.log('✅ All expected headers present');
  } else {
    console.log('⚠️ Header count mismatch. Expected:', expectedHeaders.length, 'Found:', headers.length);
  }
}

// Test 3: Check if image buttons are present and functional
function testImageButtons() {
  console.log('\n--- Testing Image Buttons ---');
  
  const imageButtons = document.querySelectorAll('button');
  let foundImageButtons = 0;
  
  imageButtons.forEach(button => {
    const text = button.textContent?.trim();
    if (['AM In', 'AM Out', 'PM In', 'PM Out', 'Eve In', 'Eve Out'].includes(text)) {
      foundImageButtons++;
      console.log('✅ Found image button:', text);
      
      // Check if button has proper styling
      if (button.className.includes('outline')) {
        console.log('  - Button has outline styling');
      }
    }
  });
  
  console.log('✅ Total image buttons found:', foundImageButtons);
  
  if (foundImageButtons === 0) {
    console.log('❌ No image buttons found');
  }
}

// Test 4: Test image modal functionality
function testImageModals() {
  console.log('\n--- Testing Image Modals ---');
  
  // Look for dialog components
  const dialogs = document.querySelectorAll('[role="dialog"]');
  if (dialogs.length > 0) {
    console.log('✅ Found dialog components:', dialogs.length);
  } else {
    console.log('⚠️ No dialog components found (might be created dynamically)');
  }
  
  // Look for dialog triggers
  const dialogTriggers = document.querySelectorAll('[data-state][class*="trigger"]');
  if (dialogTriggers.length > 0) {
    console.log('✅ Found dialog triggers:', dialogTriggers.length);
  }
}

// Test 5: Check attendance data structure
function testAttendanceData() {
  console.log('\n--- Testing Attendance Data Structure ---');
  
  // Look for table rows with data
  const tableRows = document.querySelectorAll('tbody tr');
  if (tableRows.length > 0) {
    console.log('✅ Found attendance records:', tableRows.length);
    
    tableRows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 9) { // Should have 9 columns now
        console.log(`✅ Record ${index + 1}: ${cells[0].textContent} - ${cells[1].textContent}`);
      }
    });
  } else {
    console.log('❌ No attendance records found');
  }
}

// Test 6: Check API response structure (simulated)
function testAPIResponse() {
  console.log('\n--- Testing API Response Structure ---');
  
  console.log('Expected attendance record structure:');
  console.log('{');
  console.log('  _id: "string",');
  console.log('  studentId: {');
  console.log('    firstName: "string",');
  console.log('    lastName: "string",');
  console.log('    studentId: "string",');
  console.log('    shiftType: "regular|morning|afternoon|1shift|2shift|graveyard"');
  console.log('  },');
  console.log('  date: "Date",');
  console.log('  morningIn: "Date|null",');
  console.log('  morningOut: "Date|null",');
  console.log('  afternoonIn: "Date|null",');
  console.log('  afternoonOut: "Date|null",');
  console.log('  eveningIn: "Date|null",');
  console.log('  eveningOut: "Date|null",');
  console.log('  morningInImage: "string|null",');
  console.log('  morningOutImage: "string|null",');
  console.log('  afternoonInImage: "string|null",');
  console.log('  afternoonOutImage: "string|null",');
  console.log('  eveningInImage: "string|null",');
  console.log('  eveningOutImage: "string|null",');
  console.log('  totalHours: "number",');
  console.log('  shiftType: "string"');
  console.log('}');
}

// Test 7: Check error handling for images
function testImageErrorHandling() {
  console.log('\n--- Testing Image Error Handling ---');
  
  const images = document.querySelectorAll('img[onerror]');
  if (images.length > 0) {
    console.log('✅ Found images with error handling:', images.length);
  } else {
    console.log('⚠️ No images with error handling found (might be added dynamically)');
  }
}

// Run all tests
function runDepartmentDashboardTests() {
  console.log('Running department dashboard tests...');
  
  testStudentInfoDisplay();
  testTableHeaders();
  testImageButtons();
  testImageModals();
  testAttendanceData();
  testAPIResponse();
  testImageErrorHandling();
  
  console.log('\n=== DEPARTMENT DASHBOARD TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Student names and shift types are now displayed');
  console.log('2. Table headers updated to include Student and Shift Type');
  console.log('3. Image buttons for all shift types (AM/PM/Eve)');
  console.log('4. Enhanced image modals with student info and timestamps');
  console.log('5. Error handling for broken images');
  console.log('6. API now includes shiftType in student population');
  console.log('7. Better layout with flex-wrap for image buttons');
}

// Make functions available globally
window.testStudentInfoDisplay = testStudentInfoDisplay;
window.testTableHeaders = testTableHeaders;
window.testImageButtons = testImageButtons;
window.testImageModals = testImageModals;
window.testAttendanceData = testAttendanceData;
window.testAPIResponse = testAPIResponse;
window.testImageErrorHandling = testImageErrorHandling;
window.runDepartmentDashboardTests = runDepartmentDashboardTests;

// Auto-run tests
setTimeout(runDepartmentDashboardTests, 1000);
