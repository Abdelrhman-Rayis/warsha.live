# Learning Platform

A complete educational platform designed to provide an effective and interactive learning experience.

---

## Key Features

### For Students
- Browse available courses and explore details.
- Register and simulate payment in a guided flow.
- Join interactive chat discussions with instructors and peers.
- Use the AI assistant for education-focused questions, available 24/7.
- Track enrolled courses and progress from the profile section.
- Switch between Arabic and English interfaces.

### For Instructors
- Access a dashboard with student and course insights.
- Add and manage new courses.
- Monitor ratings and student feedback.
- Review enrolled student information.

---

## Getting Started

### Quick Start

1. Start the local server:

```bash
npm start
```

2. Open the app:

```text
http://localhost:3000
```

3. Choose your preferred language (Arabic or English).
4. Explore the platform.

### Run the AI Assistant Locally

- The chat UI connects to `http://localhost:3000/api/ai`.
- If the server is running, you will get local API responses.
- If not reachable, the browser shows a fallback response.

### User Flow

#### 1. Register and Sign In
- Click `Create Account` to create a new account.
- Enter required details: name, email, password, and user role.
- Sign in after successful registration.

#### 2. Browse Courses
- Open the `Courses` section from the top navigation.
- Review available courses.
- Open any course to view full details.

#### 3. Enroll in a Course
- Click `Enroll Now` on a course page.
- Enter payment details.
- Confirm payment and enrollment.

#### 4. Join Community Chat
- Open the `Chat` section.
- Write and send messages.
- Interact with instructors and other students.

#### 5. View Profile
- Open the `Profile` section.
- Review personal details and enrolled courses.
- Track progress for each enrolled course.

#### 6. Use the AI Assistant
- Open `AI Assistant` from the navigation.
- Ask any education-related question.
- Use quick prompts for faster interactions.
- Receive instant answers.

---

## AI Assistant

### Highlights
- Focused on educational and academic support.
- Available 24/7.
- Supports Arabic and English.
- Offers smart prompt suggestions.
- Provides practical and detailed responses.

### Example Questions
- How do I structure social science research methodology?
- How do I write a strong research introduction?
- What are effective study techniques?
- How can I improve my time management for learning?
- What courses are available on the platform?
- How does registration and payment work?

### How to Use
1. Open `AI Assistant` from the top menu.
2. Type your question in the input field.
3. Click `Send` or choose a suggested prompt.
4. Read the generated response.

---

## Available Courses

### 1. Research Methodology in Social Sciences
- Price: $45
- Instructor: Abdelrhman
- Rating: 4.8
- Students: 150
- Lectures: 12

### 2. Statistical Data Analysis
- Price: $50
- Instructor: Wesal
- Rating: 4.7
- Students: 120
- Lectures: 15

### 3. Academic Research Writing
- Price: $40
- Instructor: Dr. Ahmed
- Rating: 4.9
- Students: 200
- Lectures: 10

### 4. Using AI in Research
- Price: $55
- Instructor: Abdelrhman
- Rating: 4.6
- Students: 85
- Lectures: 14

---

## Demo Accounts

### Student Account
- Email: `student@test.com`
- Password: `password123`

### Instructor Account
- Email: `instructor@test.com`
- Password: `password123`

---

## Design and Technical Details

### Design
- Responsive layout for phone, tablet, and desktop.
- Clean and modern user interface.
- Fast and smooth interaction patterns.

### Technical Stack
- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage for local browser data persistence

---

## Project Structure

```text
learning-platform/
├── index.html          # Main application page
├── styles.css          # Styling
├── app.js              # App interactivity and logic
└── README.md           # Project documentation
```

---

## Supported Languages

### Arabic
- Full Arabic UI support
- Right-to-left (RTL) layout

### English
- Full English UI support
- Left-to-right (LTR) layout

Switch languages using the `EN/AR` toggle in the top bar.

---

## Data Storage

All data is stored locally in the browser using LocalStorage, including:
- User account data
- Enrolled courses
- Chat messages
- Profile information

Note: Data is removed if browser storage or site data is cleared.

---

## Future Roadmap

Planned enhancements include:
- Video lecture system
- File and resource uploads
- Automated quizzes and assessments
- Digital certificates
- Private messaging
- Real-time notifications
- Real payment gateway integration
- Social platform integrations

---

## Support

If you face issues:
1. Make sure JavaScript is enabled in your browser.
2. Clear browser cache/site data and reload.
3. Try a different browser.

---

## License

This project is open source and available for general use.

---

## Team

This platform was developed as part of the **Research Methodology in Social Sciences** project.

- Abdelrhman - Technical Lead
- Wesal - Content Lead
- Meeting Organizer - Project Manager

---

Created: April 2, 2026
Version: 1.0.0
