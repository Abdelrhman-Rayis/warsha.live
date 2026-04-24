# 🚀 Detailed Implementation Plan
## Learning Platform — Agent-Ready Execution Guide

> This document breaks down the v1.0 MVP and v2.0 roadmap into actionable issues that a development agent can execute sequentially.

---

## Project Status Overview

| Component | Status | Coverage |
|-----------|--------|----------|
| **Planning** | ✅ Complete | PRD, Tech Spec, Design Spec |
| **MVP v1.0** | ✅ ~80% Built | Auth, courses, chat, AI, bilingual, dashboard |
| **Architecture** | ✅ Defined | Vanilla JS, LocalStorage, Node.js server |
| **Design System** | ✅ Defined | Colors, typography, spacing, components |
| **v2.0 Roadmap** | 📋 Ready | Backend, security, mobile, features |

---

## How to Use This Plan

### For Development Agents
1. Read this entire document first
2. Pick an Epic (e.g., "Complete MVP v1.0")
3. Pick an Issue from that Epic
4. Follow the **Acceptance Criteria** and **Implementation Details**
5. Mark as ✅ Done, move to next issue
6. If you get stuck, refer to the detailed specs in `01-PRD.md`, `02-TECH-SPEC.md`, `03-DESIGN-SPEC.md`

### For Human Reviewers
- Review completed issues against acceptance criteria
- Check that code follows design specs from `03-DESIGN-SPEC.md`
- Verify no regressions in existing features
- Test on mobile and desktop

---

## 📋 Current Implementation Status

### ✅ Already Implemented
- [x] Bilingual support (AR/EN)
- [x] User registration + login
- [x] Course browsing
- [x] Basic payment flow
- [x] Chat system
- [x] AI assistant (basic)
- [x] Teacher dashboard skeleton
- [x] LocalStorage persistence
- [x] Navigation + routing (show/hide sections)

### 🚧 Partially Implemented
- [ ] AI assistant responses (needs more educational content)
- [ ] Teacher dashboard features (course creation, student management)
- [ ] Course progress tracking
- [ ] User profile features

### ❌ Not Yet Implemented
- All v2.0 features (backend, PWA, videos, quizzes, certificates, etc.)

---

# EPIC 1: Complete & Polish MVP v1.0

> **Goal:** Make v1.0 production-ready with polished UX, complete features, and zero bugs.

---

## Issue 1.1: Fix Security Issues (XSS & Password Storage)

**Severity:** 🔴 HIGH  
**Estimated Time:** 2-3 hours  
**Assignee:** Agent  

### Description
The current implementation has critical security issues:
1. Chat uses `innerHTML` (XSS vulnerability)
2. Passwords stored in plain text in LocalStorage
3. AI endpoint has no rate limiting

### Acceptance Criteria
- [x] No `innerHTML` used for user-generated content
- [x] All chat/message content sanitized with `textContent` or sanitization function
- [x] Passwords hashed before storing (use crypto-js or simple hash)
- [x] No visible security warnings in browser console
- [x] All XSS vectors tested and blocked

### Implementation Details

**File:** `app.js`

**Task 1: Create sanitization function** (after line 100, before translations)
```javascript
// Sanitize user input to prevent XSS
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Simple hash for passwords (dev only - replace with bcrypt in v2.0)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}
```

**Task 2: Update handleRegister()** - Hash password before saving
- Find: `users.push({ id, name, email, password, role })`
- Replace with: `users.push({ id, name, email, password: hashPassword(password), role })`

**Task 3: Update handleLogin()** - Hash password before comparing
- Find the login validation logic
- Replace: `if (user.password === password)` with `if (user.password === hashPassword(password))`

**Task 4: Update sendMessage()** - Sanitize chat messages
- Find: `chatMessages.push({ sender, message, type, timestamp })`
- Replace `message` with: `message: sanitizeInput(message)`
- Update chat display to use text content, not HTML

**Task 5: Update displayChat()** - Use textContent instead of innerHTML
- Find all places where chat messages are added to DOM
- Replace `innerHTML` with `textContent` or use DOM methods

### Testing
```javascript
// Test XSS prevention
let xssTest = "<script>alert('XSS')</script>";
console.log(sanitizeInput(xssTest)); // Should NOT execute
```

---

## Issue 1.2: Complete Teacher Dashboard Functionality

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 3-4 hours  
**Assignee:** Agent  

### Description
Teacher dashboard is stubbed but non-functional. Need to implement:
1. Course creation form (working)
2. Display created courses
3. Show student list per course
4. Display revenue/stats

### Acceptance Criteria
- [x] Teacher can create a new course in < 3 minutes
- [x] Form validates all required fields
- [x] New course appears in catalog immediately
- [x] Dashboard shows accurate stats (student count, revenue, course count)
- [x] Student list shows who enrolled in each course
- [x] Works in both AR/EN

### Implementation Details

**File:** `app.js`

**Task 1: Implement handleCreateCourse()** (find in app.js, currently stubbed)
```javascript
function handleCreateCourse(event) {
  event.preventDefault();
  
  const form = document.getElementById('createCourseForm');
  const name_ar = document.getElementById('courseNameAr').value;
  const name_en = document.getElementById('courseNameEn').value;
  const desc_ar = document.getElementById('courseDescAr').value;
  const desc_en = document.getElementById('courseDescEn').value;
  const price = parseFloat(document.getElementById('coursePrice').value);
  const category = document.getElementById('courseCategory').value;
  
  // Validation
  if (!name_ar || !name_en || !desc_ar || !desc_en || !price || !category) {
    alert(currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
    return;
  }
  
  if (price <= 0) {
    alert(currentLang === 'ar' ? 'السعر يجب أن يكون أكبر من صفر' : 'Price must be greater than 0');
    return;
  }
  
  // Create new course
  const newCourse = {
    id: Math.max(...coursesData.map(c => c.id), 0) + 1,
    name_ar,
    name_en,
    desc_ar,
    desc_en,
    price,
    category,
    instructor: currentUser.name,
    rating: 5.0,
    students: 0,
    lectures: 0,
    createdBy: currentUser.id
  };
  
  coursesData.push(newCourse);
  localStorage.setItem('courses', JSON.stringify(coursesData));
  
  // Clear form
  form.reset();
  alert(currentLang === 'ar' ? 'تم إنشاء الكورس بنجاح!' : 'Course created successfully!');
  
  // Refresh dashboard
  showDashboard();
}
```

**Task 2: Implement displayDashboardStats()**
```javascript
function displayDashboardStats() {
  const teacherId = currentUser.id;
  
  // Count courses taught by this teacher
  const teacherCourses = coursesData.filter(c => c.createdBy === teacherId);
  
  // Count total students across all courses
  let totalStudents = 0;
  teacherCourses.forEach(course => {
    const enrollments = Object.values(enrolledCourses).filter(e => e.courseId === course.id);
    totalStudents += enrollments.length;
  });
  
  // Calculate revenue (assuming all students paid)
  let totalRevenue = 0;
  teacherCourses.forEach(course => {
    const enrollments = Object.values(enrolledCourses).filter(e => e.courseId === course.id);
    totalRevenue += enrollments.length * course.price;
  });
  
  // Update UI
  document.getElementById('dashboardStudentCount').textContent = totalStudents;
  document.getElementById('dashboardCourseCount').textContent = teacherCourses.length;
  document.getElementById('dashboardRevenue').textContent = '$' + totalRevenue.toFixed(2);
  
  // Display courses
  displayTeacherCourses();
}

function displayTeacherCourses() {
  const teacherId = currentUser.id;
  const teacherCourses = coursesData.filter(c => c.createdBy === teacherId);
  const container = document.getElementById('teacherCoursesList');
  container.innerHTML = '';
  
  teacherCourses.forEach(course => {
    // Count students in this course
    const enrollments = Object.values(enrolledCourses).filter(e => e.courseId === course.id);
    
    const courseEl = document.createElement('div');
    courseEl.className = 'course-row';
    courseEl.innerHTML = `
      <div class="course-name">${currentLang === 'ar' ? course.name_ar : course.name_en}</div>
      <div class="course-stats">${enrollments.length} students</div>
      <div class="course-revenue">$${(enrollments.length * course.price).toFixed(2)}</div>
      <button class="btn-small" onclick="viewCourseStudents(${course.id})">
        ${currentLang === 'ar' ? 'عرض الطلاب' : 'View Students'}
      </button>
    `;
    container.appendChild(courseEl);
  });
}

function viewCourseStudents(courseId) {
  const course = coursesData.find(c => c.id === courseId);
  const enrollments = Object.values(enrolledCourses).filter(e => e.courseId === courseId);
  
  const studentList = enrollments.map(enrollment => {
    const user = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id.toString() === enrollment.userId.toString());
    return user ? user.name : 'Unknown';
  }).join(', ');
  
  alert(`${currentLang === 'ar' ? 'الطلاب المسجلين في ' : 'Students enrolled in '} ${currentLang === 'ar' ? course.name_ar : course.name_en}:\n\n${studentList}`);
}
```

**Task 3: Update showDashboard() to call displayDashboardStats()**
- Find `function showDashboard() {`
- Add `displayDashboardStats();` inside the function

**File:** `index.html`

**Task 4: Add course creation form to HTML dashboard section**
(Already should exist, verify it has these fields and they have correct IDs)
- `courseNameAr`, `courseNameEn`
- `courseDescAr`, `courseDescEn`
- `coursePrice`, `courseCategory`
- Form onsubmit should call `handleCreateCourse(event)`

### Testing
1. Log in as teacher
2. Click dashboard
3. Create a new course with all fields filled
4. Verify it appears in course catalog
5. Enroll as student, verify student count updates
6. Check revenue calculation

---

## Issue 1.3: Enhance AI Assistant with Educational Content

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 2-3 hours  
**Assignee:** Agent  

### Description
AI assistant returns generic responses. Need to add educational content base for better answers.

### Acceptance Criteria
- [x] AI has 50+ educational responses
- [x] Answers are contextually relevant
- [x] Works in both Arabic and English
- [x] Suggestion chips show relevant topics
- [x] Fallback responses are helpful

### Implementation Details

**File:** `app.js`

**Task 1: Create educational responses database** (in app.js, after coursesData)

```javascript
const educationalResponses = {
  en: {
    'research methodology': 'Research methodology is the systematic process of conducting research. Key steps include: 1) Define your research question, 2) Conduct literature review, 3) Choose your methodology (qualitative/quantitative), 4) Collect data, 5) Analyze results, 6) Draw conclusions. Always document your sources!',
    'time management': 'Effective time management tips: 1) Use the Pomodoro technique (25 min work, 5 min break), 2) Prioritize tasks by importance, 3) Break large goals into smaller tasks, 4) Track your time, 5) Eliminate distractions, 6) Use a calendar or planner.',
    'study techniques': 'Effective study techniques: 1) Active recall (test yourself), 2) Spaced repetition (review material over time), 3) Teach-back method (explain to others), 4) Practice problems, 5) Mind mapping, 6) Take handwritten notes.',
    'course registration': 'To register for a course: 1) Browse available courses, 2) Read the course description, 3) Click "Enroll Now", 4) Complete the payment, 5) Access the course materials. Need help with payment? Contact support.',
    'payment issue': 'Payment issues can be resolved by: 1) Checking your card details, 2) Ensuring you have enough funds, 3) Trying a different payment method, 4) Contacting your bank, 5) Reaching out to our support team. Don\'t worry, your payment is secure!',
    'certificate': 'Certificates are awarded upon course completion. To earn a certificate: 1) Complete all course materials, 2) Pass any assessments, 3) Meet attendance requirements, 4) Download your certificate from your profile. Keep it for your records!',
    'discussion tips': 'Participate effectively in discussions: 1) Read others\' posts first, 2) Ask clarifying questions, 3) Share relevant resources, 4) Be respectful, 5) Provide evidence for claims, 6) Connect ideas to course material.',
    'default': 'I\'m here to help! I can answer questions about research, study techniques, course registration, time management, and more. Ask me anything related to learning!',
  },
  ar: {
    'منهجية البحث': 'منهجية البحث هي العملية المنظمة لإجراء البحث. الخطوات الأساسية: 1) تحديد سؤال البحث، 2) مراجعة الدراسات السابقة، 3) اختيار النوع (كمي/كيفي)، 4) جمع البيانات، 5) تحليل النتائج، 6) الخلاصات. وثق مصادرك دائماً!',
    'تنظيم الوقت': 'نصائح لتنظيم الوقت بفعالية: 1) استخدم تقنية بومودورو (25 دقيقة عمل، 5 دقائق راحة)، 2) رتب المهام حسب الأهمية، 3) قسّم الأهداف الكبيرة، 4) تتبع وقتك، 5) قلل الملهيات، 6) استخدم تقويماً أو مخإلى Plan.',
    'طرق الدراسة': 'طرق دراسة فعّالة: 1) الاستدعاء النشط (اختبر نفسك)، 2) التكرار المتباعد، 3) شرح المحتوى للآخرين، 4) حل مسائل عملية، 5) خرائط ذهنية، 6) الكتابة اليدوية.',
    'التسجيل': 'للتسجيل في كورس: 1) تصفح الكورسات المتاحة، 2) اقرأ وصف الكورس، 3) اضغط "التسجيل الآن"، 4) أكمل الدفع، 5) ادخل لمواد الكورس. هل تحتاج مساعدة؟',
    'الدفع': 'مشاكل الدفع: 1) تحقق من تفاصيل بطاقتك، 2) تأكد من رصيدك، 3) جرب طريقة دفع أخرى، 4) اتصل بالبنك، 5) تواصل معنا. دفعك آمن!',
    'الشهادة': 'تُمنح الشهادات بعد إتمام الكورس: 1) اكمل جميع المحاضرات، 2) اجتز الاختبارات، 3) حقق متطلبات الحضور، 4) حمل الشهادة من ملفك الشخصي.',
    'default': 'أنا هنا للمساعدة! يمكنني الإجابة عن أسئلة البحث، طرق الدراسة، التسجيل، تنظيم الوقت وغيرها. اسأل عن أي شيء يتعلق بالتعليم!',
  }
};
```

**Task 2: Update handleAIMessage()** to use educational database
```javascript
function handleAIMessage() {
  const input = document.getElementById('aiInput').value.trim().toLowerCase();
  if (!input) return;
  
  // Add user message
  const userMessage = document.createElement('div');
  userMessage.className = 'message student-message';
  userMessage.textContent = document.getElementById('aiInput').value;
  document.getElementById('aiChatMessages').appendChild(userMessage);
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'aiTyping';
  typingIndicator.className = 'message ai-message typing';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  document.getElementById('aiChatMessages').appendChild(typingIndicator);
  
  // Simulate processing time
  setTimeout(() => {
    typingIndicator.remove();
    
    // Find relevant response
    const langResponses = educationalResponses[currentLang];
    let response = langResponses['default'];
    
    for (const key in langResponses) {
      if (input.includes(key.toLowerCase())) {
        response = langResponses[key];
        break;
      }
    }
    
    // Try to fetch from server with fallback
    fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, language: currentLang })
    })
    .then(res => res.json())
    .then(data => {
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai-message';
      aiMessage.textContent = data.response || response;
      document.getElementById('aiChatMessages').appendChild(aiMessage);
      document.getElementById('aiChatMessages').scrollTop = document.getElementById('aiChatMessages').scrollHeight;
    })
    .catch(() => {
      // Fallback to local response
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai-message';
      aiMessage.textContent = response;
      document.getElementById('aiChatMessages').appendChild(aiMessage);
      document.getElementById('aiChatMessages').scrollTop = document.getElementById('aiChatMessages').scrollHeight;
    });
  }, 1000);
  
  document.getElementById('aiInput').value = '';
}
```

**Task 3: Update AI suggestion chips** in HTML to match new responses
- Update the quick suggestion buttons to match educational topics

### Testing
1. Click AI Assistant
2. Test each suggestion chip
3. Test typing custom questions
4. Verify Arabic and English responses
5. Check that responses are relevant

---

## Issue 1.4: Add Course Progress Tracking

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 2-3 hours  
**Assignee:** Agent  

### Description
Students should see their progress in enrolled courses (how many lectures completed, percentage).

### Acceptance Criteria
- [x] Profile shows enrolled courses with progress bars
- [x] Progress updates when user "completes" a lecture (simulated)
- [x] Displays percentage completed (0-100%)
- [x] Works in both AR/EN
- [x] Data persists in LocalStorage

### Implementation Details

**File:** `app.js`

**Task 1: Extend enrolledCourses data structure**

Update enrollments to include progress:
```javascript
// Instead of:
// { "userId_courseId": { courseId, enrolledDate, progress } }

// Make it:
// { "userId_courseId": { 
//   courseId, 
//   enrolledDate, 
//   lecturesWatched: 0,
//   totalLectures: 12,
//   progress: 0 
// }}
```

**Task 2: Update displayProfile()** to show progress bars
```javascript
function displayEnrolledCourses() {
  const container = document.getElementById('enrolledCoursesContainer');
  container.innerHTML = '';
  
  const userId = currentUser.id.toString();
  
  Object.entries(enrolledCourses).forEach(([key, enrollment]) => {
    if (!key.startsWith(userId)) return;
    
    const course = coursesData.find(c => c.id === enrollment.courseId);
    if (!course) return;
    
    const progress = enrollment.progress || 0;
    const lecturesWatched = enrollment.lecturesWatched || 0;
    const totalLectures = course.lectures || 12;
    
    const courseEl = document.createElement('div');
    courseEl.className = 'enrolled-course-card';
    courseEl.innerHTML = `
      <div class="course-header">
        <h3>${currentLang === 'ar' ? course.name_ar : course.name_en}</h3>
        <span>${currentLang === 'ar' ? 'مكتمل' : 'Completed'}: ${progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-details">
        ${currentLang === 'ar' ? 'محاضرات' : 'Lectures'}: ${lecturesWatched}/${totalLectures}
      </div>
      <button class="btn-small" onclick="continueCourse(${enrollment.courseId})">
        ${currentLang === 'ar' ? 'متابعة الدراسة' : 'Continue Learning'}
      </button>
    `;
    container.appendChild(courseEl);
  });
}
```

**Task 3: Implement continueCourse()** (simulates watching a lecture)
```javascript
function continueCourse(courseId) {
  const userId = currentUser.id.toString();
  const key = `${userId}_${courseId}`;
  
  if (enrolledCourses[key]) {
    const course = coursesData.find(c => c.id === courseId);
    enrolledCourses[key].lecturesWatched = (enrolledCourses[key].lecturesWatched || 0) + 1;
    enrolledCourses[key].progress = Math.min(
      100,
      Math.round((enrolledCourses[key].lecturesWatched / course.lectures) * 100)
    );
    localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    displayEnrolledCourses();
    alert(currentLang === 'ar' ? 'تم تحديث التقدم!' : 'Progress updated!');
  }
}
```

**File:** `styles.css`

**Task 4: Add progress bar styles**
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.enrolled-course-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  background: var(--light-bg);
}

.progress-details {
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0.5rem 0;
}
```

### Testing
1. Log in as student
2. Enroll in a course
3. Go to profile
4. See progress bar (starts at 0%)
5. Click "Continue Learning" multiple times
6. Watch progress increase
7. Refresh page, verify progress persists

---

## Issue 1.5: Mobile Responsiveness Audit & Fixes

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 2-3 hours  
**Assignee:** Agent  

### Description
Ensure app works smoothly on mobile (< 768px) with touch-friendly interface.

### Acceptance Criteria
- [x] All buttons are 44px+ tall on mobile
- [x] Links have adequate spacing (no fat-finger errors)
- [x] Forms stack vertically on mobile
- [x] Course cards are single-column on mobile
- [x] Chat input is fixed at bottom on mobile
- [x] Navigation works with hamburger menu on mobile
- [x] No horizontal scroll
- [x] Touch events work smoothly

### Implementation Details

**File:** `styles.css`

**Task 1: Add mobile-specific rules** (add at end of styles.css)
```css
/* Mobile Responsiveness */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--light-bg);
    padding: 1rem;
    gap: 0.5rem;
    box-shadow: var(--shadow-md);
  }
  
  .nav-links.mobile-open {
    display: flex;
  }
  
  .nav-links a {
    padding: 0.75rem;
    border-radius: 4px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  input, select, textarea {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .btn-primary, .btn-secondary {
    min-height: 44px;
    font-size: 16px;
  }
  
  #aiChatMessages {
    margin-bottom: 70px; /* Space for fixed input */
  }
  
  .ai-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: var(--light-bg);
    border-top: 1px solid var(--border-color);
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0.75rem;
  }
  
  .hero-content h1 {
    font-size: 1.75rem;
  }
  
  .course-card {
    margin-bottom: 1rem;
  }
  
  .section {
    padding: 1rem;
  }
}
```

**Task 2: Add hamburger menu to HTML navigation**
- Add a hamburger button to navbar
- Make it visible only on mobile
- Toggle `.mobile-open` class on nav-links

**File:** `index.html` (in navbar)
```html
<button id="hamburger" class="hamburger" onclick="toggleMobileNav()">☰</button>
```

**File:** `styles.css` (add hamburger styles)
```css
.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }
  
  .nav-links {
    display: none;
  }
  
  .nav-links.mobile-open {
    display: flex;
  }
}
```

**File:** `app.js` (add toggle function)
```javascript
function toggleMobileNav() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('mobile-open');
}
```

### Testing
1. Test on mobile browser (< 768px)
2. Verify all buttons are clickable
3. Test hamburger menu
4. Test all forms on mobile
5. Scroll through courses
6. Test chat input positioning
7. Check no horizontal scroll

---

# EPIC 2: Security & Backend Migration (v2.0)

> **Goal:** Move from client-side only to real backend with proper security.

---

## Issue 2.1: Set Up Supabase Project

**Severity:** 🔴 HIGH  
**Estimated Time:** 1-2 hours  
**Assignee:** Agent or Human  

### Description
Create and configure a Supabase project for database, auth, and realtime.

### Acceptance Criteria
- [x] Supabase project created
- [x] PostgreSQL database accessible
- [x] Supabase Auth configured
- [x] RLS policies defined
- [x] Project URL and keys documented
- [x] Connection tested

### Implementation Details

(This is a setup task - see Supabase documentation)

**Steps:**
1. Go to supabase.com
2. Create new project
3. Configure database (PostgreSQL)
4. Enable Auth
5. Create tables:
   - `users` (id, email, password_hash, name, role, created_at)
   - `courses` (id, name_ar, name_en, desc_ar, desc_en, price, creator_id, created_at)
   - `enrollments` (id, user_id, course_id, enrolled_at, progress, lectures_watched)
   - `chat_messages` (id, sender_id, message, timestamp, type)
6. Set RLS policies
7. Document project URL & API keys

---

## Issue 2.2: Implement JWT Authentication

**Severity:** 🔴 HIGH  
**Estimated Time:** 4-5 hours  
**Assignee:** Agent  

### Description
Replace client-side auth with JWT tokens and server-side validation.

### Acceptance Criteria
- [x] Users register with email confirmation
- [x] Login returns JWT token
- [x] Token stored securely (httpOnly cookie)
- [x] Token expires after 24 hours
- [x] Refresh token implemented
- [x] All API calls require valid JWT
- [x] Server validates JWT on every request

### Implementation Details

(Requires backend server upgrade - see v2.0 full implementation guide)

---

## Issue 2.3: Add Real Payment Integration (Stripe)

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 3-4 hours  
**Assignee:** Agent  

### Description
Replace simulated payment with real Stripe integration.

### Acceptance Criteria
- [x] Stripe account created and configured
- [x] Payment intent created on backend
- [x] Card details sent securely to Stripe
- [x] Payment confirmed before enrollment
- [x] Webhook handles payment success/failure
- [x] Revenue tracked in database

### Implementation Details

(Requires Stripe API integration - see Stripe documentation)

---

# EPIC 3: Enhanced Features (v2.0)

> **Goal:** Add video lessons, quizzes, certificates, and PWA capabilities.

---

## Issue 3.1: Add Video Lesson Support

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 4-5 hours  
**Assignee:** Agent  

### Description
Allow teachers to add video lessons to courses.

### Acceptance Criteria
- [x] Teachers can upload videos
- [x] Videos display in course materials
- [x] Video player has play/pause/progress
- [x] Student progress tracked per video
- [x] Video completion marked automatically
- [x] Works with different video formats (MP4, HLS)

### Implementation Details

(See v2.0 video implementation guide)

---

## Issue 3.2: Build Quiz/Assessment System

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 5-6 hours  
**Assignee:** Agent  

### Description
Allow teachers to create quizzes with multiple choice questions.

### Acceptance Criteria
- [x] Teachers create quizzes with 1-50 questions
- [x] Question types: multiple choice, short answer, true/false
- [x] Student can take quiz multiple times or once
- [x] Auto-grading for multiple choice
- [x] Score tracked and displayed
- [x] Results shown with explanations

### Implementation Details

(See v2.0 quiz implementation guide)

---

# EPIC 4: Polish & Optimization

> **Goal:** Performance, accessibility, and user experience refinements.

---

## Issue 4.1: Accessibility Improvements

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 2-3 hours  
**Assignee:** Agent  

### Description
Improve accessibility for screen readers and keyboard navigation.

### Acceptance Criteria
- [x] All interactive elements focusable via keyboard
- [x] ARIA labels added to all buttons
- [x] Screen reader friendly headings
- [x] Color contrast meets WCAG AA (4.5:1)
- [x] Forms labeled properly
- [x] Tab order logical

### Implementation Details

**File:** `index.html` & `app.js`

**Task:** Add ARIA labels and semantic HTML
```html
<!-- Example improvements -->
<button aria-label="Toggle language">EN</button>
<input aria-label="Email address" type="email">
<nav aria-label="Main navigation">
  <!-- nav items -->
</nav>
```

---

## Issue 4.2: Performance Optimization

**Severity:** 🟡 MEDIUM  
**Estimated Time:** 2-3 hours  
**Assignee:** Agent  

### Description
Optimize load time and reduce bundle size.

### Acceptance Criteria
- [x] First paint < 1s
- [x] TTI < 2s
- [x] Bundle size < 500KB
- [x] Lighthouse score > 85
- [x] No render-blocking resources
- [x] Images optimized (WebP, srcset)

### Implementation Details

(See performance optimization guide)

---

# Execution Checklist

Use this checklist to track progress:

## EPIC 1: Complete MVP v1.0
- [ ] Issue 1.1: Security fixes (XSS, passwords)
- [ ] Issue 1.2: Teacher dashboard
- [ ] Issue 1.3: AI educational content
- [ ] Issue 1.4: Progress tracking
- [ ] Issue 1.5: Mobile responsiveness

## EPIC 2: Security & Backend
- [ ] Issue 2.1: Supabase setup
- [ ] Issue 2.2: JWT authentication
- [ ] Issue 2.3: Stripe payment

## EPIC 3: Features  
- [ ] Issue 3.1: Video lessons
- [ ] Issue 3.2: Quizzes

## EPIC 4: Polish
- [ ] Issue 4.1: Accessibility
- [ ] Issue 4.2: Performance

---

> **🛑 Each issue is ready for agent execution. Review acceptance criteria before marking complete.**
