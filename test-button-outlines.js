// Test script to verify button outlines and image button labels
console.log('=== BUTTON OUTLINE AND IMAGE LABEL TEST ===');

// Test 1: Check custom CSS styles are applied
function testCustomStyles() {
  console.log('\n--- Testing Custom CSS Styles ---');
  
  // Check if custom styles are injected
  const styleElements = document.querySelectorAll('style');
  let customStylesFound = false;
  
  styleElements.forEach(style => {
    if (style.textContent && style.textContent.includes('btn-visible-outline')) {
      customStylesFound = true;
      console.log('✅ Custom button outline styles found');
    }
    if (style.textContent && style.textContent.includes('table-visible-outline')) {
      console.log('✅ Custom table outline styles found');
    }
    if (style.textContent && style.textContent.includes('image-btn')) {
      console.log('✅ Custom image button styles found');
    }
  });
  
  if (!customStylesFound) {
    console.log('❌ Custom styles not found');
  }
}

// Test 2: Check button outline visibility
function testButtonOutlines() {
  console.log('\n--- Testing Button Outline Visibility ---');
  
  // Test main action buttons
  const viewAttendanceButtons = document.querySelectorAll('button:has-text("View Attendance")');
  const backButtons = document.querySelectorAll('button:has-text("Back to Student List")');
  
  console.log(`Found ${viewAttendanceButtons.length} "View Attendance" buttons`);
  console.log(`Found ${backButtons.length} "Back to Student List" buttons`);
  
  // Check if buttons have custom outline class
  viewAttendanceButtons.forEach((btn, index) => {
    const hasCustomClass = btn.classList.contains('btn-visible-outline');
    const computedStyle = window.getComputedStyle(btn);
    const borderWidth = computedStyle.borderWidth;
    const borderColor = computedStyle.borderColor;
    
    console.log(`View Attendance Button ${index + 1}:`);
    console.log('  Custom class:', hasCustomClass ? '✅' : '❌');
    console.log('  Border width:', borderWidth);
    console.log('  Border color:', borderColor);
    console.log('  Visible outline:', borderWidth !== '0px' ? '✅' : '❌');
  });
  
  backButtons.forEach((btn, index) => {
    const hasCustomClass = btn.classList.contains('btn-visible-outline');
    const computedStyle = window.getComputedStyle(btn);
    const borderWidth = computedStyle.borderWidth;
    const borderColor = computedStyle.borderColor;
    
    console.log(`Back Button ${index + 1}:`);
    console.log('  Custom class:', hasCustomClass ? '✅' : '❌');
    console.log('  Border width:', borderWidth);
    console.log('  Border color:', borderColor);
    console.log('  Visible outline:', borderWidth !== '0px' ? '✅' : '❌');
  });
}

// Test 3: Check table outline visibility
function testTableOutlines() {
  console.log('\n--- Testing Table Outline Visibility ---');
  
  const tables = document.querySelectorAll('table');
  console.log(`Found ${tables.length} tables`);
  
  tables.forEach((table, index) => {
    const hasCustomClass = table.classList.contains('table-visible-outline');
    const computedStyle = window.getComputedStyle(table);
    const borderWidth = computedStyle.borderWidth;
    const borderColor = computedStyle.borderColor;
    
    console.log(`Table ${index + 1}:`);
    console.log('  Custom class:', hasCustomClass ? '✅' : '❌');
    console.log('  Border width:', borderWidth);
    console.log('  Border color:', borderColor);
    console.log('  Visible outline:', borderWidth !== '0px' ? '✅' : '❌');
    
    // Check table headers
    const headers = table.querySelectorAll('th');
    if (headers.length > 0) {
      const headerStyle = window.getComputedStyle(headers[0]);
      console.log('  Header border width:', headerStyle.borderWidth);
      console.log('  Header background:', headerStyle.backgroundColor);
      console.log('  Header font weight:', headerStyle.fontWeight);
    }
    
    // Check table cells
    const cells = table.querySelectorAll('td');
    if (cells.length > 0) {
      const cellStyle = window.getComputedStyle(cells[0]);
      console.log('  Cell border width:', cellStyle.borderWidth);
      console.log('  Cell border color:', cellStyle.borderColor);
    }
  });
}

// Test 4: Check image button labels
function testImageButtonLabels() {
  console.log('\n--- Testing Image Button Labels ---');
  
  // Find all image buttons
  const imageButtons = document.querySelectorAll('.image-btn');
  console.log(`Found ${imageButtons.length} image buttons`);
  
  const expectedLabels = [
    'VIEW IMAGE<br/>MORNING IN',
    'VIEW IMAGE<br/>MORNING OUT',
    'VIEW IMAGE<br/>AFTERNOON IN',
    'VIEW IMAGE<br/>AFTERNOON OUT',
    'VIEW IMAGE<br/>EVENING IN',
    'VIEW IMAGE<br/>EVENING OUT'
  ];
  
  const foundLabels = [];
  imageButtons.forEach((btn, index) => {
    const buttonHTML = btn.innerHTML;
    const buttonText = btn.textContent?.trim();
    const hasCustomClass = btn.classList.contains('image-btn');
    
    console.log(`Image Button ${index + 1}:`);
    console.log('  Custom class:', hasCustomClass ? '✅' : '❌');
    console.log('  Text content:', buttonText);
    console.log('  HTML content:', buttonHTML);
    
    // Check if it matches expected format
    const isDescriptive = buttonHTML.includes('VIEW IMAGE<br/>') && 
                        (buttonHTML.includes('MORNING') || 
                         buttonHTML.includes('AFTERNOON') || 
                         buttonHTML.includes('EVENING'));
    
    console.log('  Descriptive label:', isDescriptive ? '✅' : '❌');
    
    if (isDescriptive) {
      foundLabels.push(buttonText);
    }
    
    // Check button styling
    const computedStyle = window.getComputedStyle(btn);
    const borderWidth = computedStyle.borderWidth;
    const borderColor = computedStyle.borderColor;
    const padding = computedStyle.padding;
    
    console.log('  Border width:', borderWidth);
    console.log('  Border color:', borderColor);
    console.log('  Padding:', padding);
  });
  
  console.log('\nExpected labels:', expectedLabels);
  console.log('Found descriptive labels:', foundLabels.length);
  console.log('All expected labels present:', 
    expectedLabels.every(label => 
      foundLabels.some(found => found.includes(label.replace('<br/>', ' ')))
    ) ? '✅' : '❌');
}

// Test 5: Check button hover and focus states
function testButtonInteractions() {
  console.log('\n--- Testing Button Interactions ---');
  
  const buttons = document.querySelectorAll('button');
  console.log(`Testing ${buttons.length} buttons for interaction states`);
  
  // Test hover state simulation
  buttons.forEach((btn, index) => {
    if (index < 3) { // Test first 3 buttons
      // Simulate hover
      btn.dispatchEvent(new Event('mouseenter'));
      const hoverStyle = window.getComputedStyle(btn);
      
      console.log(`Button ${index + 1} hover state:`);
      console.log('  Background color:', hoverStyle.backgroundColor);
      console.log('  Border color:', hoverStyle.borderColor);
      
      // Remove hover
      btn.dispatchEvent(new Event('mouseleave'));
    }
  });
}

// Run all tests
function runButtonOutlineTests() {
  console.log('Running button outline and image label tests...');
  
  testCustomStyles();
  testButtonOutlines();
  testTableOutlines();
  testImageButtonLabels();
  testButtonInteractions();
  
  console.log('\n=== BUTTON OUTLINE AND IMAGE LABEL TEST COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('1. All buttons should have visible outline colors');
  console.log('2. Tables should have clear borders and hover effects');
  console.log('3. Image buttons should have descriptive labels (VIEW IMAGE + TIME PERIOD)');
  console.log('4. Custom CSS classes should be properly applied');
  console.log('5. Button hover and focus states should be visible');
}

// Make functions available globally
window.testCustomStyles = testCustomStyles;
window.testButtonOutlines = testButtonOutlines;
window.testTableOutlines = testTableOutlines;
window.testImageButtonLabels = testImageButtonLabels;
window.testButtonInteractions = testButtonInteractions;
window.runButtonOutlineTests = runButtonOutlineTests;

// Auto-run tests
setTimeout(runButtonOutlineTests, 1000);
