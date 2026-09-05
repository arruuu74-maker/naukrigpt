# 💜 NaukriGPT — AI Career Counsellor for BCA Students

> **Confused about your career? NaukriGPT has answers.**

NaukriGPT is a web platform that helps BCA students navigate their career journey through AI-powered guidance, 1:1 mentorship, and a vibrant peer community. Built with a mobile-first, dark-themed UI.

🌐 **Live Demo:** [naukrigpt.vercel.app](https://naukrigpt.vercel.app)

---

## ✨ Features

### 🏠 Home Page (`index.html`)
- Hero section with clear value proposition
- Feature showcase: AI Counsellor, Mentorship, Community Wall, Buddy Finder
- 3-step onboarding flow (Join → Connect → Grow)
- Call-to-action sections driving community signups

### 💬 Community Page (`community.html`)

**🎓 Mentorship Hub**
- 6 expert mentors from TCS, Flipkart, Zomato, Infosys, Razorpay & CRED
- Book free 30-min 1:1 sessions with day & time-slot picker
- Booking confirmation flow with session details

**⚡ Networking Zone (Community Wall)**
- Post project showcases, doubts & referral requests
- Like/unlike posts with persistent like counts
- **localStorage-powered persistence** — posts & likes survive page refreshes

**🤝 Buddy Finder**
- Skill-based filtering (React, Python, Java, DSA)
- Match-percentage algorithm to find study partners
- Connect with peers from universities across India

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** Custom CSS with gradient design system (purple/blue dark theme)
- **Storage:** Browser localStorage API for client-side data persistence
- **Deployment:** Vercel (auto-deploys from GitHub)

---

## 🧠 Key Technical Highlights

- **Client-side persistence** using `localStorage` — user posts and likes are saved across sessions without a backend
- **Dynamic DOM rendering** — mentors, posts, and buddies rendered from JS data models
- **Index-shift handling** — like-state correctly remaps when new posts are prepended to the feed
- **XSS-safe rendering** — user input sanitized before display
- **Fully responsive** — mobile-first design that works on all screen sizes

---

## 📁 Project Structure
