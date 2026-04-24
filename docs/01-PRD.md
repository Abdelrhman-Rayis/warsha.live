# 📄 PRD — Product Requirement Document (Build Intent Doc)

## منصة التعلم الإلكترونية — Learning Platform

> **Define the WHY before the HOW.**

---

## 1. Problem Statement

### The Problem

Students and teachers in Arabic-speaking communities lack an accessible, bilingual (Arabic/English) learning platform that combines course management, real-time interaction, and AI-powered assistance in one place. Existing platforms are either English-only, expensive, or lack community features.

### Who Has This Problem?

- **Students** who want affordable, structured online courses with community support
- **Teachers** who need a simple way to create, manage, and monetize their courses
- **Arabic-speaking learners** who are underserved by mainstream English-only platforms

---

## 2. User Personas

### 👨‍🎓 Persona 1: Ali (The Student)

- **Age:** 18-25
- **Goal:** Find affordable courses, track progress, interact with teachers
- **Pain Points:** Most platforms are English-only, no direct teacher communication, expensive subscriptions
- **Behavior:** Uses mobile primarily, prefers Arabic UI, wants quick enrollment you can access also through different channelslike Telegram

### 👩‍🏫 Persona 2:Mazin (The Teacher)

- **Age:** 28-45
- **Goal:** Create courses, reach students, earn income, track student performance
- **Pain Points:** Complex course creation tools, no student analytics, no built-in payment
- **Behavior:** Uses desktop, needs a dashboard, wants simple course management

### 🤖 Persona 3: Late-Night Learner

- **Age:** Any
- **Goal:** Get instant answers to study questions at any hour
- **Pain Points:** No teacher available at 2 AM, generic AI doesn't understand educational context
- **Behavior:** Uses AI assistant for quick help, prefers conversational learning

---

## 3. App Goals

| Goal                             | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| 🎯**Accessible Education** | Provide a bilingual (AR/EN) platform anyone can use     |
| 💬**Community Learning**   | Enable real-time chat between students and teachers     |
| 🤖**24/7 AI Support**      | AI assistant that answers educational questions anytime |
| 💳**Simple Monetization**  | Easy payment flow for course enrollment                 |
| 📊**Progress Tracking**    | Students see their journey, teachers see their impact   |

---

## 4. Success Metrics

### Key Performance Indicators (KPIs)

| Metric                 | Target                                       | How to Measure                  |
| ---------------------- | -------------------------------------------- | ------------------------------- |
| User Registration Rate | 50+ users in first month                     | Count of registered accounts    |
| Course Enrollment Rate | 30% of registered users enroll in ≥1 course | Enrolled users / Total users    |
| Chat Engagement        | 5+ messages per active user per week         | Chat message count              |
| AI Assistant Usage     | 40% of users interact with AI weekly         | AI session count                |
| Course Completion Rate | 60% of enrolled students complete a course   | Completed / Enrolled            |
| Teacher Retention      | 80% of teachers create ≥2 courses           | Active teachers with 2+ courses |
| Language Toggle Usage  | 20% of users switch languages at least once  | Toggle event count              |

---

## 5. MVP Feature Set (Version 1.0) — Current State ✅

### Core Features (Must-Have)

#### 1. **User Authentication**

**User Story:** As a student or teacher, I want to create an account and log in so I can access personalized features.
**Requirements:**

- Registration with name, email, password, role (student/teacher)
- Login/logout functionality
- Session persistence via LocalStorage
- Role-based UI (student vs teacher views)

**Acceptance Criteria:**

- User can register in under 60 seconds
- Login persists across browser refreshes
- Teacher and student see different dashboards

---

#### 2. **Course Browsing & Enrollment**

**User Story:** As a student, I want to browse available courses and enroll in ones that interest me.
**Requirements:**

- Course catalog with search/filter
- Course detail view (description, price, instructor)
- Payment form for enrollment
- Enrollment confirmation

**Acceptance Criteria:**

- Student can browse and enroll in 3 taps or less
- Payment form validates card input
- Enrolled courses appear in student profile

---

#### 3. **Real-Time Chat**

**User Story:** As a student, I want to discuss course material with my teacher and peers in real-time.
**Requirements:**

- Chat room accessible to all logged-in users
- Message persistence via LocalStorage
- Sender identification (name + role badge)

**Acceptance Criteria:**

- Messages appear instantly after sending
- Chat history persists across sessions
- Users can identify who sent each message

---

#### 4. **AI Assistant**

**User Story:** As a student, I want to ask educational questions and get instant answers 24/7.
**Requirements:**

- Chat-style AI interface
- Educational context awareness
- Bilingual support (Arabic/English)
- Quick suggestion buttons

**Acceptance Criteria:**

- AI responds within 3 seconds
- Answers are educationally relevant
- Works in both Arabic and English

---

#### 5. **Bilingual Interface (AR/EN)**

**User Story:** As an Arabic speaker, I want to use the platform in my native language.
**Requirements:**

- Full Arabic and English UI
- RTL layout support for Arabic
- One-click language toggle
- All content translated

**Acceptance Criteria:**

- Language switches instantly without page reload
- RTL layout renders correctly
- All UI elements are translated

---

#### 6. **Teacher Dashboard**

**User Story:** As a teacher, I want to see my course statistics and manage my students.
**Requirements:**

- Overview stats (total students, courses, revenue)
- Course creation form
- Student list per course
- Rating/review visibility

**Acceptance Criteria:**

- Dashboard loads in under 2 seconds
- Teacher can create a new course in under 3 minutes
- Student data is accurate and up-to-date

---

## 6. Version 2.0 — Future Features (NOT in MVP)

| Feature                  | Priority | Notes                                                 |
| ------------------------ | -------- | ----------------------------------------------------- |
| 🎥 Video Lessons         | High     | Embed video content in courses                        |
| 📱 Mobile App (PWA)      | High     | Installable progressive web app                       |
| 🔔 Push Notifications    | Medium   | Reminders for new courses, messages                   |
| 📝 Quizzes & Assessments | Medium   | Test knowledge after each module                      |
| 🏆 Certificates          | Medium   | Generate completion certificates                      |
| 👥 Study Groups          | Low      | Private group chats per course                        |
| 📈 Advanced Analytics    | Low      | Detailed learning analytics for teachers              |
| 💰 Subscription Model    | Low      | Monthly plans instead of per-course                   |
| 🔗 Backend Database      | High     | Move from LocalStorage to real DB (Supabase/Firebase) |
| 🔐 Real Authentication   | High     | JWT-based auth with password hashing                  |

---

## 7. Constraints & Assumptions

### Constraints

- Currently client-side only (LocalStorage) — no real backend database
- No real payment processing — simulated payment flow
- AI assistant depends on local server or falls back to browser-based responses
- Single-page application — no routing framework

### Assumptions

- Users have modern browsers (Chrome, Firefox, Safari, Edge)
- Primary audience is Arabic-speaking students and teachers
- Initial deployment is for demonstration/portfolio purposes
- Internet connection required for AI features

---

> **🛑 This PRD must be reviewed and approved before any new development begins.**
> **No coding without intent. No building without direction.**
