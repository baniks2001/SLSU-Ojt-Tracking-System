// Test script to verify graveyard shift column display and data integrity
console.log('=== GRAVEYARD SHIFT FIX TEST ===');

// Test 1: Check if graveyard shift shows correct columns
function testGraveyardShiftColumns() {
  console.log('\n--- Testing Graveyard Shift Column Display ---');
  
  // Look for table rows
  const tableRows = document.querySelectorAll('tbody tr');
  let graveyardRecords = 0;
  let correctColumnDisplay = 0;
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const shiftTypeCell = cells[1]; // Shift type is in the 2nd column (index 1)
    const shiftTypeText = shiftTypeCell?.textContent?.trim();
    
    if (shiftTypeText && shiftTypeText.toLowerCase().includes('graveyard')) {
      graveyardRecords++;
      console.log(`\nGraveyard Record ${index + 1}: "${shiftTypeText}"`);
      
      // Count visible time columns (excluding Student, Shift Type, Date, Total Hours, Images columns)
      // Expected: Only Evening In/Out columns should be visible (2 columns)
      const timeColumnsStart = 3; // After Student, Shift Type, Date
      const timeColumnsEnd = 9;   // Before Total Hours and Images
      const visibleTimeColumns = [];
      
      for (let i = timeColumnsStart; i < timeColumnsEnd; i++) {
        if (cells[i] && cells[i].offsetWidth !== 0) {
          visibleTimeColumns.push(i);
        }
      }
      
      console.log('  Visible time columns:', visibleTimeColumns.length);
      console.log('  Expected for graveyard: Only Evening In/Out (2 columns)');
      
      // Check if morning/afternoon columns are hidden
      const morningInVisible = cells[3] && cells[3].offsetWidth !== 0; // Morning In column
      const morningOutVisible = cells[4] && cells[4].offsetWidth !== 0; // Morning Out column
      const afternoonInVisible = cells[5] && cells[5].offsetWidth !== 0; // Afternoon In column
      const afternoonOutVisible = cells[6] && cells[6].offsetWidth !== 0; // Afternoon Out column
      const eveningInVisible = cells[7] && cells[7].offsetWidth !== 0; // Evening In column
      const eveningOutVisible = cells[8] && cells[8].offsetWidth !== 0; // Evening Out column
      
      if (!morningInVisible && !morningOutVisible && !afternoonInVisible && !afternoonOutVisible && eveningInVisible && eveningOutVisible) {
        console.log('  ✅ Correct: Only evening columns visible for graveyard shift');
        correctColumnDisplay++;
      } else {
        console.log('  ❌ Incorrect: Graveyard shift should only show evening columns');
        console.log('    Morning In visible:', morningInVisible);
        console.log('    Morning Out visible:', morningOutVisible);
        console.log('    Afternoon In visible:', afternoonInVisible);
        console.log('    Afternoon Out visible:', afternoonOutVisible);
        console.log('    Evening In visible:', eveningInVisible);
        console.log('    Evening Out visible:', eveningOutVisible);
      }
    }
  });
  
  console.log(`\nGraveyard Records Found: ${graveyardRecords}`);
  console.log(`Correct Column Display: ${correctColumnDisplay}/${graveyardRecords}`);
  
  if (graveyardRecords === 0) {
    console.log('⚠️ No graveyard records found to test');
  }
}

// Test 2: Check if data fields are correctly populated
function testGraveyardDataFields() {
  console.log('\n--- Testing Graveyard Data Fields ---');
  
  // Look for any records that might have graveyard data
  const tableRows = document.querySelectorAll('tbody tr');
  let hasEveningData = false;
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const shiftTypeCell = cells[1]; // Shift type is in the 2nd column (index 1)
    const shiftTypeText = shiftTypeCell?.textContent?.trim();
    
    if (shiftTypeText && shiftTypeText.toLowerCase().includes('graveyard')) {
      // Check if there's any evening data in the row
      const hasEveningIn = cells[7] && cells[7].textContent && cells[7].textContent.trim() !== '-';
      const hasEveningOut = cells[8] && cells[8].textContent && cells[8].textContent.trim() !== '-';
      
      if (hasEveningIn || hasEveningOut) {
        hasEveningData = true;
        console.log(`✅ Graveyard Record ${index + 1} has evening data:`);
        console.log(`  Evening In: ${hasEveningIn ? cells[7].textContent.trim() : 'No data'}`);
        console.log(`  Evening Out: ${hasEveningOut ? cells[8].textContent.trim() : 'No data'}`);
      }
    }
  });
  
  if (hasEveningData) {
    console.log('✅ Found graveyard records with evening data');
  } else {
    console.log('⚠️ No graveyard records with evening data found');
  }
}

// Test 3: Check shift type badge display
function testShiftTypeBadges() {
  console.log('\n--- Testing Shift Type Badge Display ---');
  
  const badges = document.querySelectorAll('.badge, [class*="badge"]');
  let graveyardBadges = 0;
  
  badges.forEach(badge => {
    const text = badge.textContent?.trim();
    if (text && text.toLowerCase().includes('graveyard')) {
      graveyardBadges++;
      console.log('✅ Found graveyard badge:', text);
    }
  });
  
  console.log(`Graveyard badges found: ${graveyardBadges}`);
}

// Test 4: Check image buttons for graveyard shift
function testGraveyardImageButtons() {
  console.log('\n--- Testing Graveyard Image Buttons ---');
  
  const tableRows = document.querySelectorAll('tbody tr');
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const shiftTypeCell = cells[1]; // Shift type is in the 2nd column (index 1)
    const shiftTypeText = shiftTypeCell?.textContent?.trim();
    const imageCell = cells[cells.length - 2]; // Second to last column (Images)
    
    if (shiftTypeText && shiftTypeText.toLowerCase().includes('graveyard') && imageCell) {
      const imageButtons = imageCell.querySelectorAll('button');
      const buttonTexts = Array.from(imageButtons).map(btn => btn.textContent?.trim());
      
      console.log(`Graveyard Record ${index + 1} Image buttons:`, buttonTexts);
      
      // Check if only evening buttons are present
      const hasEveningButtons = buttonTexts.some(btn => 
        btn.toLowerCase().includes('eve') && 
        !btn.toLowerCase().includes('am') && 
        !btn.toLowerCase().includes('pm')
      );
      
      if (hasEveningButtons) {
        console.log('✅ Graveyard shift shows only evening image buttons');
      } else {
        console.log('❌ Graveyard shift should only show evening image buttons');
        console.log('  Found buttons:', buttonTexts);
      }
    }
  });
}

// Test 5: Verify table structure
function testTableStructure() {
  console.log('\n--- Testing Table Structure ---');
  
  const headers = document.querySelectorAll('th');
  const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
  
  console.log('Table headers:', headerTexts);
  
  // Check if all expected headers are present
  const expectedHeaders = [
    'Student', 'Shift Type', 'Date', 
    'Morning In', 'Morning Out', 
    'Afternoon In', 'Afternoon Out',
    'Evening In', 'Evening Out',
    'Total Hours', 'Images'
  ];
  
  const hasAllHeaders = expectedHeaders.every(header => headerTexts.includes(header));
  if (hasAllHeaders) {
    console.log('✅ All expected headers present');
  } else {
    const missingHeaders = expectedHeaders.filter(h => !headerTexts.includes(h));
    console.log('❌ Missing headers:', missingHeaders);
  }
}

// Run all tests
function runGraveyardShiftTests() {
  console.log('Running graveyard shift tests...');
  
  testGraveyardShiftColumns();
  testGraveyardDataFields();
  testShiftTypeBadges();
  testGraveyardImageButtons();
  testTableStructure();
  
  console.log('\n=== GRAVEYARD SHIFT FIX TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Graveyard shift should only show Evening In/Out columns');
  console.log('2. Morning/Afternoon columns should be hidden for graveyard');
  console.log('3. Evening data fields (eveningIn/eveningOut) should be populated');
  console.log('4. Image buttons should only show Eve In/Out for graveyard');
  console.log('5. Shift type badge should display "Graveyard"');
  console.log('6. Table structure should include all columns but conditionally hide data');
}

// Make functions available globally
window.testGraveyardShiftColumns = testGraveyardShiftColumns;
window.testGraveyardDataFields = testGraveyardDataFields;
window.testShiftTypeBadges = testShiftTypeBadges;
window.testGraveyardImageButtons = testGraveyardImageButtons;
window.testTableStructure = testTableStructure;
window.runGraveyardShiftTests = runGraveyardShiftTests;

// Auto-run tests
setTimeout(runGraveyardShiftTests, 1000);
