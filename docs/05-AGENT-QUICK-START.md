# 🤖 Agent Quick-Start Guide
## How to Use the Implementation Plan

> This file tells you exactly what to do right now.

---

## What You Have

4 Planning Documents are ready:

| # | Doc | Purpose | Read Time |
|---|-----|---------|-----------|
| 1 | `01-PRD.md` | **The WHY** — Goals, personas, features, metrics | 15 min |
| 2 | `02-TECH-SPEC.md` | **The HOW** — Architecture, tech stack, data flows | 15 min |
| 3 | `03-DESIGN-SPEC.md` | **The LOOK** — Colors, components, user flows | 15 min |
| 4 | `04-IMPLEMENTATION-PLAN.md` | **The DO** — Step-by-step tasks for agents | Agent docs |

---

## What You Need to Do

### Step 1: Understand the Project (5 min)
Read this:
- **PRD:** Skim "2. User Personas", "3. App Goals", "5. MVP Feature Set"
- **Tech Spec:** Skim "1. System Architecture" + "2. Tech Stack"
- Result: You understand WHAT is being built and WHY

### Step 2: Pick an Epic (2 min)
Look at `04-IMPLEMENTATION-PLAN.md` and find which epic to work on:

**Recommended Order:**
1. **EPIC 1: Complete MVP v1.0** ← START HERE (gives most value)
   - Issues 1.1 to 1.5
   - Fixes, improvements, polish for current app
   - Time: ~12-15 hours total

2. **EPIC 2: Security & Backend** (requires Supabase setup)
   - Issues 2.1 to 2.3
   - Major architecture change
   - Time: ~10 hours total

3. **EPIC 3: New Features** (needs EPIC 2 done first)
   - Issues 3.1 to 3.2
   - Video, quizzes, certificates
   - Time: ~10+ hours total

4. **EPIC 4: Polish** (can be done anytime)
   - Issues 4.1 to 4.2
   - Accessibility, performance
   - Time: ~5 hours total

### Step 3: Pick an Issue (2 min)
Open `04-IMPLEMENTATION-PLAN.md` and find the first non-completed issue.

Example: **Issue 1.1: Fix Security Issues**
- Severity: 🔴 HIGH
- Estimated Time: 2-3 hours
- Read the full description

### Step 4: Execute the Issue (2-3 hours for most issues)
Each issue has:
- **Description** — What to build
- **Acceptance Criteria** — How you know when it's done ✅
- **Implementation Details** — Exact code to write, files to modify, functions to add

Follow the implementation details **exactly**.

### Step 5: Test (30 min)
At the bottom of each issue: "### Testing"
- Follow the test steps
- Verify acceptance criteria are met ✅
- If something fails, fix it or ask for help

### Step 6: Mark as Done
Update `04-IMPLEMENTATION-PLAN.md` execution checklist:
- Find the issue in the checklist
- Change `[ ]` to `[x]`

### Step 7: Move to Next Issue
Repeat steps 3-6 with the next issue

---

## Commands You'll Need

### View the Project
```bash
# Open the main app
open /Users/rayis/Documents/Mazin/learning-platform/index.html

# Or run the server
cd /Users/rayis/Documents/Mazin/learning-platform
npm start  # Runs server.js on port 3000
```

### Edit Files
- `index.html` — HTML structure (navigation, forms, sections)
- `styles.css` — Styling (colors, layout, responsive)
- `app.js` — Logic (functions, state, event handlers)
- `server.js` — Node.js server (/api/ai endpoint)

### Test Changes
1. Edit the file
2. Save (Cmd+S)
3. Refresh browser (Cmd+R)
4. Test the feature

### Commit Your Work
```bash
cd /Users/rayis/Documents/Mazin/learning-platform
git add .
git commit -m "Issue 1.1: Fix XSS security vulnerability in chat"
git push
```

---

## Current Project State

### ✅ Already Working
- Bilingual AR/EN interface
- User registration + login
- Course browsing + enrollment
- Chat system
- AI assistant (basic)
- Teacher dashboard (partial)
- Payment form (simulated, not real)

### 🚧 Partially Working
- Teacher dashboard (creates courses but needs work)
- AI responses (generic, needs educational content)
- Progress tracking (not implemented)

### 🔴 Broken / Security Issues
- Chat uses `innerHTML` (XSS vulnerability)
- Passwords stored in plain text
- No input sanitization

### ❌ Not Implemented
- Video lessons, quizzes, certificates
- Real backend (Supabase)
- Real payment (Stripe)
- PWA / offline mode

---

## Typical Issue Workflow

```
1. Read issue description
   ↓
2. Read acceptance criteria (these are the rules)
   ↓
3. Follow implementation details step-by-step
   ↓
4. Edit files with exact code provided
   ↓
5. Save and refresh browser
   ↓
6. Follow testing steps
   ↓
7. Verify all acceptance criteria are ✅ met
   ↓
8. Commit with `git commit`
   ↓
9. Update checklist: `[ ]` → `[x]`
   ↓
10. Pick next issue and repeat
```

---

## When You Get Stuck

### Issue: Something doesn't work after editing
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Check that you followed the code exactly
4. Refresh the page
5. Try reverting your change and re-doing it slowly

### Issue: You broke something that was working
1. Use `git diff` to see what changed
2. Revert with `git checkout filename`
3. Try again more carefully
4. Ask for help

### Issue: The acceptance criteria doesn't make sense
1. Re-read the description
2. Check the design spec (`03-DESIGN-SPEC.md`)
3. Look at similar features already in the code
4. Ask for clarification

---

## File Structure Reference

```
learning-platform/
│
├── index.html              ← HTML structure (sections, forms)
├── styles.css              ← Styling (colors, layout)
├── app.js                  ← Main logic (all functions)
├── server.js               ← Node.js backend
│
├── convert-to-pdf.js       ← PDF export
├── convert-journey-to-pdf.js
│
├── package.json            ← Dependencies
├── README.md               ← Project overview
│
└── docs/                   ← Planning documents
    ├── 00-PLANNING-FLOW.md          ← Master guide
    ├── 01-PRD.md                    ← Product requirements
    ├── 02-TECH-SPEC.md              ← Technical specs
    ├── 03-DESIGN-SPEC.md            ← Design specs
    ├── 04-IMPLEMENTATION-PLAN.md    ← This plan
    └── 05-AGENT-QUICK-START.md      ← This file
```

---

## Key Functions in app.js

| Function | What It Does | Location |
|----------|-------------|----------|
| `toggleLanguage()` | Switch AR/EN | Line ~400 |
| `handleRegister()` | Sign up user | Line ~450 |
| `handleLogin()` | Log in user | Line ~480 |
| `logout()` | Log out user | Line ~520 |
| `showCourses()` | Display courses | Line ~300 |
| `displayCourses()` | Render course cards | Line ~320 |
| `enrollCourse()` | Enroll in course | Line ~600 |
| `handlePayment()` | Process payment | Line ~650 |
| `sendMessage()` | Send chat message | Line ~700 |
| `displayChat()` | Render chat | Line ~720 |
| `handleAIMessage()` | Process AI query | Line ~800 |

(Actually, find these by searching in app.js)

---

## Common Patterns

### Add a translation
```javascript
// In translations object:
ar: {
  myNewText: 'النص العربي',
  ...
},
en: {
  myNewText: 'English text',
  ...
}

// Use it:
document.getElementById('elementId').textContent = translations[currentLang].myNewText;
```

### Update localStorage
```javascript
// Save
let data = JSON.parse(localStorage.getItem('key') || '[]');
data.push(newItem);
localStorage.setItem('key', JSON.stringify(data));

// Load
let data = JSON.parse(localStorage.getItem('key') || '[]');
```

### Show a section
```javascript
function showMySection() {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('mySectionId').classList.add('active');
}
```

### Create an element
```javascript
const element = document.createElement('div');
element.className = 'my-class';
element.textContent = 'Hello';
element.innerHTML = `<strong>${text}</strong>`; // Only for safe HTML
document.getElementById('container').appendChild(element);
```

---

## 🚀 You're Ready to Go!

**Next Steps:**
1. Read `01-PRD.md` (15 min)
2. Read `02-TECH-SPEC.md` (15 min)
3. Open `04-IMPLEMENTATION-PLAN.md`
4. Pick **Issue 1.1: Fix Security Issues**
5. Start executing!

Questions? Check the relevant doc or ask for help.

Good luck! 🎓
