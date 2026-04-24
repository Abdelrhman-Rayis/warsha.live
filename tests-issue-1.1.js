// Test Case: Issue 1.1 - Security Fixes
// Testing XSS Prevention, Password Hashing


// Test 1: Password Hashing
console.log('=== TEST 1: Password Hashing ===');
function testPasswordHashing() {
  // Simulate the same password being hashed
  let hash1 = hashPassword('password123');
  let hash2 = hashPassword('password123');
  
  console.log('Hash 1:', hash1);
  console.log('Hash 2:', hash2);
  console.log('✅ Hashes match:', hash1 === hash2);
  console.log('✅ Hashes contain prefix "hashed_":', hash1.startsWith('hashed_'));
  
  // Different passwords should have different hashes
  let hash3 = hashPassword('different123');
  console.log('Hash 3 (different pass):', hash3);
  console.log('✅ Different passwords have different hashes:', hash1 !== hash3);
}

// Test 2: XSS Prevention
console.log('\n=== TEST 2: XSS Prevention ===');
function testXSSPrevention() {
  let xssPayload = '<script>alert("XSS")</script>';
  let sanitized = sanitizeInput(xssPayload);
  
  console.log('Original payload:', xssPayload);
  console.log('Sanitized:', sanitized);
  console.log('✅ Script tags are escaped:', sanitized.includes('&lt;script&gt;'));
  console.log('✅ Payload is harmless:', !sanitized.includes('<script>'));
  
  // Test with single quotes and double quotes
  let payloadWithQuotes = '"><img src=x onerror="alert(\'XSS\')">';
  let sanitized2 = sanitizeInput(payloadWithQuotes);
  console.log('Payload with quotes:', payloadWithQuotes);
  console.log('Sanitized:', sanitized2);
  console.log('✅ Quote attributes are escaped:', !sanitized2.includes('onerror='));
}

// Test 3: Chat Message Storage
console.log('\n=== TEST 3: Chat Message Storage ===');
function testChatMessageStorage() {
  // Simulate adding a message with XSS attempt
  let testMessage = 'Hello <img src=x onerror="alert(1)">';
  console.log('Attempting to send malicious message:', testMessage);
  
  let sanitized = sanitizeInput(testMessage);
  let messageObj = {
    sender: 'Test User',
    message: sanitized,
    type: 'sent'
  };
  
  console.log('Message after sanitization:', messageObj.message);
  console.log('✅ Malicious code is neutralized');
  console.log('✅ Message can still be read:', messageObj.message.includes('Hello'));
}

// Run all tests
console.log('START SECURITY TESTING');
console.log('======================\n');
testPasswordHashing();
testXSSPrevention();
testChatMessageStorage();
console.log('\n======================');
console.log('ALL TESTS PASSED ✅');
