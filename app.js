// Security Functions
const REGISTRATION_FORM_URL = 'https://forms.gle/6p7VRDxTpvNNS81F9';

function sanitizeInput(input) {
    // Prevent XSS by escaping HTML characters
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function hashPassword(password) {
    // Simple hash for dev (replace with bcrypt in v2.0)
    // This is NOT production-grade, for MVP only
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'hashed_' + Math.abs(hash).toString(16);
}

// Role Selection Helper
function selectRole(role) {
    // Update hidden select value
    document.getElementById('userRole').value = role;
    
    // Update button styling
    const studentBtn = document.getElementById('roleStudentBtn');
    const instructorBtn = document.getElementById('roleInstructorBtn');
    
    if (role === 'student') {
        studentBtn.classList.add('active');
        instructorBtn.classList.remove('active');
    } else if (role === 'instructor') {
        instructorBtn.classList.add('active');
        studentBtn.classList.remove('active');
    }
}

// Language Management
let currentLang = 'en';

const translations = {
    ar: {
        heroTitle: 'ابنِ تجربة تعلم واضحة ومركزة',
        heroDesc: 'منصة خفيفة وسريعة تعرض الكورسات، التسجيل، الدفع، والمساعد الذكي في مسار واحد بسيط.',
        featuresTitle: 'مميزات المنصة',
        feature1Title: 'محاضرات عالية الجودة',
        feature1Desc: 'تعليم من أفضل المتخصصين بأسلوب سهل وممتع',
        feature2Title: 'تفاعل مباشر',
        feature2Desc: 'التواصل المباشر مع المعلم والطلاب الآخرين',
        feature3Title: 'شهادات معترفة',
        feature3Desc: 'احصل على شهادة بعد إنهاء الكورس بنجاح',
        ctaTitle: 'ابدأ رحلتك التعليمية اليوم',
        coursesTitle: 'الكورسات المتاحة',
        loginTitle: 'تسجيل الدخول',
        emailLabel: 'البريد الإلكتروني:',
        passwordLabel: 'كلمة المرور:',
        registerLink: 'ليس لديك حساب؟',
        registerTitle: 'إنشاء حساب جديد',
        nameLabel: 'الاسم الكامل:',
        regEmailLabel: 'البريد الإلكتروني:',
        regPasswordLabel: 'كلمة المرور:',
        roleLabel: 'نوع المستخدم:',
        loginLink: 'لديك حساب بالفعل؟',
        chatTitle: 'غرفة النقاش التفاعلية',
        profileTitle: 'الملف الشخصي',
        myCoursesTitle: 'كورساتي',
        dashboardTitle: 'لوحة التحكم - المعلم',
        studentCountTitle: 'عدد الطلاب',
        courseCountTitle: 'عدد الكورسات',
        ratingTitle: 'التقييم الكلي',
        createCourseTitle: 'إنشاء كورس جديد',
        courseNameLabel: 'اسم الكورس:',
        courseDescLabel: 'وصف الكورس:',
        coursePriceLabel: 'السعر (دولار):',
        paymentTitle: 'إتمام الدفع',
        cardLabel: 'رقم البطاقة:',
        holderLabel: 'اسم صاحب البطاقة:',
        expiryLabel: 'تاريخ الانتهاء:',
        cvcLabel: 'CVV:',
        footerText: '&copy; 2026 منصة التعلم الإلكترونية. كل الحقوق محفوظة.'
    },
    en: {
        heroTitle: 'From Idea to Proposal',
        heroDesc: 'A practical research methodology course for students and early-career researchers in the social sciences.',
        featuresTitle: 'Course Highlights',
        feature1Title: 'Practical Research Design',
        feature1Desc: 'Learn how to shape a solid research path from question to proposal',
        feature2Title: 'Live Interaction',
        feature2Desc: 'Discuss your ideas directly with the instructor and peers',
        feature3Title: 'Useful Deliverables',
        feature3Desc: 'Finish with tangible outputs you can build into real research work',
        coursesTitle: 'Available Courses',
        ctaTitle: 'Apply for the 2026 Cohort',
        loginTitle: 'Log In',
        emailLabel: 'Email:',
        passwordLabel: 'Password:',
        registerLink: "Don't have an account?",
        registerTitle: 'Create Your Account',
        nameLabel: 'Full Name:',
        regEmailLabel: 'Email:',
        regPasswordLabel: 'Password:',
        roleLabel: 'User Type:',
        loginLink: 'Already have an account?',
        chatTitle: 'Discussion Room',
        profileTitle: 'My Profile',
        myCoursesTitle: 'My Courses',
        dashboardTitle: 'Instructor Dashboard',
        studentCountTitle: 'Students',
        courseCountTitle: 'Courses',
        ratingTitle: 'Overall Rating',
        createCourseTitle: 'Create a New Course',
        courseNameLabel: 'Course Name:',
        courseDescLabel: 'Course Description:',
        coursePriceLabel: 'Price (USD):',
        paymentTitle: 'Complete Payment',
        cardLabel: 'Card Number:',
        holderLabel: 'Cardholder Name:',
        expiryLabel: 'Expiry Date:',
        cvcLabel: 'CVV:',
        footerText: '&copy; 2026 Warsha. All rights reserved.'
    }
};

// Sample Courses Data (loads from localStorage if available)
let coursesData = JSON.parse(localStorage.getItem('courses')) || [
    {
        id: 1,
        name_ar: 'منهجية البحث في العلوم الاجتماعية',
        name_en: 'Research Methodology in Social Sciences',
        desc_ar: 'تعلم المبادئ الأساسية للبحث العلمي والدراسات الاجتماعية',
        desc_en: 'Learn the fundamentals of scientific research and social studies',
        price: 45,
        instructor: 'Abdulrahman',
        rating: 4.8,
        students: 150,
        lectures: 12
    },
    {
        id: 2,
        name_ar: 'تحليل البيانات الإحصائية',
        name_en: 'Statistical Data Analysis',
        desc_ar: 'إتقان أدوات التحليل الإحصائي وتطبيقاتها العملية',
        desc_en: 'Master statistical analysis tools and practical applications',
        price: 50,
        instructor: 'Wisal',
        rating: 4.7,
        students: 120,
        lectures: 15
    },
    {
        id: 3,
        name_ar: 'كتابة البحث العلمي',
        name_en: 'Scientific Writing',
        desc_ar: 'تطوير مهارات كتابة الأوراق البحثية والرسائل',
        desc_en: 'Develop skills for writing research papers and thesis',
        price: 40,
        instructor: 'Dr. Ahmed',
        rating: 4.9,
        students: 200,
        lectures: 10
    },
    {
        id: 4,
        name_ar: 'استخدام الذكاء الاصطناعي في البحث',
        name_en: 'Using AI in Research',
        desc_ar: 'استخدام أدوات الذكاء الاصطناعي لدعم البحث العلمي',
        desc_en: 'Leverage AI tools to support scientific research',
        price: 55,
        instructor: 'Abdulrahman',
        rating: 4.6,
        students: 85,
        lectures: 14
    }
];

// Sample Messages (defaults)
const defaultChatMessages = [
    { sender: 'Instructor', message: 'Welcome everyone to the course.', type: 'received' },
    { sender: 'Student 1', message: 'Thanks. Excited to get started.', type: 'received' },
    { sender: 'You', message: 'I am excited too.', type: 'sent' }
];

// User Data
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || {};
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || defaultChatMessages;

// Initialize demo data if first time
function initializeDemoData() {
    const seededInstructorNames = {
        1: 'Abdulrahman',
        2: 'Wisal',
        3: 'Dr. Ahmed',
        4: 'Abdulrahman'
    };

    // Mark default courses as created by Ahmed Teacher
    coursesData.forEach((course) => {
        if (!course.createdBy) {
            course.createdBy = 1001; // Ahmed Teacher
        }

        if (seededInstructorNames[course.id]) {
            course.instructor = seededInstructorNames[course.id];
        }
    });
    localStorage.setItem('courses', JSON.stringify(coursesData));
    
    // Add demo users if none exist
    if (users.length === 0) {
        users = [
            {
                id: 1001,
                name: 'Ahmed Teacher',
                email: 'teacher@demo.com',
                password: hashPassword('demo123'),
                role: 'instructor'
            },
            // Students for demos
            { id: 1002, name: 'Fatima Student', email: 'student1@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1003, name: 'Omar Student', email: 'student2@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1004, name: 'Sara Ali', email: 'sara@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1005, name: 'Mohammad Hassan', email: 'mohammad@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1006, name: 'Nour Eldin', email: 'nour@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1007, name: 'Layla Mostafa', email: 'layla@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1008, name: 'Ahmed Ali', email: 'ali.ahmed@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1009, name: 'Reem Khaled', email: 'reem@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1010, name: 'Omar Mahmoud', email: 'iomarmahmo@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1011, name: 'Zaid Ibrahim', email: 'zaid@demo.com', password: hashPassword('demo123'), role: 'student' },
            { id: 1012, name: 'Meira Saeed', email: 'meira@demo.com', password: hashPassword('demo123'), role: 'student' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }

    const seededUserNames = {
        1001: 'Ahmed Teacher',
        1002: 'Fatima Student',
        1003: 'Omar Student',
        1004: 'Sara Ali',
        1005: 'Mohammad Hassan',
        1006: 'Nour Eldin',
        1007: 'Layla Mostafa',
        1008: 'Ahmed Ali',
        1009: 'Reem Khaled',
        1010: 'Omar Mahmoud',
        1011: 'Zaid Ibrahim',
        1012: 'Meira Saeed'
    };

    users = users.map((user) => {
        if (!seededUserNames[user.id]) {
            return user;
        }

        return {
            ...user,
            name: seededUserNames[user.id]
        };
    });
    localStorage.setItem('users', JSON.stringify(users));

    const hasOnlyDefaultArabicChat =
        Array.isArray(chatMessages) &&
        chatMessages.length === 3 &&
        chatMessages[0]?.sender === 'المعلم';

    if (hasOnlyDefaultArabicChat) {
        chatMessages = defaultChatMessages;
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
    
    // Add demo enrollments if none exist
    if (Object.keys(enrolledCourses).length === 0) {
        // Course 1: Research Methodology (12 lectures)
        // Course 2: Statistical Data Analysis (15 lectures)
        // Course 3: Scientific Writing (10 lectures)
        // Course 4: Using AI in Research (14 lectures)
        
        const enrollments = {};
        
        // Course 1 - Research Methodology (12 students enrolled)
        enrollments['1002_1'] = { courseId: 1, enrolledDate: '4/1/2026', progress: 50, lecturesWatched: 6, totalLectures: 12, completedDate: null };
        enrollments['1003_1'] = { courseId: 1, enrolledDate: '4/3/2026', progress: 0, lecturesWatched: 0, totalLectures: 12, completedDate: null };
        enrollments['1004_1'] = { courseId: 1, enrolledDate: '2/15/2026', progress: 100, lecturesWatched: 12, totalLectures: 12, completedDate: '3/20/2026', completed: true };
        enrollments['1005_1'] = { courseId: 1, enrolledDate: '3/10/2026', progress: 75, lecturesWatched: 9, totalLectures: 12, completedDate: null };
        enrollments['1006_1'] = { courseId: 1, enrolledDate: '1/20/2026', progress: 100, lecturesWatched: 12, totalLectures: 12, completedDate: '2/20/2026', completed: true };
        enrollments['1007_1'] = { courseId: 1, enrolledDate: '3/5/2026', progress: 42, lecturesWatched: 5, totalLectures: 12, completedDate: null };
        enrollments['1008_1'] = { courseId: 1, enrolledDate: '2/1/2026', progress: 100, lecturesWatched: 12, totalLectures: 12, completedDate: '3/15/2026', completed: true };
        enrollments['1009_1'] = { courseId: 1, enrolledDate: '3/15/2026', progress: 25, lecturesWatched: 3, totalLectures: 12, completedDate: null };
        enrollments['1010_1'] = { courseId: 1, enrolledDate: '3/20/2026', progress: 33, lecturesWatched: 4, totalLectures: 12, completedDate: null };
        enrollments['1011_1'] = { courseId: 1, enrolledDate: '2/25/2026', progress: 92, lecturesWatched: 11, totalLectures: 12, completedDate: null };
        enrollments['1012_1'] = { courseId: 1, enrolledDate: '3/1/2026', progress: 58, lecturesWatched: 7, totalLectures: 12, completedDate: null };
        
        // Course 2 - Statistical Data Analysis (10 students enrolled)
        enrollments['1002_2'] = { courseId: 2, enrolledDate: '4/2/2026', progress: 100, lecturesWatched: 15, totalLectures: 15, completedDate: '4/3/2026', completed: true };
        enrollments['1004_2'] = { courseId: 2, enrolledDate: '3/1/2026', progress: 87, lecturesWatched: 13, totalLectures: 15, completedDate: null };
        enrollments['1005_2'] = { courseId: 2, enrolledDate: '3/10/2026', progress: 60, lecturesWatched: 9, totalLectures: 15, completedDate: null };
        enrollments['1007_2'] = { courseId: 2, enrolledDate: '2/20/2026', progress: 100, lecturesWatched: 15, totalLectures: 15, completedDate: '3/25/2026', completed: true };
        enrollments['1008_2'] = { courseId: 2, enrolledDate: '3/5/2026', progress: 40, lecturesWatched: 6, totalLectures: 15, completedDate: null };
        enrollments['1010_2'] = { courseId: 2, enrolledDate: '3/12/2026', progress: 53, lecturesWatched: 8, totalLectures: 15, completedDate: null };
        enrollments['1011_2'] = { courseId: 2, enrolledDate: '2/28/2026', progress: 100, lecturesWatched: 15, totalLectures: 15, completedDate: '3/28/2026', completed: true };
        enrollments['1012_2'] = { courseId: 2, enrolledDate: '3/8/2026', progress: 67, lecturesWatched: 10, totalLectures: 15, completedDate: null };
        enrollments['1003_2'] = { courseId: 2, enrolledDate: '3/15/2026', progress: 33, lecturesWatched: 5, totalLectures: 15, completedDate: null };
        enrollments['1006_2'] = { courseId: 2, enrolledDate: '3/20/2026', progress: 20, lecturesWatched: 3, totalLectures: 15, completedDate: null };
        
        // Course 3 - Scientific Writing (9 students enrolled)
        enrollments['1003_3'] = { courseId: 3, enrolledDate: '4/3/2026', progress: 25, lecturesWatched: 3, totalLectures: 10, completedDate: null };
        enrollments['1005_3'] = { courseId: 3, enrolledDate: '3/8/2026', progress: 80, lecturesWatched: 8, totalLectures: 10, completedDate: null };
        enrollments['1006_3'] = { courseId: 3, enrolledDate: '2/10/2026', progress: 100, lecturesWatched: 10, totalLectures: 10, completedDate: '3/5/2026', completed: true };
        enrollments['1007_3'] = { courseId: 3, enrolledDate: '3/1/2026', progress: 50, lecturesWatched: 5, totalLectures: 10, completedDate: null };
        enrollments['1009_3'] = { courseId: 3, enrolledDate: '3/10/2026', progress: 70, lecturesWatched: 7, totalLectures: 10, completedDate: null };
        enrollments['1010_3'] = { courseId: 3, enrolledDate: '3/18/2026', progress: 40, lecturesWatched: 4, totalLectures: 10, completedDate: null };
        enrollments['1011_3'] = { courseId: 3, enrolledDate: '2/15/2026', progress: 100, lecturesWatched: 10, totalLectures: 10, completedDate: '3/10/2026', completed: true };
        enrollments['1012_3'] = { courseId: 3, enrolledDate: '3/5/2026', progress: 60, lecturesWatched: 6, totalLectures: 10, completedDate: null };
        enrollments['1002_3'] = { courseId: 3, enrolledDate: '4/1/2026', progress: 30, lecturesWatched: 3, totalLectures: 10, completedDate: null };
        
        // Course 4 - Using AI in Research (8 students enrolled)
        enrollments['1004_4'] = { courseId: 4, enrolledDate: '3/15/2026', progress: 64, lecturesWatched: 9, totalLectures: 14, completedDate: null };
        enrollments['1005_4'] = { courseId: 4, enrolledDate: '3/20/2026', progress: 43, lecturesWatched: 6, totalLectures: 14, completedDate: null };
        enrollments['1008_4'] = { courseId: 4, enrolledDate: '2/20/2026', progress: 100, lecturesWatched: 14, totalLectures: 14, completedDate: '3/20/2026', completed: true };
        enrollments['1009_4'] = { courseId: 4, enrolledDate: '3/12/2026', progress: 36, lecturesWatched: 5, totalLectures: 14, completedDate: null };
        enrollments['1010_4'] = { courseId: 4, enrolledDate: '3/22/2026', progress: 14, lecturesWatched: 2, totalLectures: 14, completedDate: null };
        enrollments['1011_4'] = { courseId: 4, enrolledDate: '2/28/2026', progress: 93, lecturesWatched: 13, totalLectures: 14, completedDate: null };
        enrollments['1002_4'] = { courseId: 4, enrolledDate: '3/25/2026', progress: 21, lecturesWatched: 3, totalLectures: 14, completedDate: null };
        enrollments['1006_4'] = { courseId: 4, enrolledDate: '4/1/2026', progress: 0, lecturesWatched: 0, totalLectures: 14, completedDate: null };
        
        enrolledCourses = enrollments;
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }
}

// Initialize on page load
initializeDemoData();
document.addEventListener('DOMContentLoaded', () => {
    applyLanguageState();

    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        currentUser = users.find((user) => user.id === parsedUser.id) || parsedUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showHome();
        updateNavigation();
    } else {
        showHome();
    }
});

function applyLanguageState() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.textContent = currentLang === 'ar' ? 'EN' : 'AR';
    }
}

// Language Toggle
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    updateLanguage();
    applyLanguageState();
}

function updateLanguage() {
    const keys = Object.keys(translations.ar);
    keys.forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            const text = translations[currentLang][key];
            if (key === 'footerText') {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });
}

// Navigation
function showHome() {
    hideAllSections();
    document.getElementById('homeSection').classList.add('active');
}

function showCourses() {
    hideAllSections();
    document.getElementById('coursesSection').classList.add('active');
    displayCourses();
}

function showChat() {
    if (!currentUser) {
        showLogin();
        return;
    }
    hideAllSections();
    document.getElementById('chatSection').classList.add('active');
    displayMessages();
}

function showProfile() {
    if (!currentUser) {
        showLogin();
        return;
    }
    hideAllSections();
    document.getElementById('profileSection').classList.add('active');
    displayProfile();
}

function showLogin() {
    hideAllSections();
    document.getElementById('loginSection').classList.add('active');
}

function showRegister() {
    hideAllSections();
    document.getElementById('registerSection').classList.add('active');
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
}

function updateNavigation() {
    const navLinks = document.getElementById('navLinks');
    const authButtons = document.getElementById('authButtons');
    const dashboardNav = document.getElementById('dashboardNav');
    
    if (currentUser) {
        navLinks.style.display = 'flex';
        if (authButtons) authButtons.style.display = 'none';
        // Show dashboard only for instructors/teachers
        if (dashboardNav) {
            dashboardNav.style.display = currentUser.role === 'instructor' ? 'block' : 'none';
        }
    } else {
        navLinks.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
    }
}

// Authentication
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Hash password before comparing
    const hashedPassword = hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeLoginModal();
        updateNavigation();
        showHome();
        alert((currentLang === 'ar' ? 'مرحبا ' : 'Welcome, ') + currentUser.name + (currentLang === 'ar' ? '! تم تسجيل الدخول بنجاح' : '. You have logged in successfully.'));
    } else {
        alert(currentLang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Incorrect email or password.');
    }
    document.getElementById('loginForm').reset();
}

function handleRegister(event) {
    if (event) {
        event.preventDefault();
    }

    openRegistrationForm();
}

// Modal Functions
function showLogin() {
    const loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showRegister() {
    const registerSection = document.getElementById('registerSection');
    if (registerSection) {
        registerSection.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeRegisterModal() {
    const registerSection = document.getElementById('registerSection');
    if (registerSection) {
        registerSection.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openRegistrationForm() {
    closeRegisterModal();
    window.open(REGISTRATION_FORM_URL, '_blank', 'noopener,noreferrer');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    // Close any open modals
    closeLoginModal();
    closeRegisterModal();
    updateNavigation();
    showHome();
    alert(currentLang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'You have logged out successfully.');
}

// Courses
function displayCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';

    coursesData.forEach(course => {
        const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
        const courseDesc = currentLang === 'ar' ? course.desc_ar : course.desc_en;

        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-header">
                <h3>${courseName}</h3>
                <p style="font-size: 0.9rem; opacity: 0.9">${course.instructor}</p>
            </div>
            <div class="course-body">
                <p>${courseDesc}</p>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span>⭐ ${course.rating}</span>
                    <span style="color: #64748b">(${course.students} ${currentLang === 'ar' ? 'طالب' : 'students'})</span>
                </div>
            </div>
            <div class="course-footer">
                <span class="price">$${course.price}</span>
                <button class="btn-primary" onclick="viewCourseDetails(${course.id})">
                    ${currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </button>
            </div>
        `;
        coursesGrid.appendChild(courseCard);
    });
}

function viewCourseDetails(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
    const courseDesc = currentLang === 'ar' ? course.desc_ar : course.desc_en;

    hideAllSections();
    document.getElementById('courseDetailSection').classList.add('active');

    const courseDetails = document.getElementById('courseDetails');
    courseDetails.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 1000px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #ec4899); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem;">
                <h2>${courseName}</h2>
                <p>${course.instructor}</p>
                <div style="margin-top: 1rem; display: flex; gap: 2rem;">
                    <div>
                        <strong>${currentLang === 'ar' ? 'التقييم' : 'Rating'}:</strong> ⭐ ${course.rating}
                    </div>
                    <div>
                        <strong>${currentLang === 'ar' ? 'الطلاب' : 'Students'}:</strong> ${course.students}
                    </div>
                    <div>
                        <strong>${currentLang === 'ar' ? 'المحاضرات' : 'Lectures'}:</strong> ${course.lectures}
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 2rem;">
                <h3>${currentLang === 'ar' ? 'الوصف' : 'Description'}</h3>
                <p>${courseDesc}</p>
            </div>
            <div style="margin-bottom: 2rem;">
                <h3>${currentLang === 'ar' ? 'محتوى الكورس' : 'Course Content'}</h3>
                <ul style="${currentLang === 'ar' ? 'padding-right: 1.5rem;' : 'padding-left: 1.5rem;'}">
                    <li>${currentLang === 'ar' ? 'المقدمة والأساسيات' : 'Introduction and Basics'}</li>
                    <li>${currentLang === 'ar' ? 'الدروس العملية' : 'Practical Lessons'}</li>
                    <li>${currentLang === 'ar' ? 'الحالات الدراسية' : 'Case Studies'}</li>
                    <li>${currentLang === 'ar' ? 'المشاريع الفعلية' : 'Real Projects'}</li>
                </ul>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="enrollCourse(${course.id})">
                    ${currentLang === 'ar' ? 'التسجيل الآن' : 'Enroll Now'} - $${course.price}
                </button>
                <button class="btn-secondary" onclick="showCourses()">
                    ${currentLang === 'ar' ? 'العودة' : 'Back'}
                </button>
            </div>
        </div>
    `;
}

function enrollCourse(courseId) {
    if (!currentUser) {
        alert(currentLang === 'ar' ? 'برجاء تسجيل الدخول أولا' : 'Please login first');
        showLogin();
        return;
    }

    const course = coursesData.find(c => c.id === courseId);
    const key = `${currentUser.id}_${courseId}`;

    if (enrolledCourses[key]) {
        alert(currentLang === 'ar' ? 'أنت مسجل بالفعل في هذا الكورس' : 'You are already enrolled in this course');
        return;
    }

    // Show payment page
    showPayment(course);
}

function showPayment(course) {
    hideAllSections();
    document.getElementById('paymentSection').classList.add('active');

    const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
    const paymentDetails = document.getElementById('paymentDetails');
    paymentDetails.innerHTML = `
        <div style="background: #f1f5f9; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
            <p><strong>${currentLang === 'ar' ? 'الكورس' : 'Course'}:</strong> ${courseName}</p>
            <p><strong>${currentLang === 'ar' ? 'السعر' : 'Price'}:</strong> $${course.price}</p>
        </div>
    `;

    document.getElementById('paymentForm').onsubmit = (e) => handlePayment(e, course.id);
}

function handlePayment(event, courseId) {
    event.preventDefault();

    const cardNumber = document.getElementById('cardNumber').value;
    const cardHolder = document.getElementById('cardHolder').value;
    const expiry = document.getElementById('expiry').value;
    const cvc = document.getElementById('cvc').value;

    // Simple validation
    if (cardNumber.length < 13 || expiry.length < 5 || cvc.length < 3) {
        alert(currentLang === 'ar' ? 'بيانات البطاقة غير صحيحة' : 'Invalid card information');
        return;
    }

    // Simulate payment
    const key = `${currentUser.id}_${courseId}`;
    const course = coursesData.find(c => c.id === courseId);
    enrolledCourses[key] = {
        courseId: courseId,
        enrolledDate: new Date().toLocaleDateString(),
        progress: 0,
        lecturesWatched: 0,
        totalLectures: course ? course.lectures : 10,
        completedDate: null
    };
    localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));

    alert(currentLang === 'ar' ? 'تم الدفع بنجاح! تم تسجيلك في الكورس' : 'Payment successful! You are enrolled in the course');
    document.getElementById('paymentForm').reset();
    showCourses();
}

// Chat
function displayMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    chatMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}`;
        
        // Create sender span
        const senderSpan = document.createElement('strong');
        senderSpan.textContent = msg.sender + ': ';
        
        // Create message text (no HTML execution, prevents XSS)
        const messageText = document.createTextNode(msg.message);
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(messageText);
        messagesContainer.appendChild(messageDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeInput(message);
    
    chatMessages.push({
        sender: currentUser.name,
        message: sanitizedMessage,
        type: 'sent'
    });

    // Persist to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));

    input.value = '';
    displayMessages();

    // Simulate response
    setTimeout(() => {
        chatMessages.push({
            sender: currentLang === 'ar' ? 'التطبيق' : 'Warsha',
            message: currentLang === 'ar' ? 'شكرا على تعليقك!' : 'Thank you for your comment!',
            type: 'received'
        });
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
        displayMessages();
    }, 1000);
}

// Profile
function displayProfile() {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <div style="display: grid; gap: 1rem;">
            <div>
                <strong>${currentLang === 'ar' ? 'الاسم' : 'Name'}:</strong> ${currentUser.name}
            </div>
            <div>
                <strong>${currentLang === 'ar' ? 'البريد الإلكتروني' : 'Email'}:</strong> ${currentUser.email}
            </div>
            <div>
                <strong>${currentLang === 'ar' ? 'نوع المستخدم' : 'User Type'}:</strong> ${currentUser.role === 'student' ? (currentLang === 'ar' ? 'طالب' : 'Student') : (currentLang === 'ar' ? 'معلم' : 'Instructor')}
            </div>
        </div>
    `;

    const myCourses = document.getElementById('myCourses');
    myCourses.innerHTML = '';

    let hasEnrolled = false;
    coursesData.forEach(course => {
        const key = `${currentUser.id}_${course.id}`;
        if (enrolledCourses[key]) {
            hasEnrolled = true;
            const enrollment = enrolledCourses[key];
            const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
            const lecturesWatched = enrollment.lecturesWatched || 0;
            const totalLectures = enrollment.totalLectures || 10;
            const progressPercent = Math.round((lecturesWatched / totalLectures) * 100);
            const isCompleted = lecturesWatched >= totalLectures;
            
            const courseDiv = document.createElement('div');
            courseDiv.style.cssText = 'background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #6366f1; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
            
            let html = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 0.5rem;">${courseName}</h4>
                        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem;">
                            ${currentLang === 'ar' ? 'المحاضرات المشاهدة' : 'Lectures Watched'}: ${lecturesWatched}/${totalLectures}
                        </p>
                    </div>
                    ${isCompleted ? '<div style="background: #27ae60; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">✓ ' + (currentLang === 'ar' ? 'مكتمل' : 'Completed') + '</div>' : ''}
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #e8ecf1; height: 8px; border-radius: 4px; margin: 1rem 0; overflow: hidden;">
                    <div style="background: #6366f1; height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                </div>
                
                <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1rem;">
                    ${currentLang === 'ar' ? 'التقدم' : 'Progress'}: ${progressPercent}%
                </p>
            `;
            
            if (!isCompleted) {
                html += `<button onclick="continueCourse(${course.id})" class="btn-primary" style="width: 100%; padding: 0.7rem; border: none; border-radius: 5px; background: #6366f1; color: white; cursor: pointer; font-weight: bold;">
                    ${currentLang === 'ar' ? 'متابعة الدراسة' : 'Continue Learning'}
                </button>`;
            } else {
                html += `<div style="background: #f0f9ff; color: #0284c7; padding: 1rem; border-radius: 5px; text-align: center; font-weight: bold;">
                    ${currentLang === 'ar' ? 'تم إكمال الكورس بنجاح! 🎉' : 'Course Completed Successfully! 🎉'}
                </div>`;
            }
            
            courseDiv.innerHTML = html;
            myCourses.appendChild(courseDiv);
        }
    });

    if (!hasEnrolled) {
        myCourses.innerHTML = `<p style="color: #64748b;">${currentLang === 'ar' ? 'أنت لم تسجل في أي كورس بعد' : 'You are not enrolled in any courses yet'}</p>`;
    }
}

// Continue Course Function - Increment lectures watched
function continueCourse(courseId) {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    const key = `${currentUser.id}_${courseId}`;
    if (!enrolledCourses[key]) {
        alert(currentLang === 'ar' ? 'أنت غير مسجل في هذا الكورس' : 'You are not enrolled in this course');
        return;
    }
    
    const enrollment = enrolledCourses[key];
    const totalLectures = enrollment.totalLectures || 10;
    
    // Increment lectures watched
    if (!enrollment.lecturesWatched) enrollment.lecturesWatched = 0;
    if (enrollment.lecturesWatched < totalLectures) {
        enrollment.lecturesWatched += 1;
        enrollment.progress = Math.round((enrollment.lecturesWatched / totalLectures) * 100);
        
        // Mark as completed if all lectures watched
        if (enrollment.lecturesWatched >= totalLectures) {
            enrollment.completed = true;
            enrollment.completedDate = new Date().toLocaleDateString();
        }
    }
    
    // Save to localStorage
    localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    
    // Show feedback
    const course = coursesData.find(c => c.id === courseId);
    const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
    const newProgress = enrollment.progress;
    
    if (enrollment.lecturesWatched >= totalLectures) {
        alert(currentLang === 'ar' 
            ? `🎉 تم إكمال الكورس "${courseName}" بنجاح!` 
            : `🎉 Course "${courseName}" completed successfully!`);
    } else {
        alert(currentLang === 'ar' 
            ? `تم حفظ التقدم: ${enrollment.lecturesWatched}/${totalLectures} محاضرات (${newProgress}%)` 
            : `Progress saved: ${enrollment.lecturesWatched}/${totalLectures} lectures (${newProgress}%)`);
    }
    
    // Refresh profile display
    displayProfile();
}

// Instructor Dashboard
function showDashboard() {
    if (!currentUser || currentUser.role !== 'instructor') {
        alert(currentLang === 'ar' ? 'هذه الصفحة للمعلمين فقط' : 'This page is for instructors only');
        return;
    }

    hideAllSections();
    document.getElementById('dashboardSection').classList.add('active');
    
    // Display stats and courses
    displayDashboardStats();
}

function displayDashboardStats() {
    const teacherId = currentUser.id;
    
    // Get courses created by this teacher
    const teacherCourses = coursesData.filter(c => c.createdBy === teacherId);
    
    // Count total students across all courses
    let totalStudents = 0;
    let totalRevenue = 0;
    
    teacherCourses.forEach(course => {
        const enrollments = Object.keys(enrolledCourses).filter(key => {
            const enrollment = enrolledCourses[key];
            return enrollment.courseId === course.id;
        });
        totalStudents += enrollments.length;
        totalRevenue += enrollments.length * course.price;
    });

    // Update UI
    document.getElementById('studentCount').textContent = totalStudents;
    document.getElementById('courseCount').textContent = teacherCourses.length;
    document.getElementById('overallRating').textContent = '4.7/5 ⭐';
    
    // Display charts
    renderDashboardCharts(teacherCourses);
    
    // Display teacher's courses
    displayTeacherCourses();
}

function renderDashboardCharts(teacherCourses) {
    // Get enrollment data for each course
    const courseData = teacherCourses.map(course => {
        const enrollments = Object.keys(enrolledCourses).filter(key => {
            return enrolledCourses[key].courseId === course.id;
        });
        const completed = enrollments.filter(key => enrolledCourses[key].completed).length;
        const avg_progress = enrollments.length > 0 
            ? Math.round(enrollments.reduce((sum, key) => sum + (enrolledCourses[key].progress || 0), 0) / enrollments.length)
            : 0;
        
        return {
            id: course.id,
            name: currentLang === 'ar' ? course.name_ar : course.name_en,
            students: enrollments.length,
            completed: completed,
            progress: avg_progress
        };
    });
    
    // Render enrollment bar chart
    const enrollmentChart = document.getElementById('enrollmentChart');
    enrollmentChart.innerHTML = courseData.map(data => `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600; color: #2c3e50; font-size: 0.85rem;">${data.name}</span>
                <span style="background: #6366f1; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${data.students} 👤</span>
            </div>
            <div style="background: #e5e7eb; height: 24px; border-radius: 4px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #6366f1, #818cf8); height: 100%; width: ${Math.min(data.students * 10, 100)}%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: white; font-size: 0.7rem; font-weight: bold;">
                    ${data.students}
                </div>
            </div>
        </div>
    `).join('');
    
    // Render completion progress chart
    const completionChart = document.getElementById('completionChart');
    completionChart.innerHTML = courseData.map(data => `
        <div style="margin-bottom: 1.2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600; color: #2c3e50; font-size: 0.85rem;">${data.name}</span>
                <span style="color: #27ae60; font-weight: bold; font-size: 0.75rem;">${data.progress}% | ${data.completed}/${data.students} ✓</span>
            </div>
            <div style="background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden; position: relative;">
                <div style="background: linear-gradient(90deg, #27ae60, #2ecc71); height: 100%; width: ${data.progress}%; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px; color: white; font-size: 0.65rem; font-weight: bold; transition: width 0.3s ease;">
                    ${data.progress > 10 ? data.progress + '%' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function displayTeacherCourses() {
    const teacherId = currentUser.id;
    const teacherCourses = coursesData.filter(c => c.createdBy === teacherId);
    
    // Create or get courses list container
    let coursesList = document.getElementById('teacherCoursesList');
    if (!coursesList) {
        // Create it if it doesn't exist
        const createCourseDiv = document.querySelector('.create-course');
        coursesList = document.createElement('div');
        coursesList.id = 'teacherCoursesList';
        coursesList.style.cssText = 'margin-top: 2rem;';
        createCourseDiv.parentNode.insertBefore(coursesList, createCourseDiv.nextSibling);
    }
    
    coursesList.innerHTML = '';
    
    if (teacherCourses.length === 0) {
        coursesList.innerHTML = `<p style="color: #64748b; text-align: center;">${currentLang === 'ar' ? 'لم تقم بإنشاء أي كورسات بعد' : 'You have not created any courses yet'}</p>`;
        return;
    }
    
    // Add header
    const header = document.createElement('h3');
    header.textContent = currentLang === 'ar' ? 'كورساتك' : 'Your Courses';
    coursesList.appendChild(header);
    
    // Add each course
    teacherCourses.forEach(course => {
        const enrollments = Object.keys(enrolledCourses).filter(key => {
            return enrolledCourses[key].courseId === course.id;
        });
        
        const courseEl = document.createElement('div');
        courseEl.style.cssText = 'background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #6366f1; display: flex; justify-content: space-between; align-items: center;';
        
        const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
        const revenue = enrollments.length * course.price;
        
        courseEl.innerHTML = `
            <div>
                <h4>${courseName}</h4>
                <p style="font-size: 0.9rem; color: #64748b; margin: 0.5rem 0;">
                    ${currentLang === 'ar' ? 'الطلاب' : 'Students'}: ${enrollments.length} | 
                    ${currentLang === 'ar' ? 'الإيرادات' : 'Revenue'}: $${revenue.toFixed(2)}
                </p>
            </div>
            <button class="btn-small" onclick="viewCourseStudents(${course.id})" style="background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                ${currentLang === 'ar' ? 'عرض الطلاب' : 'View Students'}
            </button>
        `;
        coursesList.appendChild(courseEl);
    });
}

function viewCourseStudents(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    const enrollments = Object.keys(enrolledCourses).filter(key => {
        return enrolledCourses[key].courseId === courseId;
    });
    
    if (enrollments.length === 0) {
        alert(currentLang === 'ar' ? 'لم يسجل أي طالب في هذا الكورس بعد' : 'No students registered for this course yet');
        return;
    }
    
    const studentNames = enrollments.map(key => {
        // Enrollment key is userId_courseId, extract userId
        const userId = key.split('_')[0];
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const user = allUsers.find(u => u.id.toString() === userId);
        return user ? user.name : `Student ${userId}`;
    });
    
    const courseName = currentLang === 'ar' ? course.name_ar : course.name_en;
    const message = `${currentLang === 'ar' ? 'الطلاب المسجلون في ' : 'Students registered in '}${courseName}:\n\n${studentNames.join('\n')}`;
    alert(message);
}

function handleCreateCourse(event) {
    event.preventDefault();

    const courseName = document.getElementById('courseName').value;
    const courseDesc = document.getElementById('courseDesc').value;
    const coursePrice = parseFloat(document.getElementById('coursePrice').value);

    // Validation
    if (!courseName || !courseDesc || !coursePrice || coursePrice <= 0) {
        alert(currentLang === 'ar' ? 'يرجى ملء جميع الحقول بشكل صحيح' : 'Please fill all fields correctly');
        return;
    }
    
    // Create new course
    const newCourse = {
        id: Math.max(...coursesData.map(c => c.id || 0), 0) + 1,
        name_ar: courseName,
        name_en: courseName, // For MVP, use same name
        desc_ar: courseDesc,
        desc_en: courseDesc, // For MVP, use same description
        price: coursePrice,
        instructor: currentUser.name,
        rating: 5.0,
        students: 0,
        lectures: 10,
        createdBy: currentUser.id
    };
    
    coursesData.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(coursesData));
    
    alert(currentLang === 'ar' ? `تم إنشاء الكورس "${courseName}" بنجاح!` : `Course "${courseName}" created successfully!`);

    document.getElementById('courseForm').reset();
    
    // Refresh dashboard
    displayDashboardStats();
}

// AI Responses Database
const aiResponses = {
    ar: {
        'شرح منهجية البحث': 'منهجية البحث تشمل: 1) تحديد المشكلة 2) مراجعة الأدبيات 3) تصميم الدراسة 4) جمع البيانات 5) تحليل النتائج 6) الخلاصات. كل خطوة مهمة لضمان جودة البحث العلمي.',
        'كتابة المقدمة': 'المقدمة الجيدة تتضمن: - تعريف واضح للموضوع - أهمية الدراسة - الأسئلة البحثية - الأهداف المرجوة. يجب أن تكون معبرة وجاذبة للقارئ.',
        'تقنيات الدراسة': 'أفضل تقنيات الدراسة: 1) طريقة Pomodoro (25 دقيقة دراسة + 5 دقائق استراحة) 2) إنشاء ملخصات 3) التعليم التكراري 4) التطبيق العملي 5) اختبر نفسك',
        'تنظيم الوقت': 'لتنظيم وقت الدراسة: - حدد أهدافاً واضحة - اقسم المادة لأجزاء صغيرة - خذ فترات راحة منتظمة - جنب الاشتتات - ركز على المهم أولاً',
        'الكورسات': 'لدينا 4 كورسات متاحة: 1) منهجية البحث (45$) 2) تحليل البيانات (50$) 3) كتابة البحث (40$) 4) الذكاء الاصطناعي (55$)',
        'الدفع': 'النظام يدعم الدفع بـ بطاقات الائتمان. بيانات الدفع آمنة وتُشفَّر. يمكنك بدء دراستك فوراً بعد الدفع.',
        'المساعدة': 'يمكنني مساعدتك في: شرح المفاهيم، إجابة الأسئلة، نصائح الدراسة، معلومات الكورسات. ما الذي تريد معرفته؟',
        'default': 'شكراً على سؤالك! يمكنني مساعدتك في موضوعات البحث والدراسة. هل لديك سؤال محدد؟'
    },
    en: {
        'Research Methodology': 'Research methodology includes: 1) Problem definition 2) Literature review 3) Study design 4) Data collection 5) Results analysis 6) Conclusions. Each step ensures research quality.',
        'Write Introduction': 'A good introduction includes: - Clear topic definition - Study importance - Research questions - Research objectives. It should be engaging and compelling.',
        'Study Techniques': 'Best study techniques: 1) Pomodoro method (25 min study + 5 min break) 2) Create summaries 3) Spaced repetition 4) Practical application 5) Self-testing',
        'Time Management': 'To organize study time: - Set clear goals - Divide material into small parts - Take regular breaks - Avoid distractions - Focus on priorities',
        'Courses': 'We have 4 available courses: 1) Research Methodology ($45) 2) Data Analysis ($50) 3) Research Writing ($40) 4) Artificial Intelligence ($55)',
        'Payment': 'The system supports credit card payments. Payment data is secure and encrypted. Start studying immediately after payment.',
        'Help': 'I can help you with: explaining concepts, answering questions, study tips, course information. What would you like to know?',
        'default': 'Thank you for your question! I can help you with research and study topics. Do you have a specific question?'
    }
};

let aiChatHistory = [];

// Show AI Section
function showAI() {
    hideAllSections();
    document.getElementById('aiSection').classList.add('active');
}

function openAIFromHome(prompt) {
    showAI();

    const aiInput = document.getElementById('aiInput');
    const homeInput = document.getElementById('homeAIInput');
    const homeMessage = homeInput ? homeInput.value.trim() : '';
    const messageToSend = prompt || homeMessage;

    if (aiInput) {
        aiInput.value = messageToSend;
        aiInput.focus();

        if (messageToSend) {
            sendAIMessage();
            if (homeInput) {
                homeInput.value = '';
            }
        }
    }
}

// Send message to AI
async function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // Display user message
    displayAIMessage(userMessage, 'user');
    input.value = '';

    // Show typing indicator
    showAITyping();

    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                lang: currentLang,
                history: aiChatHistory.slice(-10)
            })
        });

        if (!response.ok) {
            throw new Error('Local AI service unavailable');
        }

        const data = await response.json();
        removeAITyping();
        displayAIMessage(data.reply || getAIResponse(userMessage), 'bot');
    } catch (error) {
        removeAITyping();
        displayAIMessage(getAIResponse(userMessage), 'bot');
    }
}

// Ask AI (from suggestions)
function askAI(question) {
    document.getElementById('aiInput').value = question;
    sendAIMessage();
}

// Display AI message
function displayAIMessage(message, sender) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'bot' ? 'ai-message-bot' : 'ai-message-user';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in history
    aiChatHistory.push({ sender, message, timestamp: new Date() });
}

// Show typing indicator
function showAITyping() {
    const messagesContainer = document.getElementById('aiMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiTyping';
    typingDiv.className = 'ai-message-bot';
    typingDiv.innerHTML = '<span class="ai-typing"></span><span class="ai-typing"></span><span class="ai-typing"></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeAITyping() {
    const typingDiv = document.getElementById('aiTyping');
    if (typingDiv) typingDiv.remove();
}

// Get AI response
function getAIResponse(userMessage) {
    const lang = currentLang;
    const responses = aiResponses[lang];
    const lowerMessage = userMessage.toLowerCase();

    // Try exact match
    for (let key in responses) {
        if (lowerMessage.includes(key.toLowerCase())) {
            return responses[key];
        }
    }

    // If no match, return contextual response based on message keywords
    if (lowerMessage.includes('شرح') || lowerMessage.includes('explain')) {
        return responses['Help'] || aiResponses.ar['المساعدة'];
    }
    if (lowerMessage.includes('كورس') || lowerMessage.includes('course')) {
        return responses['Courses'] || aiResponses.ar['الكورسات'];
    }
    if (lowerMessage.includes('دفع') || lowerMessage.includes('payment')) {
        return responses['Payment'] || aiResponses.ar['الدفع'];
    }
    if (lowerMessage.includes('ساعد') || lowerMessage.includes('help')) {
        return responses['Help'] || aiResponses.ar['المساعدة'];
    }

    // Default response
    return responses['default'] || aiResponses.ar['default'];
}

// Make functions global
window.toggleLanguage = toggleLanguage;
window.selectRole = selectRole;
window.showHome = showHome;
window.showCourses = showCourses;
window.showChat = showChat;
window.showProfile = showProfile;
window.showAI = showAI;
window.openAIFromHome = openAIFromHome;
window.sendAIMessage = sendAIMessage;
window.askAI = askAI;
window.showLogin = showLogin;
window.closeLoginModal = closeLoginModal;
window.showRegister = showRegister;
window.closeRegisterModal = closeRegisterModal;
window.openRegistrationForm = openRegistrationForm;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.viewCourseDetails = viewCourseDetails;
window.enrollCourse = enrollCourse;
window.sendMessage = sendMessage;
window.showDashboard = showDashboard;
window.handleCreateCourse = handleCreateCourse;
window.viewCourseStudents = viewCourseStudents;
window.continueCourse = continueCourse;
window.handlePayment = handlePayment;
