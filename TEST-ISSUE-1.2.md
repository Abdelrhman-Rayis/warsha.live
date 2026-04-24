# 🧪 Manual Test Guide - Issue 1.2
## Complete Teacher Dashboard Functionality

**Test Date:** April 3, 2026  
**Platform:** http://localhost:3000  
**Browser:** Chrome/Safari  

---

## Pre-Test Checklist

- [ ] Server running: `npm start` (Port 3000)
- [ ] No browser console errors (F12 → Console tab)
- [ ] Clear localStorage before tests: Open DevTools → Application → Clear Storage
- [ ] Open app fresh: http://localhost:3000

---

## Test Case 1: Teacher Registration & Quick Stats View

**Objective:** Verify teacher can register and see initial dashboard stats

**Steps:**
1. Open http://localhost:3000
2. Click "تسجيل جديد" / "Register" button
3. Fill registration form:
   - Name: "Ahmed Teacher" (or any name)
   - Email: "teacher@test.com"
   - Password: "test123"
   - **Role: Select "معلم" / "Teacher"** ← IMPORTANT
4. Click "إنشاء حساب" / "Create Account"
5. Login with same credentials
6. Click "لوحة القيادة" / "Dashboard" in navbar

**Expected Results:**
- ✅ Registration succeeds without error
- ✅ Login works
- ✅ Dashboard appears with statistics cards:
  - Card 1: "Student Count: 0" (no students yet)
  - Card 2: "Course Count: 0" (no courses yet)
  - Card 3: "Rating: 4.7 ⭐" (default)
- ✅ Message shows: "لم تقم بإنشاء أي كورسات بعد" / "No courses created yet"
- ✅ Course creation form is visible

**Screenshots to Take:**
- Empty dashboard after first login
- Statistics cards display

---

## Test Case 2: Create First Course

**Objective:** Verify course creation works and persists

**Prerequisites:** Logged in as teacher

**Steps:**
1. On dashboard, locate course creation form
2. Fill in course details:
   - **Course Name:** "Python للمبتدئين"
   - **Description:** "تعلم البرمجة من الصفر"
   - **Price:** "49.99"
3. Click "إنشاء الكورس" / "Create Course" button

**Expected Results:**
- ✅ Form clears after submission
- ✅ Success message appears (console or UI)
- ✅ Course appears in "Your Courses" section below
- ✅ Dashboard stats update:
  - Course Count: 1
  - (No students until enrollment)
- ✅ Course card shows:
  - Course name: "Python للمبتدئين"
  - Students: 0
  - Revenue: "$0.00"

**Next Step:**
- Click "View Students" button
- ✅ Alert says: "No students enrolled yet" / "لم يسجل أحد بعد"

**Persistence Test:**
- Refresh page (Cmd+R)
- ✅ Course still appears (data persisted to localStorage)
- ✅ Stats still show Course Count: 1

---

## Test Case 3: Create Multiple Courses

**Objective:** Verify multiple course creation and stat aggregation

**Prerequisites:** Logged in as teacher with 1 course already created

**Steps:**
1. Create second course:
   - Name: "JavaScript المتقدم"
   - Description: "مفاهيم متقدمة في JS"
   - Price: "59.99"
2. Click Create
3. Create third course:
   - Name: "React Basics"
   - Description: "Front-end development"
   - Price: "44.99"
4. Click Create

**Expected Results:**
- ✅ All three courses appear in list
- ✅ Dashboard shows Course Count: 3
- ✅ All courses show in both AR and EN views (toggle with AR/EN buttons)
- ✅ Each course has its own "View Students" button

---

## Test Case 4: Enrollment & Student Tracking

**Objective:** Verify student enrollment and teacher can see them

**Prerequisites:** Teacher created at least 1 course

**Steps:**
1. **As Teacher:** Note course ID - first created course
2. **Logout** (click profile → logout)
3. **Register as Student:**
   - Name: "Fatima Student"
   - Email: "student@test.com"
   - Password: "test123"
   - Role: "طالب" / "Student"
4. Login as student
5. Go to "الكورسات" / "Courses" section
6. Find teacher's course (first one created)
7. Click "التسجيل" / "Enroll" button
8. See confirmation message

**Expected Results:**
- ✅ Enrollment succeeds
- ✅ Course now appears in student's profile under "My Courses"

---

## Test Case 5: Teacher Views Student Enrollment

**Objective:** Verify teacher can see who enrolled in their course

**Prerequisites:** 
- Teacher course created
- Student enrolled in that course

**Steps:**
1. **Logout** (clear student session)
2. **Login as Teacher** (same account from Test 2-3)
3. Go to Dashboard
4. Look at first course card
   - ✅ Should now show "Students: 1" (was 0)
   - ✅ Should show "Revenue: $49.99" or "$59.99" (depending on price)
5. Click "View Students" button on that course
6. Alert appears with student list

**Expected Results:**
- ✅ Stats update immediately - Course Count remains same
- ✅ **Student Count: 1** (updated from 0)
- ✅ **Revenue: calculated correctly** (price × enrolled students)
- ✅ Alert shows: "الطلاب المسجلين في هذا الكورس: Fatima Student"
- ✅ Close alert
- ✅ Can check other courses (no students) - shows "No students enrolled yet"

---

## Test Case 6: Multiple Students, Multiple Courses

**Objective:** Verify complex scenario with 3+ students and 3+ courses

**Prerequisites:** Starting fresh

**Steps:**
1. Create teacher account (Teacher-A)
2. Create 3 courses as Teacher-A
3. Create 3 student accounts (Student-1, Student-2, Student-3)
4. Student-1: Enroll in Course-1 and Course-2
5. Student-2: Enroll in Course-1, Course-2, and Course-3
6. Student-3: Enroll only in Course-3
7. Back to Teacher-A Dashboard

**Expected Results:**

**Dashboard Total Stats:**
- ✅ Course Count: 3
- ✅ Student Count: should show unique students
  - Course-1: 2 students
  - Course-2: 2 students
  - Course-3: 2 students
  - Total: 3 unique students (not 6 enrollments)
- ✅ Total Revenue: 
  - Course-1 ($49.99 × 2) = $99.98
  - Course-2 ($59.99 × 2) = $119.98
  - Course-3 ($44.99 × 2) = $89.98
  - Total: $309.94

**Per-Course Stats:**
- Course-1: 2 students, $99.98 revenue
- Course-2: 2 students, $119.98 revenue
- Course-3: 2 students, $89.98 revenue

**Student Lists:**
- Click "View Students" on Course-1 → Shows "Student-1, Student-2"
- Click "View Students" on Course-2 → Shows "Student-1, Student-2"
- Click "View Students" on Course-3 → Shows "Student-2, Student-3"

---

## Test Case 7: Bilingual Interface

**Objective:** Verify all dashboard elements work in both AR and EN

**Prerequisites:** Teacher account with courses created

**Steps:**
1. Dashboard showing (any language)
2. Look for language toggle in navbar (AR/EN buttons)
3. Click "EN" button
4. Verify all text changes:
   - Dashboard title → "Dashboard"
   - Stat cards → English labels
   - Course list → English headings
   - Button labels → English
5. Click "AR" button
6. Verify all text changes back:
   - Dashboard title → "لوحة القيادة"
   - Stat cards → Arabic labels
   - Course list → Arabic headings
   - Layout → RTL

**Expected Results:**
- ✅ All text translates correctly
- ✅ No text overlaps or cutoffs
- ✅ RTL layout applies in AR mode (entire page right-aligned)
- ✅ LTR layout applies in EN mode

---

## Test Case 8: Form Validation

**Objective:** Verify course creation form validates all required fields

**Prerequisites:** Logged in as teacher on dashboard

**Steps:**

### Test 8A: Missing Course Name
1. Leave "Course Name" empty
2. Fill Description: "Some description"
3. Fill Price: "49.99"
4. Click Create
5. ✅ Should show error (Arabic or English)

### Test 8B: Missing Description
1. Fill Course Name: "Test Course"
2. Leave Description empty
3. Fill Price: "49.99"
4. Click Create
5. ✅ Should show error

### Test 8C: Missing Price
1. Fill Course Name: "Test Course"
2. Fill Description: "Some description"
3. Leave Price empty
4. Click Create
5. ✅ Should show error

### Test 8D: Invalid Price (Zero or Negative)
1. Fill all fields
2. Price: "0" or "-10"
3. Click Create
4. ✅ Should show error or reject

**Expected Results:**
- ✅ All validation errors show appropriate messages
- ✅ Form does NOT submit invalid data
- ✅ Course NOT created if validation fails
- ✅ Error messages in current language (AR/EN)

---

## Test Case 9: Persistence After Refresh

**Objective:** Verify all dashboard data persists across browser refresh

**Prerequisites:** Teacher account with 2+ courses and 1+ enrollment

**Steps:**
1. Dashboard showing with courses and stats
2. **Record current state:**
   - Course Count
   - Student Count
   - Revenue
   - List of courses
3. **Refresh page** (Cmd+R)
4. **Go to Dashboard again**
5. **Compare state:**

**Expected Results:**
- ✅ All courses still present
- ✅ All stats unchanged
- ✅ All enrollments still valid
- ✅ No data loss on refresh

---

## Test Case 10: Mobile Responsiveness (Basic)

**Objective:** Verify dashboard works on mobile screen sizes

**Prerequisites:** Dashboard open

**Steps:**
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Cmd+Shift+M)
3. Select iPhone 12 (375px width)
4. Reload page
5. Navigate to Dashboard
6. View all elements:
   - Statistics cards
   - Course list
   - Course buttons
   - Forms

**Expected Results:**
- ✅ All text readable
- ✅ No horizontal scroll
- ✅ Buttons clickable (44px minimum)
- ✅ Layout stacks vertically
- ✅ Images/cards don't overflow

---

## Bug Report Template

If issues found during testing:

```
### Bug Report: [Test Case #] - [Brief Description]

**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
[Attach images if relevant]

**Browser:** Chrome/Safari, Version X
**OS:** macOS
**Reproducible:** Always / Sometimes / Once
```

---

## Test Completion Checklist

- [ ] Test 1: Teacher Registration & Stats View ✅
- [ ] Test 2: Create First Course ✅
- [ ] Test 3: Create Multiple Courses ✅
- [ ] Test 4: Enrollment & Student Tracking ✅
- [ ] Test 5: Teacher Views Student Enrollment ✅
- [ ] Test 6: Multiple Students, Multiple Courses ✅
- [ ] Test 7: Bilingual Interface ✅
- [ ] Test 8: Form Validation (all 4 sub-tests) ✅
- [ ] Test 9: Persistence After Refresh ✅
- [ ] Test 10: Mobile Responsiveness ✅

**Overall Result:** ✅ PASS / 🔴 FAIL

**Issues Found:** [Number]

---

## Required Tools

- Browser: Chrome/Safari/Firefox
- DevTools: Built-in browser DevTools (F12)
- Terminal: For starting `npm start`
- Text editor: Optional (for reading localStorage)

---

## Estimated Testing Time

- Quick smoke test (Tests 1-3): 10 minutes
- Full test suite (All tests): 45-60 minutes
- Mobile/responsive testing: +15 minutes

---

## Next Steps If All Tests Pass

✅ Issue 1.2 is verified and production-ready  
↓  
▶️ **Start Issue 1.3: Enhance AI with Educational Content**

---

*Test Guide v1.0 - April 3, 2026*
