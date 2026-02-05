
---

# 📚 Celestial Scrolls – Immortal Library

**Celestial Scrolls** is a modern web platform dedicated to delivering an immersive reading experience for Celestial, Xianxia, and Fantasy novels. Built with the latest web technologies, the platform offers an elegant, fast, and fully responsive interface.

---

## 📸 Preview
![CelestialScrolls Preview](./public/readme/preview.jpeg)

## 🚀 Live Demo

👉 **Try it here:** [https://calestial-scroll.vercel.app/](https://calestial-scroll.vercel.app/)
Deployed on **Vercel**

## 🌟 Key Features

### 📖 For Readers

* **Immersive Reading Experience** – A distraction-free reading mode with full customization:

  * **Font Type**: Choose between Serif and Sans-serif
  * **Text Size**: Adjustable for eye comfort
  * **Theme**: Light, Sepia, and Dark modes available
  * **Visual Progress**: Indicators for read chapters to track your journey

* **Complete Novel Catalog**

  * Advanced search and filtering capabilities
  * Interactive Genre cards with 3D hover effects
  * Sorting options (Most Popular, Latest, Top Rated)

* **Smart Library & Tracking**

  * **Recently Read**: Quick access to your last read book on the homepage
  * **Bookmarks**: Save your favorite series
  * **History**: Comprehensive reading history
  * **Engagement**: Novel rating system and real-time view counters

* **User Interaction**

  * **Authentication**: Seamless login via **Google** or Email
  * **Community**: Comment system on novels and chapters for discussions

* **Progressive Web App (PWA)**

  * **Installable**: Functions as a native app on Mobile and Desktop
  * **Offline Capable**: Improved performance and caching

---

### 🛡️ Admin Dashboard

* **Advanced Analytics**

  * Real-time stats for Novels, Chapters, Users, and Views
  * **Weekly Trends**: Interactive charts visualizing viewership data

* **Moderation & Management**

  * **Comment Safety**: Review user reports and delete inappropriate comments
  * **Content Control**: Manage rankings and popular series list

---

## 🛠️ Tech Stack

This project is built using modern technologies for performance and scalability:

### Frontend

* **React** + **Vite** – Lightning-fast UI performance
* **TypeScript** – Type safety and robust development

### Styling & UI

* **Tailwind CSS** – Utility-first styling
* **shadcn/ui** – Accessible and beautiful UI components
* **Lucide** – Lightweight vector icons

### Backend & Infrastructure

* **Supabase** – PostgreSQL database, authentication, and realtime subscriptions

### Other Tools

* **TanStack Query** – Efficient server state management
* **React Router** – SPA navigation
* **Recharts** – Dashboard data visualization

---

## 🚀 Installation & Setup Guide

Follow these steps to run the project locally:

### Prerequisites

Make sure you have installed:

* **Node.js** (v18+ recommended)
* A package manager such as `npm`, `yarn`, or `bun`

---

### Steps

### 1. Clone the Repository

```bash
git clone https://github.com/adityaimamz/Calestial-scrolls.git
cd Calestial-scrolls
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables

Duplicate `.env.example`:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Create a project in the Supabase dashboard to obtain your URL and API key.

---

### 4. Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

### 5. Build for Production

```bash
npm run build
```

The production build will be generated inside the `dist` folder.

---

## 📂 Main Folder Structure

```
src/
├── components/     # Reusable UI components (Button, Card, Navbar, etc.)
├── hooks/          # Custom React Hooks
├── integrations/   # Third-party service configuration (Supabase)
├── lib/            # Utilities and helper functions
├── pages/          # Application pages (Home, Catalog, Reader, Admin)
└── index.css       # Global styles
```

---

## 👨‍💻 Credits

Created and developed by **Aditya Imam Zuhdi**

* Instagram: @adityaimamz
* LinkedIn: Aditya Imam Zuhdi

---

