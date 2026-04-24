# 🎨 Design Spec — Design Specification Document (Build Aesthetic Plan)
## منصة التعلم الإلكترونية — Learning Platform

> **Where the vibe becomes reality.**
> High fidelity mockups, user flows, and the interface your users will actually touch.

---

## 1. Design Direction

**Aesthetic:** Clean, modern educational platform — think the approachability of Duolingo meets the professionalism of Coursera. This should feel like a trusted learning environment, NOT a generic template.

**Mood:** Welcoming, professional, bilingual-native. The design should feel equally at home in Arabic (RTL) and English (LTR) without either feeling like an afterthought.

**Inspiration:** Platforms that make learning feel achievable — clear hierarchy, generous whitespace, and encouraging micro-interactions.

---

## 2. Color Palette

### Primary Colors

```
Background (Light):     #f1f5f9  — Soft gray, easy on the eyes for long study sessions
Background (Dark):      #0f172a  — Deep navy for hero sections and contrast
Primary Accent:         #6366f1  — Indigo/purple — trust, creativity, education
Secondary Accent:       #ec4899  — Pink — energy, engagement, CTAs
```

### Semantic Colors

```
Success / Enrolled:     #10b981  — Green — course completed, payment success
Error / Alert:          #ef4444  — Red — form errors, failed actions
Warning / Pending:      #f59e0b  — Amber — incomplete profile, pending payment
Info / Highlight:       #3b82f6  — Blue — tips, AI responses, notifications
```

### Text Colors

```
Primary Text:           #1e293b  — Near-black, high contrast for readability
Secondary Text:         #64748b  — Muted gray for descriptions, timestamps
Light Text (on dark):   #ffffff  — White text on dark backgrounds
Disabled Text:          #94a3b8  — Light gray for inactive elements
```

### Borders & Surfaces

```
Border Default:         #e2e8f0  — Subtle gray borders
Card Surface:           #ffffff  — White cards on gray background
Hover Surface:          #f8fafc  — Slightly lighter on hover
Shadow:                 rgba(0, 0, 0, 0.1)  — Soft shadows, never harsh
```

---

## 3. Typography

### Font Stack

```css
/* Primary — UI and body text */
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* Arabic Enhancement (future) */
font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;

/* Code/Data (AI responses, technical content) */
font-family: 'Courier New', monospace;
```

### Type Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Hero Title | 2.5rem (40px) | 700 (Bold) | Landing page headline |
| Section Title | 2rem (32px) | 700 (Bold) | Section headers |
| Card Title | 1.25rem (20px) | 600 (Semi-bold) | Course names, feature titles |
| Body Text | 1rem (16px) | 400 (Regular) | Descriptions, paragraphs |
| Small Text | 0.875rem (14px) | 400 (Regular) | Timestamps, labels, metadata |
| Button Text | 1rem (16px) | 600 (Semi-bold) | All buttons |
| Badge Text | 0.75rem (12px) | 600 (Semi-bold) | Tags, status badges |

### Typography Rules
- **No serif fonts anywhere** — keep it modern and clean
- Line height: 1.6 for body text, 1.2 for headings
- Letter spacing: -0.02em on headings for tightness
- Arabic text: slightly larger (1.1x) for readability

---

## 4. Visual Principles

### Spacing System

```
Base unit: 8px

XS:   4px   — Inner padding of badges, tight gaps
SM:   8px   — Gap between inline elements
MD:   16px  — Card padding, form field gaps
LG:   24px  — Section padding, card gaps
XL:   32px  — Between major sections
2XL:  48px  — Hero section padding
3XL:  64px  — Page-level vertical rhythm
```

### Design Rules

- **Generous spacing, never cramped** — education needs breathing room
- **Rounded corners everywhere** — 8px on cards, 12px on modals, 20px on buttons, full-round on avatars
- **Subtle borders** (1px, `#e2e8f0`) instead of heavy dividers
- **Soft shadows** — `0 2px 8px rgba(0,0,0,0.08)` on cards, deeper on modals
- **Hover states on everything clickable** — scale(1.02) + shadow increase on cards
- **Smooth transitions** — 0.3s ease on all interactive elements
- **Gradient accents** — `linear-gradient(135deg, #6366f1, #ec4899)` for hero, CTAs, and progress bars
- **No harsh borders on images** — use border-radius and subtle shadows instead

---

## 5. Component Design

### Navigation Bar
```
┌──────────────────────────────────────────────────────┐
│  🎓 Logo    Home  Courses  Chat  AI  Profile   [AR] │
│  ─────────────────────────────────────────────────── │
│  Sticky top | White bg | Bottom shadow | Responsive  │
└──────────────────────────────────────────────────────┘

- Sticky positioning (always visible)
- Active link: primary color underline
- Mobile: hamburger menu with slide-in drawer
- Language toggle: pill button (AR ↔ EN)
```

### Course Card
```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │   Course Image /  │  │
│  │   Gradient BG     │  │
│  └───────────────────┘  │
│                         │
│  📚 Category Badge      │
│  Course Title (Bold)    │
│  Short description...   │
│                         │
│  👨‍🏫 Instructor  ⭐ 4.8  │
│  ─────────────────────  │
│  💰 $49    [Enroll Now] │
└─────────────────────────┘

- White card on gray background
- Hover: translateY(-4px) + shadow increase
- Badge: colored pill (category-based)
- Price: bold, left-aligned
- CTA button: gradient background
```

### Chat Message
```
┌─────────────────────────────────┐
│  👤 Ahmed (Student)    2:30 PM  │
│  ┌─────────────────────────┐   │
│  │ How do I start the      │   │
│  │ research paper?         │   │
│  └─────────────────────────┘   │
│                                 │
│           👩‍🏫 Dr. Sara (Teacher) │
│   ┌─────────────────────────┐  │
│   │ Great question! Start   │  │
│   │ with your thesis...     │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘

- Student messages: left-aligned, light bg
- Teacher messages: right-aligned, primary color bg
- AI messages: centered, gradient border
- Timestamps: small, muted text
```

### AI Assistant Interface
```
┌─────────────────────────────────┐
│  🤖 المساعد الذكي               │
│  ─────────────────────────────  │
│                                 │
│  [Suggestion] [Suggestion]      │
│  [Suggestion] [Suggestion]      │
│                                 │
│  ┌─ AI Response ─────────────┐  │
│  │ 💡 Here's how to write    │  │
│  │ a research introduction:  │  │
│  │ 1. Start with context...  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────────────────┐ [Send] │
│  │ Type your question  │        │
│  └─────────────────────┘        │
└─────────────────────────────────┘

- Suggestion chips: outlined pills, hover fill
- AI responses: card with left accent border (gradient)
- Input: full-width, rounded, with send button
- Typing indicator: animated dots
```

---

## 6. User Flows

### Flow 1: New Student Registration → First Course Enrollment

```
Landing Page → Click "Create Account"
     ↓
Registration Form (Name, Email, Password, Role=Student)
     ↓
Auto-login → Redirect to Home
     ↓
Browse Courses → Click Course Card
     ↓
Course Detail (Description, Price, Instructor)
     ↓
Click "Enroll Now" → Payment Form
     ↓
Enter Card Details → Confirm Payment
     ↓
Success Message → Redirect to Profile (shows enrolled course)
```

**Target:** Complete flow in under 3 minutes.

### Flow 2: Student Uses AI Assistant

```
Login → Click "AI Assistant" in nav
     ↓
See Suggestion Chips → Click one OR type custom question
     ↓
AI Processes → Show typing indicator
     ↓
Display Response → User reads
     ↓
Follow-up question OR return to courses
```

**Target:** First answer in under 5 seconds.

### Flow 3: Teacher Creates a Course

```
Login (as Teacher) → Dashboard loads
     ↓
Click "Create New Course"
     ↓
Fill Form (Title, Description, Category, Price, Image)
     ↓
Preview → Confirm
     ↓
Course appears in catalog → Students can enroll
```

**Target:** Course creation in under 3 minutes.

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Single column, hamburger nav, stacked cards, full-width forms |
| Tablet | 768px - 1024px | 2-column grid, side nav possible, cards in pairs |
| Desktop | > 1024px | 3-4 column grid, full nav bar, sidebar dashboard |

### Mobile-First Priorities
1. Navigation must be thumb-friendly (min 44px touch targets)
2. Course cards stack vertically
3. Chat input stays fixed at bottom
4. Forms are full-width with large inputs
5. Language toggle is always accessible

---

## 8. RTL (Arabic) Design Considerations

| Element | LTR (English) | RTL (Arabic) |
|---------|---------------|--------------|
| Text alignment | Left | Right |
| Nav order | Logo left, links right | Logo right, links left |
| Card layout | Left-to-right grid | Right-to-left grid |
| Chat bubbles | Student left, teacher right | Student right, teacher left |
| Icons | Before text | After text |
| Progress bars | Fill left → right | Fill right → left |
| Shadows | Right side | Left side |

---

## 9. Animation & Micro-interactions

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Page sections | Fade in + slide up | 0.3s | Section switch |
| Course cards | Scale up + shadow | 0.2s | Hover |
| Buttons | Background color shift | 0.2s | Hover |
| Chat messages | Slide in from bottom | 0.3s | New message |
| AI typing | Pulsing dots | Loop | Waiting for response |
| Success toast | Slide in from top | 0.4s | Action complete |
| Language toggle | Flip animation | 0.3s | Click |
| Progress bar | Width transition | 0.5s | Data update |
| Modal | Fade in + scale | 0.3s | Open |
| Nav links | Underline slide | 0.2s | Hover/Active |

---

## 10. Accessibility Requirements

- **Color contrast:** Minimum 4.5:1 ratio for all text
- **Focus states:** Visible focus ring on all interactive elements
- **Alt text:** All images and icons have descriptive labels
- **Keyboard navigation:** Full tab-through support
- **Screen reader:** Semantic HTML (nav, main, section, article)
- **Font size:** Minimum 14px, user-scalable
- **Touch targets:** Minimum 44x44px on mobile

---

> **🛑 This Design Spec must be reviewed alongside the PRD and Tech Spec.**
> **If you're building something real, never skip this step.**
> **PRD → Tech Spec → Design Spec → Then build.**
