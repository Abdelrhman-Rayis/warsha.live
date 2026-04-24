// Full integration test for registration and dashboard
console.log('🧪 TESTING: Full Platform Flow\n');

// ==== TEST 1: Check if functions exist ====
console.log('TEST 1: Check if all functions are accessible');
const requiredFunctions = [
    'handleRegister',
    'handleLogin', 
    'showRegister',
    'showLogin',
    'showDashboard',
    'hideAllSections',
    'sanitizeInput',
    'hashPassword'
];

requiredFunctions.forEach(fn => {
    const exists = typeof window[fn] === 'function';
    console.log(`  ${exists ? '✅' : '❌'} ${fn}`);
});

// ==== TEST 2: Check localStorage ====
console.log('\n\nTEST 2: Check localStorage');
const users = JSON.parse(localStorage.getItem('users')) || [];
const enrollments = JSON.parse(localStorage.getItem('enrolledCourses')) || {};
const courses = JSON.parse(localStorage.getItem('courses')) || [];
console.log(`  Users stored: ${users.length}`);
console.log(`  Enrollments: ${Object.keys(enrollments).length}`);
console.log(`  Courses: ${courses.length}`);

// ==== TEST 3: Check HTML elements for registration ====
console.log('\n\nTEST 3: Check HTML registration form elements');
const formElements = [
    'registerForm',
    'registerName',
    'registerEmail', 
    'registerPassword',
    'userRole',
    'registerSection'
];

formElements.forEach(id => {
    const el = document.getElementById(id);
    console.log(`  ${el ? '✅' : '❌'} Element: #${id}`);
});

// ==== TEST 4: Check if role dropdown has options ====
console.log('\n\nTEST 4: Check role dropdown options');
const roleSelect = document.getElementById('userRole');
if (roleSelect) {
    console.log(`  Dropdown found: ✅`);
    console.log(`  Options in dropdown: ${roleSelect.options.length}`);
    for (let i = 0; i < roleSelect.options.length; i++) {
        console.log(`    Option ${i}: value="${roleSelect.options[i].value}", text="${roleSelect.options[i].text}"`);
    }
} else {
    console.log(`  Dropdown found: ❌`);
}

// ==== TEST 5: Test password hashing ====
console.log('\n\nTEST 5: Test password hashing');
try {
    const pwd = 'test123';
    const hash1 = hashPassword(pwd);
    const hash2 = hashPassword(pwd);
    console.log(`  Hash "test123": ${hash1.substring(0, 20)}...`);
    console.log(`  Hashes match: ${hash1 === hash2 ? '✅' : '❌'}`);
} catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
}

// ==== TEST 6: Test sanitization ====
console.log('\n\nTEST 6: Test input sanitization');
try {
    const dirty = '<script>alert("xss")</script>';
    const clean = sanitizeInput(dirty);
    console.log(`  Input: "${dirty}"`);
    console.log(`  Output: "${clean}"`);
    console.log(`  Safe: ${!clean.includes('<script>') ? '✅' : '❌'}`);
} catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
}

// ==== SUMMARY ====
console.log('\n\n════════════════════════════════════════');
console.log('✅ TESTS COMPLETE - Check results above');
console.log('════════════════════════════════════════');
