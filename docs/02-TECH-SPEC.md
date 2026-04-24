# 🏗️ Tech Spec — Technical Specification Document (Build Implementation Doc)
## منصة التعلم الإلكترونية — Learning Platform

> **The bridge between idea and execution.**
> State the exact tech stack, how they work together, and lay out the architecture.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ index.html│  │styles.css│  │     app.js       │  │
│  │ (UI/HTML) │  │(Styling) │  │ (Logic/State)    │  │
│  └──────────┘  └──────────┘  └────────┬─────────┘  │
│                                        │            │
│  ┌─────────────────────────────────────┴──────────┐ │
│  │              LocalStorage (Data Layer)          │ │
│  │  users | currentUser | enrolledCourses | chat  │ │
│  └────────────────────────────────────────────────┘ │
│                        │                            │
└────────────────────────┼────────────────────────────┘
                         │ HTTP (fetch)
                         ▼
              ┌─────────────────────┐
              │   Node.js Server    │
              │   (server.js)       │
              │   Port: 3000        │
              │                     │
              │  /api/ai → AI Chat  │
              │  Static file serve  │
              └─────────────────────┘
```

---

## 2. Tech Stack

### Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Structure | HTML5 (Single File) | Simple, no build step, fast to iterate |
| Styling | CSS3 (Custom Properties) | CSS variables for theming, no framework overhead |
| Logic | Vanilla JavaScript (ES6+) | Zero dependencies, runs everywhere, easy to understand |
| State | LocalStorage | Persistent client-side storage, no backend needed for MVP |
| Layout | CSS Grid + Flexbox | Responsive without a framework |
| Animations | CSS Transitions + Keyframes | Smooth UI without JS animation libraries |
| Icons | Emoji + Unicode | No icon library dependency |
| RTL Support | CSS `direction: rtl` | Native browser RTL for Arabic |

### Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Server | Node.js + HTTP module | Lightweight, serves static files + API |
| AI Endpoint | `/api/ai` (server.js) | Local AI chat processing |
| Static Serving | Built-in file serving | No Express dependency needed for MVP |
| Package Manager | npm | Standard Node.js package management |

### Data Storage (Current: LocalStorage)

| Data Entity | Key | Structure |
|-------------|-----|-----------|
| Users | `users` | `Array<{ id, name, email, password, role }>` |
| Current Session | `currentUser` | `{ id, name, email, role }` |
| Enrollments | `enrolledCourses` | `{ "userId_courseId": { courseId, date, progress } }` |
| Chat Messages | `chatMessages` | `Array<{ sender, message, type, timestamp }>` |
| Courses | Hardcoded in `app.js` | `Array<{ id, name, desc, price, category, instructor }>` |

### Dev Tools & Utilities

| Tool | Purpose |
|------|---------|
| Puppeteer | PDF generation (convert-to-pdf.js, convert-journey-to-pdf.js) |
| Live Server (VS Code) | Local development with hot reload |
| Git | Version control |

---

## 3. Data Flow

### Authentication Flow
```
User Input → handleRegister() → Validate → Save to LocalStorage('users')
                                                    ↓
User Input → handleLogin() → Check LocalStorage → Set currentUser → Update UI
                                                    ↓
                              logout() → Remove currentUser → Reset UI
```

### Course Enrollment Flow
```
Browse Courses → viewCourseDetails(id) → showPayment(course)
                                              ↓
                    handlePayment() → Validate Card → Save to enrolledCourses
                                              ↓
                              Update Profile → Show Enrolled Courses
```

### Chat Flow
```
User Types Message → sendMessage() → Save to LocalStorage('chatMessages')
                                          ↓
                          Display in Chat UI → Auto-scroll to bottom
```

### AI Assistant Flow
```
User Question → fetch('/api/ai') → Server processes → Return response
                     ↓ (fallback)
              Browser-based response → Display in chat UI
```

### Language Toggle Flow
```
Click Toggle → toggleLanguage() → Update all text nodes → Switch CSS direction
                                       ↓
                          Save preference → Apply RTL/LTR layout
```

---

## 4. File Architecture

```
learning-platform/
│
├── index.html                    # Main SPA — all views in one file
│   ├── <nav>                     # Navigation bar with language toggle
│   ├── <section id="home">      # Landing page with hero + features
│   ├── <section id="courses">   # Course catalog grid
│   ├── <section id="chat">      # Real-time chat room
│   ├── <section id="ai-chat">   # AI assistant interface
│   ├── <section id="profile">   # User profile + enrolled courses
│   ├── <section id="dashboard"> # Teacher dashboard
│   ├── <section id="login">     # Login form
│   └── <section id="register">  # Registration form
│
├── styles.css                    # All styles (~2000+ lines)
│   ├── :root variables           # Color palette, spacing, fonts
│   ├── Global resets             # Box-sizing, margins
│   ├── Component styles          # Navbar, cards, forms, chat
│   ├── Responsive breakpoints    # Mobile, tablet, desktop
│   └── Animations                # Keyframes, transitions
│
├── app.js                        # All application logic
│   ├── Language system           # i18n translations object
│   ├── Course data               # Hardcoded course catalog
│   ├── Auth functions            # Login, register, logout
│   ├── Navigation                # SPA section switching
│   ├── Course management         # Display, enroll, payment
│   ├── Chat system               # Send, display, persist messages
│   ├── AI assistant              # Fetch API + fallback logic
│   └── Profile/Dashboard         # User stats, enrolled courses
│
├── server.js                     # Node.js server
│   ├── Static file serving       # Serves HTML/CSS/JS
│   └── /api/ai endpoint          # AI chat API
│
├── convert-to-pdf.js             # Puppeteer: HTML → PDF export
├── convert-journey-to-pdf.js     # Puppeteer: Student journey → PDF
│
└── docs/                         # 📁 Planning documents (NEW)
    ├── 01-PRD.md                 # Product Requirements
    ├── 02-TECH-SPEC.md           # This file
    └── 03-DESIGN-SPEC.md         # Design Specification
```

---

## 5. Key Technical Decisions

### Why Vanilla JS (No Framework)?
- **Zero build step** — open `index.html` and it works
- **No dependency hell** — nothing to install, update, or break
- **Learning-friendly** — students can read and understand every line
- **Fast** — no virtual DOM overhead, no hydration, no bundle size concerns

### Why LocalStorage (No Database)?
- **Instant setup** — no database server to configure
- **Offline capable** — works without internet (except AI)
- **Privacy** — data stays on user's device
- **MVP speed** — ship fast, migrate to real DB in v2.0

### Why Single HTML File (No Router)?
- **Simplicity** — show/hide sections instead of page navigation
- **No 404s** — everything is always loaded
- **Fast transitions** — instant section switching, no network requests
- **Easy to deploy** — one file, any static host

---

## 6. API Specification

### `POST /api/ai`

**Purpose:** Process AI chat messages

**Request:**
```json
{
  "message": "كيف أكتب مقدمة البحث؟",
  "language": "ar"
}
```

**Response:**
```json
{
  "response": "لكتابة مقدمة بحث جيدة، اتبع الخطوات التالية..."
}
```

**Fallback:** If server is unreachable, `app.js` generates a browser-based response using predefined educational answers.

---

## 7. Security Considerations (Current State)

| Area | Current | Risk Level | v2.0 Plan |
|------|---------|------------|-----------|
| Passwords | Plain text in LocalStorage | 🔴 High | Hash with bcrypt, store server-side |
| Authentication | Client-side only | 🔴 High | JWT tokens with server validation |
| Payment | Simulated (no real processing) | 🟡 Medium | Integrate Stripe/PayPal |
| Data Storage | LocalStorage (client) | 🟡 Medium | Supabase/Firebase with RLS |
| API | No authentication on /api/ai | 🟡 Medium | Add API key / rate limiting |
| XSS | innerHTML usage in chat | 🔴 High | Sanitize all user input |

---

## 8. Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Paint | < 1s | ✅ ~0.5s (no build step) |
| Interactive | < 2s | ✅ ~1s |
| Bundle Size | < 500KB total | ✅ ~200KB (HTML+CSS+JS) |
| Lighthouse Score | > 80 | ~75 (needs accessibility fixes) |

---

## 9. Migration Path (v1.0 → v2.0)

```
Phase 1: Add real backend
  LocalStorage → Supabase (PostgreSQL)
  Client auth → Supabase Auth (JWT)
  
Phase 2: Improve architecture  
  Single HTML → Component-based (Astro or Next.js)
  Vanilla CSS → Tailwind CSS
  Vanilla JS → React/Vue components
  
Phase 3: Add real features
  Simulated payment → Stripe integration
  Local AI → OpenAI/Anthropic API
  Static courses → CMS-managed content
  
Phase 4: Scale
  Static hosting → Vercel/Netlify
  Add CDN for assets
  Add monitoring (Sentry, Analytics)
```

---

> **🛑 This Tech Spec must align with the PRD. Any architecture change requires updating both documents.**
