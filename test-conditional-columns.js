// Test script to verify conditional column display based on shift type
console.log('=== CONDITIONAL COLUMN DISPLAY TEST ===');

// Test 1: Check if columns are properly hidden based on shift type
function testConditionalColumns() {
  console.log('\n--- Testing Conditional Column Display ---');
  
  // Look for table rows
  const tableRows = document.querySelectorAll('tbody tr');
  
  if (tableRows.length === 0) {
    console.log('❌ No attendance records found to test');
    return;
  }
  
  console.log('Found', tableRows.length, 'attendance records to test');
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const shiftTypeCell = cells[1]; // Shift type is in the 2nd column (index 1)
    const shiftTypeText = shiftTypeCell?.textContent?.trim();
    
    if (shiftTypeText) {
      console.log(`\nRecord ${index + 1}: Shift Type = "${shiftTypeText}"`);
      
      // Count visible cells (excluding Student, Shift Type, Date, Total Hours, Images columns)
      // Expected: 6 time columns max (Morning In/Out, Afternoon In/Out, Evening In/Out)
      const timeColumnsStart = 3; // After Student, Shift Type, Date
      const timeColumnsEnd = 9;   // Before Total Hours and Images
      const visibleTimeColumns = [];
      
      for (let i = timeColumnsStart; i < timeColumnsEnd; i++) {
        if (cells[i] && cells[i].offsetWidth !== 0) {
          visibleTimeColumns.push(i);
        }
      }
      
      console.log('  Visible time columns:', visibleTimeColumns.length);
      
      // Test based on shift type
      if (shiftTypeText.toLowerCase().includes('graveyard')) {
        console.log('  Expected: Only Evening columns should be visible (2 columns)');
        if (visibleTimeColumns.length === 2) {
          console.log('  ✅ Correct: Graveyard shift shows only evening columns');
        } else {
          console.log('  ❌ Incorrect: Graveyard shift should show only 2 columns, found', visibleTimeColumns.length);
        }
      } else if (shiftTypeText.toLowerCase().includes('morning only')) {
        console.log('  Expected: Only Morning columns should be visible (2 columns)');
        if (visibleTimeColumns.length === 2) {
          console.log('  ✅ Correct: Morning Only shift shows only morning columns');
        } else {
          console.log('  ❌ Incorrect: Morning Only shift should show only 2 columns, found', visibleTimeColumns.length);
        }
      } else if (shiftTypeText.toLowerCase().includes('afternoon only')) {
        console.log('  Expected: Only Afternoon columns should be visible (2 columns)');
        if (visibleTimeColumns.length === 2) {
          console.log('  ✅ Correct: Afternoon Only shift shows only afternoon columns');
        } else {
          console.log('  ❌ Incorrect: Afternoon Only shift should show only 2 columns, found', visibleTimeColumns.length);
        }
      } else if (shiftTypeText.toLowerCase().includes('regular')) {
        console.log('  Expected: Morning and Afternoon columns should be visible (4 columns)');
        if (visibleTimeColumns.length === 4) {
          console.log('  ✅ Correct: Regular shift shows morning and afternoon columns');
        } else {
          console.log('  ❌ Incorrect: Regular shift should show 4 columns, found', visibleTimeColumns.length);
        }
      } else if (shiftTypeText.toLowerCase().includes('two shifts')) {
        console.log('  Expected: Morning and Afternoon columns should be visible (4 columns)');
        if (visibleTimeColumns.length === 4) {
          console.log('  ✅ Correct: Two Shifts shows morning and afternoon columns');
        } else {
          console.log('  ❌ Incorrect: Two Shifts should show 4 columns, found', visibleTimeColumns.length);
        }
      } else if (shiftTypeText.toLowerCase().includes('single shift')) {
        console.log('  Expected: Morning and Afternoon columns should be visible (4 columns)');
        if (visibleTimeColumns.length === 4) {
          console.log('  ✅ Correct: Single Shift shows morning and afternoon columns');
        } else {
          console.log('  ❌ Incorrect: Single Shift should show 4 columns, found', visibleTimeColumns.length);
        }
      }
    }
  });
}

// Test 2: Check if shift type badges are displayed correctly
function testShiftTypeBadges() {
  console.log('\n--- Testing Shift Type Badges ---');
  
  const badges = document.querySelectorAll('.badge, [class*="badge"]');
  const shiftTypes = new Set();
  
  badges.forEach(badge => {
    const text = badge.textContent?.trim();
    if (text && !['AM In', 'AM Out', 'PM In', 'PM Out', 'Eve In', 'Eve Out'].includes(text)) {
      shiftTypes.add(text);
      console.log('✅ Found shift type badge:', text);
    }
  });
  
  console.log('Unique shift types found:', Array.from(shiftTypes));
}

// Test 3: Check if image buttons are conditionally displayed
function testConditionalImageButtons() {
  console.log('\n--- Testing Conditional Image Buttons ---');
  
  const tableRows = document.querySelectorAll('tbody tr');
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const shiftTypeCell = cells[1]; // Shift type is in the 2nd column
    const shiftTypeText = shiftTypeCell?.textContent?.trim();
    const imageCell = cells[cells.length - 2]; // Second to last column (Images)
    
    if (imageCell && shiftTypeText) {
      const imageButtons = imageCell.querySelectorAll('button');
      const buttonTexts = Array.from(imageButtons).map(btn => btn.textContent?.trim());
      
      console.log(`\nRecord ${index + 1}: Shift "${shiftTypeText}"`);
      console.log('  Image buttons found:', buttonTexts);
      
      // Test expected buttons based on shift type
      if (shiftTypeText.toLowerCase().includes('graveyard')) {
        const expectedButtons = ['Eve In', 'Eve Out'];
        const hasCorrectButtons = expectedButtons.every(btn => buttonTexts.includes(btn)) &&
                                  buttonTexts.every(btn => expectedButtons.includes(btn));
        if (hasCorrectButtons) {
          console.log('  ✅ Correct: Graveyard shift shows only evening image buttons');
        } else {
          console.log('  ❌ Incorrect: Graveyard shift should only show Eve In/Out buttons');
        }
      } else if (shiftTypeText.toLowerCase().includes('morning only')) {
        const expectedButtons = ['AM In', 'AM Out'];
        const hasCorrectButtons = expectedButtons.every(btn => buttonTexts.includes(btn)) &&
                                  buttonTexts.every(btn => expectedButtons.includes(btn));
        if (hasCorrectButtons) {
          console.log('  ✅ Correct: Morning Only shift shows only morning image buttons');
        } else {
          console.log('  ❌ Incorrect: Morning Only shift should only show AM In/Out buttons');
        }
      } else if (shiftTypeText.toLowerCase().includes('afternoon only')) {
        const expectedButtons = ['PM In', 'PM Out'];
        const hasCorrectButtons = expectedButtons.every(btn => buttonTexts.includes(btn)) &&
                                  buttonTexts.every(btn => expectedButtons.includes(btn));
        if (hasCorrectButtons) {
          console.log('  ✅ Correct: Afternoon Only shift shows only afternoon image buttons');
        } else {
          console.log('  ❌ Incorrect: Afternoon Only shift should only show PM In/Out buttons');
        }
      } else if (['regular', 'two shifts', 'single shift'].some(type => 
                 shiftTypeText.toLowerCase().includes(type))) {
        const expectedButtons = ['AM In', 'AM Out', 'PM In', 'PM Out'];
        const hasCorrectButtons = expectedButtons.every(btn => buttonTexts.includes(btn)) &&
                                  !buttonTexts.some(btn => ['Eve In', 'Eve Out'].includes(btn));
        if (hasCorrectButtons) {
          console.log('  ✅ Correct: Regular/Two Shifts shows morning and afternoon image buttons');
        } else {
          console.log('  ❌ Incorrect: Should show AM/PM buttons only, found:', buttonTexts);
        }
      }
    }
  });
}

// Test 4: Check table headers
function testTableHeaders() {
  console.log('\n--- Testing Table Headers ---');
  
  const headers = document.querySelectorAll('th');
  const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
  
  console.log('Table headers found:', headerTexts);
  
  const expectedHeaders = [
    'Student', 'Shift Type', 'Date', 
    'Morning In', 'Morning Out', 
    'Afternoon In', 'Afternoon Out',
    'Evening In', 'Evening Out',
    'Total Hours', 'Images'
  ];
  
  const hasAllHeaders = expectedHeaders.every(header => headerTexts.includes(header));
  if (hasAllHeaders) {
    console.log('✅ All expected headers are present');
  } else {
    console.log('❌ Missing headers:', expectedHeaders.filter(h => !headerTexts.includes(h)));
  }
}

// Test 5: Verify data integrity
function testDataIntegrity() {
  console.log('\n--- Testing Data Integrity ---');
  
  const tableRows = document.querySelectorAll('tbody tr');
  let validRecords = 0;
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 11) { // Should have at least 11 columns now
      const studentName = cells[0].textContent?.trim();
      const shiftType = cells[1].textContent?.trim();
      const date = cells[2].textContent?.trim();
      
      if (studentName && shiftType && date) {
        validRecords++;
        console.log(`✅ Record ${index + 1}: ${studentName} - ${shiftType} - ${date}`);
      }
    }
  });
  
  console.log(`Valid records: ${validRecords}/${tableRows.length}`);
}

// Run all tests
function runConditionalColumnTests() {
  console.log('Running conditional column display tests...');
  
  testTableHeaders();
  testConditionalColumns();
  testShiftTypeBadges();
  testConditionalImageButtons();
  testDataIntegrity();
  
  console.log('\n=== CONDITIONAL COLUMN DISPLAY TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. Table headers show all possible columns');
  console.log('2. Columns are conditionally displayed based on shift type:');
  console.log('   - Graveyard: Only Evening In/Out columns');
  console.log('   - Morning Only: Only Morning In/Out columns');
  console.log('   - Afternoon Only: Only Afternoon In/Out columns');
  console.log('   - Regular/Two Shifts: Morning and Afternoon columns');
  console.log('   - Single Shift: Morning and Afternoon columns');
  console.log('3. Image buttons are conditionally displayed');
  console.log('4. Shift type badges show friendly names');
  console.log('5. Data integrity maintained across all shift types');
}

// Make functions available globally
window.testConditionalColumns = testConditionalColumns;
window.testShiftTypeBadges = testShiftTypeBadges;
window.testConditionalImageButtons = testConditionalImageButtons;
window.testTableHeaders = testTableHeaders;
window.testDataIntegrity = testDataIntegrity;
window.runConditionalColumnTests = runConditionalColumnTests;

// Auto-run tests
setTimeout(runConditionalColumnTests, 1000);
