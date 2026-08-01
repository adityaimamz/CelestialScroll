# 📚 Celestial Scrolls - Knowledge Base untuk AI Agent

## 📖 Ringkasan Project

**Celestial Scrolls (Immortal Library)** adalah platform web novel modern yang dikhususkan untuk novel Xianxia, Wuxia, dan Fantasy dengan terjemahan berkualitas. Platform ini menyediakan pengalaman membaca yang immersive, sistem gamifikasi, dan dashboard admin yang lengkap.

**Live Demo:** [https://calestial-scroll.vercel.app/](https://calestial-scroll.vercel.app/)  
**Deployment:** Vercel  
**Creator:** Aditya Imam Zuhdi

---

## 🏗️ Arsitektur Teknologi

### Stack Utama
- **Frontend Framework:** React 18.3.1 + Vite 5.4.19
- **Language:** TypeScript 5.8.3
- **Styling:** Tailwind CSS 3.4.17 + shadcn/ui
- **Routing:** React Router DOM 6.30.1
- **State Management:** TanStack Query 5.83.0
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Image Upload:** UploadThing
- **Analytics:** Vercel Analytics

### Dependencies Penting
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "@tanstack/react-query": "^5.83.0",
  "@supabase/supabase-js": "^2.93.3",
  "@uploadthing/react": "^7.3.3",
  "framer-motion": "^12.33.0",
  "lucide-react": "^0.462.0",
  "@tabler/icons-react": "^3.36.1",
  "react-markdown": "^10.1.0",
  "recharts": "^2.15.4",
  "jszip": "^3.10.1",
  "zod": "^3.25.76"
}
```


---

## 📁 Struktur Folder Project

```
CalestialScroll/
├── .agents/                    # Agent skills (vercel-react-best-practices)
├── api/                        # API endpoints
│   ├── sitemap.ts             # Sitemap generator
│   └── uploadthing.ts         # UploadThing file router config
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   ├── readme/                # Screenshots untuk README
│   └── robots.txt
├── src/
│   ├── assets/                # Images (hero-banner, novel covers)
│   ├── components/            # React components
│   │   ├── admin/            # Admin components (AdminSidebar, StatsCard)
│   │   ├── auth/             # Auth components (AuthProvider, AdminRoute, etc.)
│   │   ├── layout/           # Layout components (MainLayout, AdminLayout)
│   │   ├── settings/         # Settings components (Profile, Security)
│   │   └── ui/               # shadcn/ui base components
│   ├── contexts/              # React Context
│   │   └── LanguageContext.tsx  # Multi-language state management
│   ├── hooks/                 # Custom hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useScrollHideNav.ts
│   ├── i18n/                  # Internationalization
│   │   └── translations.ts    # Indonesian & English translations
│   ├── integrations/          # Third-party integrations
│   │   └── supabase/         # Supabase client & types
│   ├── lib/                   # Utility libraries
│   │   ├── badgeSystem.ts    # Gamification badge logic
│   │   ├── env.ts            # Environment validation
│   │   └── utils.ts          # Helper functions
│   ├── pages/                 # Application pages
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── auth/             # Authentication pages
│   │   └── ...               # Public pages (Index, Catalog, etc.)
│   ├── services/              # Business logic services
│   │   ├── adminLogger.ts    # Admin action audit logger
│   │   └── adminNotification.ts  # Admin notification service
│   ├── utils/                 # Utility functions
│   │   └── uploadthing.ts    # UploadThing helpers
│   ├── App.tsx               # Main app component dengan routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles & design tokens
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Environment variables template
├── components.json            # shadcn/ui configuration
├── package.json               # Dependencies & scripts
├── server.ts                  # Express server untuk SSR/API
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```


---

## 🎯 Fitur Utama Platform

### 📖 Untuk Pembaca (Public Features)

#### 1. **Sistem Autentikasi**
- **Provider:** Supabase Auth
- **Methods:** Google OAuth, Email/Password
- **Features:**
  - Login/Register dengan validasi
  - Forgot Password dengan email reset link
  - Update Password dengan current password verification
  - Session persistence dengan localStorage
  - Protected routes untuk halaman private

**Files:**
- `src/components/auth/AuthProvider.tsx` - Context provider untuk auth state
- `src/components/auth/AuthListener.tsx` - Real-time auth state listener
- `src/components/auth/ProtectedRoute.tsx` - HOC untuk protected routes
- `src/components/auth/AdminRoute.tsx` - HOC untuk admin-only routes
- `src/pages/auth/Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `UpdatePassword.tsx`

#### 2. **Reading Experience**
- **Fitur Pembaca:**
  - Mode baca full-screen tanpa navbar/footer
  - Customizable settings (Font Type, Size, Theme)
  - Reader themes: Light, Sepia, Dark
  - Tap to toggle navigation controls
  - Progress tracking per chapter
  - Previous/Next chapter navigation
  - Table of Contents (ToC) modal
  - Bookmark per chapter

**Files:**
- `src/pages/ChapterReader.tsx` - Main reader component
- `src/components/ReaderSettings.tsx` - Settings panel di reader

**Reader Settings Structure:**
```typescript
{
  fontSize: "sm" | "base" | "lg" | "xl",
  fontFamily: "serif" | "sans",
  theme: "light" | "sepia" | "dark"
}
// Stored in localStorage dengan key "readerSettings"
```


#### 3. **Multi-Language Support**
- **Languages:** Indonesian (id), English (en)
- **Scope:** Chapter content (bukan UI translation)
- **Implementation:**
  - Language filter di navbar (🇮🇩 / 🇺🇸 flags)
  - Preference saved di localStorage dengan key `languageFilter`
  - Separate chapter counts per language di novel detail
  - Language-aware chapter list dengan tabs
  - Chapters tagged dengan `language` field (`id` | `en`)

**Files:**
- `src/contexts/LanguageContext.tsx` - Language state management
- `src/i18n/translations.ts` - UI text translations (navbar, buttons, messages)

**Context API:**
```typescript
const { language, languageFilter, setLanguageFilter, t } = useLanguage();
// language: "id" | "en"
// t(key): Function untuk translate UI text
```

#### 4. **Gamifikasi: Cultivation Badge System**
- **Konsep:** Readers earn badges berdasarkan jumlah chapter yang dibaca
- **11 Tier Progression:** Martial Apprentice → Martial God
- **Stage System:** Setiap tier punya sub-stages (Stars, Chakras, Realms)
- **Visual Effects:** Gradients, glows, animations, rainbow effect untuk Martial God

**Badge Tiers:**
1. **Martial Apprentice** (0 chapters) - 7 Chakras - Gray
2. **Martial Warrior** (13+) - 9 Stars - Blue
3. **Martial Master** (25+) - 9 Stars - Green
4. **Great Martial Master** (37+) - 9 Stars - Cyan gradient
5. **Martial Lord** (49+) - 9 Stars - Purple gradient
6. **Martial King** (61+) - 9 Stars - Gold gradient
7. **Martial Grandmaster** (73+) - 9 Stars - Red gradient
8. **Martial Emperor** (91+) - 9 Stars - Pink gradient
9. **Martial Supreme** (109+) - 9 Stars - Multi-color gradient
10. **Martial Sovereign** (133+) - 9 Stars - Dark blue with glow
11. **Martial God** (156+) - 4 Realms - Rainbow gradient
    - Return to Truth (归真境) - 156+ chapters
    - Heavenly Mastery (掌天境) - 192+ chapters
    - Void Extreme (虚极境) - 240+ chapters
    - Creation Realm (造化境) - 300+ chapters

**Files:**
- `src/lib/badgeSystem.ts` - Badge calculation logic
- `src/components/UserBadge.tsx` - Badge display component
- `src/components/BadgeListModal.tsx` - Modal untuk lihat semua badges

**Key Functions:**
```typescript
getBadgeInfo(chapterCount): BadgeTier
getBadgeStageInfo(chapterCount): BadgeStageInfo // dengan progress & next stage info
```


#### 5. **Notification System (Real-time)**
- **Provider:** Supabase Realtime subscriptions
- **Notification Types:**
  - Comment replies
  - Comment likes/upvotes
  - Report status updates (untuk users yang submit reports)
  - System messages
  - Admin report alerts (untuk admin/moderator)

**Features:**
- Bell icon di navbar dengan unread badge (red dot)
- Notification dropdown dengan list
- Mark as read (individual atau bulk "Mark All Read")
- Report reply dialog (ketika admin reply ke report user)
- Real-time push tanpa refresh

**Files:**
- `src/components/NotificationDropdown.tsx` - Notification UI
- `src/services/adminNotification.ts` - Notification creation service

**Database Table:** `notifications`
```typescript
{
  id: string
  user_id: string
  type: "comment_reply" | "comment_like" | "report_update" | "system" | "admin_report"
  title: string
  message: string
  link?: string
  read: boolean
  created_at: timestamp
  related_entity_id?: string
  related_entity_type?: string
}
```

#### 6. **Comment System (Threaded)**
- **Features:**
  - Nested replies (threaded conversations)
  - Upvote/Downvote dengan vote count
  - Edit own comments
  - Delete own comments
  - Report inappropriate comments
  - Pagination untuk long threads
  - User profile modal onClick username/avatar

**Files:**
- `src/components/CommentsSection.tsx` - Main comment component

**Comment Structure:**
```typescript
{
  id: string
  user_id: string
  novel_id?: string
  chapter_id?: string
  parent_id?: string  // untuk replies
  content: string
  upvotes: number
  downvotes: number
  created_at: timestamp
  updated_at: timestamp
}
```


#### 7. **Report System**
- **Report Types:**
  - Chapter Reports (translation errors, missing content, etc.)
  - Comment Reports (inappropriate content, spam, etc.)

**Report Flow:**
1. User submit report dengan reason
2. Admin/Moderator receives notification
3. Admin review & update status (pending → resolved/ignored)
4. Admin dapat reply ke reporter
5. Reporter receives notification dengan admin's reply

**Files:**
- Pages dengan report feature: `ChapterReader.tsx`, `CommentsSection.tsx`
- Admin review pages: `src/pages/admin/ChapterReports.tsx`, `CommentReports.tsx`

**Database Tables:**
- `chapter_reports`: Reports untuk chapters
- `comment_reports`: Reports untuk comments

#### 8. **User Profile & Settings**
- **Profile Features:**
  - Avatar upload (via UploadThing)
  - Username & bio
  - Role badge display (Mortal, Immortal, Immortal King)
  - Cultivation badge display dengan stage
  - Join date
  - Public profile modal (click on any user)

- **Settings Pages:**
  - **Profile Tab:** Update username, bio, avatar
  - **Security Tab:** Change password dengan current password verification

**Files:**
- `src/components/UserProfileModal.tsx` - Public profile modal
- `src/pages/Settings.tsx` - Settings page dengan tabs
- `src/components/settings/ProfileSettings.tsx`
- `src/components/settings/SecuritySettings.tsx`

#### 9. **Novel Catalog & Discovery**
- **Homepage Sections:**
  - Hero Carousel (featured novels dengan blur background)
  - Recently Read (continue reading section)
  - Announcements (admin announcements)
  - Top Series Carousel (highest rated)
  - New Releases
  - Recent Updates
  - Popular Section (most views)
  - Genres Section
  - Request Section

**Files:**
- `src/pages/Index.tsx` - Homepage
- Individual section components di `src/components/`

**Pages:**
- `/` - Homepage
- `/series` - Catalog (all novels dengan filters & search)
- `/series/:id` - Novel Detail
- `/series/:id/chapter/:chapterId` - Chapter Reader
- `/series/rankings` - Rankings/Leaderboard
- `/genres` - Genres page
- `/bookmarks` - User's bookmarked novels
- `/request` - Request novel page


#### 10. **Novel Detail Page Features**
- Chapter list dengan tabs per language (Indonesian / English)
- Separate chapter counts per language
- Search chapters
- Sort chapters (Oldest/Newest first)
- Pagination
- Add/Remove bookmark
- Rate novel (star rating)
- View count tracking
- Genre tags
- Synopsis (Markdown support)
- Author info
- Continue reading (last read chapter)

**Files:**
- `src/pages/NovelDetail.tsx`
- `src/components/NovelCard.tsx` - Card component untuk novel di lists

### 🛡️ Untuk Admin (Admin Dashboard)

#### 1. **Dashboard Overview**
- **Analytics Cards:**
  - Total Novels
  - Total Chapters
  - Total Users
  - Total Views

- **Weekly Trends Chart:** Bar chart dengan Recharts (7 days view data)
- **Popular Novels:** Quick view dengan covers & ratings

**Files:**
- `src/pages/admin/Dashboard.tsx`
- `src/components/admin/StatsCard.tsx`

#### 2. **Novel Management**
- **CRUD Operations:**
  - Create novel
  - Edit novel (metadata & description)
  - Delete novel
  - Publish/Unpublish toggle

- **Novel Fields:**
  - Title
  - Author
  - Cover image (UploadThing upload)
  - Description (Markdown editor dengan preview)
  - Genres (multi-select)
  - Status (ongoing/completed/hiatus)
  - Published (boolean)

**Files:**
- `src/pages/admin/NovelList.tsx` - List dengan pagination & search
- `src/pages/admin/NovelForm.tsx` - Create/Edit form


#### 3. **Chapter Management**
- **CRUD Operations:**
  - Create chapter
  - Edit chapter
  - Delete chapter
  - Publish/Draft toggle

- **Smart Chapter Editor Features:**
  - **Live Markdown Preview:** Toggle write/preview tabs
  - **Auto Title Detection:** Paste chapter dengan format "Chapter 5: Title" → auto-fill chapter number & title
  - **Inline Image Upload:** Upload images langsung dari editor
  - **Previous/Next Navigation:** Navigate antar chapters tanpa kembali ke list
  - **Language Selection:** Tag chapter dengan Indonesian atau English

- **Chapter Fields:**
  - Chapter number
  - Title
  - Content (Markdown)
  - Language (`id` | `en`)
  - Published (boolean)

**Files:**
- `src/pages/admin/ChapterList.tsx` - Chapter list per novel
- `src/pages/admin/ChapterForm.tsx` - Create/Edit chapter

#### 4. **EPUB Importer**
- **Features:**
  - Bulk chapter import dari .epub files
  - Smart parsing (OPF manifest & spine reading)
  - Chapter reordering sesuai EPUB structure
  - Selective import (checkbox list untuk pilih chapters)
  - Auto chapter numbering
  - Language selection sebelum import

**Process:**
1. Upload .epub file
2. JSZip extracts & parses content
3. Preview chapter list dengan checkboxes
4. Select language (Indonesian/English)
5. Confirm import
6. Chapters saved to database dengan sequential numbering

**Files:**
- `src/components/EpubImporter.tsx` - EPUB upload & import logic

**Dependencies:**
- `jszip` untuk extract .epub (ZIP format)
- XML parsing untuk OPF manifest


#### 5. **User Management**
- **Features:**
  - View all users dengan pagination
  - Search users by username/email
  - Change user roles (Admin, Moderator, User)
  - Delete users dengan confirmation
  - View user stats (join date, chapters read, badges)

- **Role System:**
  - `user` (Mortal) - Default role
  - `moderator` (Immortal) - Can manage content & reports
  - `admin` (Immortal King) - Full access

**Files:**
- `src/pages/admin/UserList.tsx`

**Database:** `profiles` table
```typescript
{
  id: string  // matches auth.users.id
  username: string
  bio?: string
  avatar_url?: string
  role: "user" | "moderator" | "admin"
  created_at: timestamp
}
```

#### 6. **Genre Management**
- **CRUD Operations:**
  - Create genre
  - Edit genre (name, description, slug)
  - Delete genre
  - Auto-generate slug dari name

**Files:**
- `src/pages/admin/GenresList.tsx`

#### 7. **Announcements Management**
- **Features:**
  - Create announcement (title + description)
  - Edit announcement
  - Delete announcement
  - Toggle active/inactive (control visibility di homepage)

**Files:**
- `src/pages/admin/AnnouncementsList.tsx`

**Display:**
- Active announcements ditampilkan di `src/components/AnnouncementsSection.tsx` (homepage)


#### 8. **Reports Management**

**A. Comment Reports (`/admin/reports/comments`)**
- View all reported comments
- Filter by status (pending/resolved/ignored)
- See reporter info & reason
- View comment context & link
- Update report status
- Reply to reporter (triggers notification)
- Delete report

**B. Chapter Reports (`/admin/reports/chapters`)**
- View all reported chapters
- Filter by status
- See reporter info & issue details
- Direct link to chapter
- Update report status
- Reply to reporter
- Delete report

**Files:**
- `src/pages/admin/CommentReports.tsx`
- `src/pages/admin/ChapterReports.tsx`

**Report Status Flow:**
```
pending → resolved (admin fixed issue)
pending → ignored (false report)
```

#### 9. **Activity Log**
- **Purpose:** Monitor recent comment activity across platform
- **Data Shown:**
  - Recent comments
  - User info (username, avatar)
  - Comment content preview
  - Timestamps
  - Links to novel/chapter

**Files:**
- `src/pages/admin/Activity.tsx`

#### 10. **Admin Audit Log**
- **Purpose:** Track all admin & moderator actions untuk accountability
- **Logged Actions:**
  - CREATE, UPDATE, DELETE, BAN, APPROVE, REJECT
  - Entity types: NOVEL, CHAPTER, USER, COMMENT, REVIEW

- **Log Entry:**
  - Admin/Moderator info (ID, username, avatar)
  - Action type
  - Entity type & ID
  - Details (JSON object dengan changes)
  - Timestamp

**Files:**
- `src/pages/admin/AdminLogs.tsx` - View logs
- `src/services/adminLogger.ts` - Service untuk create logs

**Usage:**
```typescript
import { logAdminAction } from '@/services/adminLogger';

await logAdminAction('DELETE', 'CHAPTER', chapterId, {
  novel_title: "Novel Name",
  chapter_number: 5
});
```

**Database Table:** `admin_logs`


---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Core Tables

#### `profiles`
User profile data (extends auth.users)
```sql
- id: uuid (PK, references auth.users)
- username: text
- bio: text
- avatar_url: text
- role: text (user | moderator | admin)
- created_at: timestamp
```

#### `novels`
```sql
- id: uuid (PK)
- title: text
- author: text
- description: text (Markdown)
- cover_url: text
- status: text (ongoing | completed | hiatus)
- published: boolean
- view_count: integer
- created_at: timestamp
- updated_at: timestamp
```

#### `chapters`
```sql
- id: uuid (PK)
- novel_id: uuid (FK → novels)
- chapter_number: integer
- title: text
- content: text (Markdown)
- language: text (id | en)
- published: boolean
- created_at: timestamp
- updated_at: timestamp
```

#### `genres`
```sql
- id: uuid (PK)
- name: text
- slug: text (unique)
- description: text
- created_at: timestamp
```

#### `novel_genres`
Many-to-many junction table
```sql
- novel_id: uuid (FK → novels)
- genre_id: uuid (FK → genres)
- PRIMARY KEY (novel_id, genre_id)
```


### User Interaction Tables

#### `bookmarks`
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles)
- novel_id: uuid (FK → novels)
- created_at: timestamp
- UNIQUE (user_id, novel_id)
```

#### `reading_history`
Tracks user's reading progress
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles)
- novel_id: uuid (FK → novels)
- chapter_id: uuid (FK → chapters)
- last_read_at: timestamp
```

#### `ratings`
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles)
- novel_id: uuid (FK → novels)
- rating: integer (1-5)
- created_at: timestamp
- UNIQUE (user_id, novel_id)
```

#### `comments`
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles)
- novel_id: uuid (FK → novels, nullable)
- chapter_id: uuid (FK → chapters, nullable)
- parent_id: uuid (FK → comments, nullable for replies)
- content: text
- upvotes: integer (default 0)
- downvotes: integer (default 0)
- created_at: timestamp
- updated_at: timestamp
```

#### `comment_votes`
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles)
- comment_id: uuid (FK → comments)
- vote_type: text (upvote | downvote)
- created_at: timestamp
- UNIQUE (user_id, comment_id)
```


### Admin & Moderation Tables

#### `announcements`
```sql
- id: uuid (PK)
- title: text
- description: text
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
```

#### `chapter_reports`
```sql
- id: uuid (PK)
- chapter_id: uuid (FK → chapters)
- reported_by: uuid (FK → profiles)
- reason: text
- status: text (pending | resolved | ignored)
- admin_reply: text (nullable)
- created_at: timestamp
- updated_at: timestamp
```

#### `comment_reports`
```sql
- id: uuid (PK)
- comment_id: uuid (FK → comments)
- reported_by: uuid (FK → profiles)
- reason: text
- status: text (pending | resolved | ignored)
- admin_reply: text (nullable)
- created_at: timestamp
- updated_at: timestamp
```

#### `admin_logs`
Audit trail untuk admin actions
```sql
- id: uuid (PK)
- admin_id: uuid (FK → profiles)
- action_type: text (CREATE | UPDATE | DELETE | BAN | APPROVE | REJECT)
- entity_type: text (NOVEL | CHAPTER | USER | COMMENT | REVIEW)
- entity_id: uuid (nullable)
- details: jsonb
- created_at: timestamp
```

#### `notifications`
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles)
- type: text (comment_reply | comment_like | report_update | system | admin_report)
- title: text
- message: text
- link: text (nullable)
- read: boolean (default false)
- related_entity_id: uuid (nullable)
- related_entity_type: text (nullable)
- created_at: timestamp
```


---

## 🔌 API & Services

### Supabase Client
**File:** `src/integrations/supabase/client.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

// Auth
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signInWithOAuth({ provider: 'google' });
await supabase.auth.signOut();
const { data: { user } } = await supabase.auth.getUser();

// Database queries
const { data, error } = await supabase
  .from('novels')
  .select('*')
  .eq('published', true);

// Realtime subscriptions
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle new notification
  })
  .subscribe();
```

### UploadThing (Image Upload)
**Files:**
- `api/uploadthing.ts` - Server-side file router
- `src/utils/uploadthing.ts` - Client helpers

**Usage:**
```typescript
import { useUploadThing } from '@/utils/uploadthing';

const { startUpload, isUploading } = useUploadThing("imageUploader");
const result = await startUpload(files);
// result[0].url → uploaded image URL
```

**Configuration:**
- Max file size: 4MB
- Allowed types: image/*
- Upload endpoint: `/api/uploadthing`


### Admin Services

#### Admin Logger Service
**File:** `src/services/adminLogger.ts`

```typescript
import { logAdminAction } from '@/services/adminLogger';

// Log admin actions
await logAdminAction(
  'DELETE',        // action_type
  'CHAPTER',       // entity_type
  chapterId,       // entity_id
  {                // details (optional)
    novel_title: "Example Novel",
    chapter_number: 5
  }
);
```

#### Admin Notification Service
**File:** `src/services/adminNotification.ts`

```typescript
import { notifyAdmins, notifyUser } from '@/services/adminNotification';

// Notify all admins/moderators
await notifyAdmins(
  'admin_report',
  reportId,
  {
    title: "New Chapter Report",
    message: "User reported translation error",
    link: `/admin/reports/chapters`
  }
);

// Notify specific user
await notifyUser(
  userId,
  'report_reply',
  {
    title: "Admin Reply",
    message: "Thank you, we've fixed the issue.",
    link: `/series/${novelId}/chapter/${chapterId}`
  }
);
```

---

## 🎨 UI Components & Design System

### shadcn/ui Base Components
Located in `src/components/ui/`

**Installed Components:**
- Accordion, Alert Dialog, Avatar, Badge, Button
- Card, Checkbox, Collapsible, Command, Context Menu
- Dialog, Dropdown Menu, Form, Hover Card, Input
- Label, Menubar, Navigation Menu, Popover, Progress
- Radio Group, Scroll Area, Select, Separator, Slider
- Sonner (toast), Switch, Tabs, Textarea, Toast, Toggle
- Tooltip, etc.

**Custom Components:**
- `FollowCursor.tsx` - Interactive cursor effect (desktop only)
- `BarLoader.tsx` - Loading animation
- `FloatingDock.tsx` - Mobile bottom navigation


### Layout Components
**Files:** `src/components/layout/`

- **MainLayout.tsx** - Public pages layout (Navbar + Footer + Outlet)
- **AdminLayout.tsx** - Admin dashboard layout (Sidebar + Outlet)

### Theme System
**File:** `src/components/ThemeProvider.tsx`

- **Modes:** Light, Dark, System
- **Storage:** localStorage dengan key `vite-ui-theme`
- **Toggle:** `src/components/ThemeToggle.tsx`

**Tailwind Design Tokens:** `src/index.css`
```css
:root {
  --background: ...;
  --foreground: ...;
  --card: ...;
  --primary: ...;
  --secondary: ...;
  /* etc. */
}

.dark {
  /* Dark mode overrides */
}
```

### Icons
- **Lucide React:** Primary icon library
- **Tabler Icons:** Supplementary icons
- Usage: `import { IconName } from 'lucide-react'`

---

## 🛣️ Routing Structure

**Router:** React Router DOM v6  
**Mode:** BrowserRouter  
**Lazy Loading:** Semua pages di-lazy load dengan `React.lazy()`

### Public Routes (dengan MainLayout)
```typescript
/                          → Index (Homepage)
/series                    → Catalog (novel list)
/series/:id                → NovelDetail
/bookmarks                 → Bookmark (user's saved novels)
/series/rankings           → Rankings (leaderboard)
/genres                    → Genres (browse by genre)
/request                   → RequestNovel
/login                     → Login
/register                  → Register
/forgot-password           → ForgotPassword
/update-password           → UpdatePassword
/settings                  → Settings (profile & security)
*                          → NotFound (404)
```

### Reader Route (tanpa MainLayout)
```typescript
/series/:id/chapter/:chapterId  → ChapterReader
```


### Admin Routes (protected, dengan AdminLayout)
```typescript
/admin                               → Dashboard
/admin/novels                        → NovelList
/admin/novels/new                    → NovelForm (create)
/admin/novels/:id/edit               → NovelForm (edit)
/admin/novels/:novelId/chapters      → ChapterList
/admin/novels/:novelId/chapters/new  → ChapterForm (create)
/admin/novels/:novelId/chapters/:chapterId/edit → ChapterForm (edit)
/admin/users                         → UserList
/admin/genres                        → GenresList
/admin/announcements                 → AnnouncementsList
/admin/reports/comments              → CommentReports
/admin/reports/chapters              → ChapterReports
/admin/activity                      → Activity (comment activity)
/admin/logs                          → AdminLogs (audit log)
```

**Protection:**
- Admin routes wrapped dengan `<AdminRoute />` component
- Requires user dengan role `admin` atau `moderator`
- Redirects ke `/login` jika not authenticated
- Redirects ke `/` jika authenticated tapi not admin/moderator

---

## 📦 State Management

### React Query (TanStack Query)
**Usage:** Server state management & caching

**Common Patterns:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['novels'],
  queryFn: async () => {
    const { data } = await supabase.from('novels').select('*');
    return data;
  }
});

// Mutate data
const mutation = useMutation({
  mutationFn: async (novel) => {
    const { data } = await supabase.from('novels').insert(novel);
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['novels']);
  }
});
```

**Query Keys Convention:**
```typescript
['novels']                    // All novels
['novels', id]                // Single novel
['chapters', novelId]         // Chapters for a novel
['comments', entityId]        // Comments for entity
['bookmarks', userId]         // User's bookmarks
['notifications', userId]     // User's notifications
```


### React Context
**Contexts in Project:**

1. **AuthContext** (`src/components/auth/AuthProvider.tsx`)
   - User authentication state
   - Profile data (username, role, avatar, etc.)
   - Auth loading state

2. **LanguageContext** (`src/contexts/LanguageContext.tsx`)
   - Language filter (id/en)
   - UI translation function
   - Persists to localStorage

3. **ThemeContext** (`src/components/ThemeProvider.tsx`)
   - Theme mode (light/dark/system)
   - Theme toggle function

### Local Storage Keys
```typescript
'vite-ui-theme'           // Theme preference
'languageFilter'          // Language preference (id | en)
'readerSettings'          // Reader customization
'supabase.auth.token'     // Supabase auth token (auto-managed)
```

---

## 🧪 Testing

### Test Framework
- **Vitest** - Test runner
- **@testing-library/react** - Component testing
- **jsdom** - DOM simulation

**Scripts:**
```bash
npm run test        # Run tests once
npm run test:watch  # Watch mode
```

**Test Files:** `src/test/`
- `setup.ts` - Test environment configuration
- `example.test.ts` - Example test

---

## 🚀 Build & Deployment

### Development
```bash
npm run dev
# Runs: concurrently "tsx server.ts" "vite"
# Server: http://localhost:5173
```

### Production Build
```bash
npm run build
# Output: dist/
```

### Build Modes
```bash
npm run build:dev       # Development build
npm run build:analyze   # Bundle analysis
```


### Environment Variables

**Required Variables:** (`.env` file)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Validation:** `src/lib/env.ts` validates env vars dengan Zod schema

### Deployment (Vercel)
- **Platform:** Vercel
- **Auto-deploy:** Connected to GitHub repo
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Set di Vercel dashboard

**PWA Support:**
- Configured via `vite-plugin-pwa`
- Manifest: Auto-generated
- Service Worker: Auto-registered
- Icons: `public/pwa-192x192.png`, `public/pwa-512x512.png`

---

## 🎯 Common Development Patterns

### 1. Creating a New Page

```typescript
// src/pages/MyPage.tsx
import { useAuth } from '@/components/auth/AuthProvider';

const MyPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container py-8">
      <h1>My Page</h1>
    </div>
  );
};

export default MyPage;
```

**Add to Router:** `src/App.tsx`
```typescript
const MyPage = lazy(() => import("./pages/MyPage"));

<Route path="/my-page" element={<MyPage />} />
```

### 2. Fetching Data with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MyComponent = () => {
  const { data: novels, isLoading } = useQuery({
    queryKey: ['novels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .eq('published', true);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Render novels */}</div>;
};
```


### 3. Creating/Updating Data with Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MyForm = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const { data, error } = await supabase
        .from('novels')
        .insert(formData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['novels']);
      toast.success('Novel created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create novel');
      console.error(error);
    }
  });

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
};
```

### 4. Using Translations

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const MyComponent = () => {
  const { t, language } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>Current language: {language}</p>
    </div>
  );
};
```

### 5. Protected Component (Role-based)

```typescript
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

const AdminOnlyComponent = () => {
  const { user, profile } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return <Navigate to="/" />;
  }
  
  return <div>Admin Content</div>;
};
```


### 6. Image Upload with UploadThing

```typescript
import { useUploadThing } from '@/utils/uploadthing';
import { useState } from 'react';

const ImageUploadComponent = () => {
  const [imageUrl, setImageUrl] = useState('');
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const result = await startUpload(Array.from(files));
    if (result?.[0]?.url) {
      setImageUrl(result[0].url);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={isUploading} />
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
};
```

### 7. Real-time Subscriptions

```typescript
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const RealtimeComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return <div>{/* Render notifications */}</div>;
};
```

### 8. Markdown Rendering

```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownContent = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose dark:prose-invert max-w-none"
    >
      {content}
    </ReactMarkdown>
  );
};
```


---

## 🔒 Security & Permissions

### Row Level Security (RLS)
Supabase RLS policies enforce data access control:

**Example Policies:**
```sql
-- Profiles: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Chapters: Only published chapters visible to public
CREATE POLICY "Published chapters are viewable by all"
ON chapters FOR SELECT
USING (published = true OR auth.role() = 'admin');

-- Comments: Users can only edit/delete own comments
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);
```

### Admin Authorization
**Check:** `src/components/auth/AdminRoute.tsx`

```typescript
// Only allows admin & moderator roles
const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';
if (!isAdmin) return <Navigate to="/" />;
```

### Authentication Flow
1. User signs up/in via Supabase Auth
2. Profile created automatically via database trigger
3. Default role: `user`
4. Session stored in localStorage
5. AuthProvider manages auth state globally
6. Protected routes check auth state

---

## 📊 Performance Optimizations

### Code Splitting
- Lazy loading untuk semua pages dengan `React.lazy()`
- Suspense fallback untuk loading states
- Dynamic imports untuk heavy components

### Image Optimization
- UploadThing handles image processing
- WebP format untuk cover images
- Lazy loading images dengan native `loading="lazy"`

### Query Optimization
- React Query caching dengan stale time
- Pagination untuk large datasets
- Select only needed columns di Supabase queries
- Index optimization di database

### Bundle Analysis
```bash
npm run build:analyze
# Opens bundle visualizer
```


---

## 🐛 Common Issues & Solutions

### 1. Environment Variables Not Loading
**Problem:** `VITE_SUPABASE_URL` is undefined  
**Solution:**
- Ensure `.env` file exists di root directory
- Prefix environment variables dengan `VITE_`
- Restart dev server setelah menambah/ubah env vars

### 2. Supabase Auth Session Issues
**Problem:** User logged out unexpectedly  
**Solution:**
- Check browser localStorage for `supabase.auth.token`
- Verify Supabase project URL & keys correct
- Ensure auth session refresh enabled di client config

### 3. Image Upload Failing
**Problem:** UploadThing returns 403/404 error  
**Solution:**
- Verify UploadThing API key configured
- Check file size < 4MB
- Ensure file type is image/*
- Check network tab untuk error details

### 4. Real-time Subscriptions Not Working
**Problem:** Notifications not appearing instantly  
**Solution:**
- Verify Realtime enabled di Supabase project
- Check RLS policies allow read access
- Ensure channel subscription active
- Check browser console untuk subscription errors

### 5. Admin Routes Not Accessible
**Problem:** Redirected to homepage when accessing `/admin`  
**Solution:**
- Check user's role in `profiles` table
- Role must be `admin` or `moderator`
- Clear auth cache & re-login
- Verify AdminRoute component logic

### 6. Markdown Not Rendering Properly
**Problem:** Markdown shows as plain text  
**Solution:**
- Import ReactMarkdown & remarkGfm correctly
- Add prose classes untuk styling
- Check content stored as text di database (bukan HTML)


---

## 🎓 Development Guidelines

### Code Style
- **TypeScript:** Strict mode enabled
- **ESLint:** Configured dengan React & SonarJS rules
- **Naming Conventions:**
  - Components: PascalCase (`MyComponent.tsx`)
  - Utilities: camelCase (`myFunction.ts`)
  - Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
  - CSS Classes: kebab-case (Tailwind utilities)

### Component Structure
```typescript
// Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

// Types/Interfaces
interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

// Component
const MyComponent = ({ title, onSave }: MyComponentProps) => {
  // Hooks
  const [state, setState] = useState(false);
  const { data } = useQuery({ ... });
  
  // Event Handlers
  const handleClick = () => {
    // Logic
  };
  
  // Early Returns
  if (!data) return <Loading />;
  
  // Main Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Git Workflow
- **Main Branch:** `main` (production-ready)
- **Feature Branches:** `feature/feature-name`
- **Commit Messages:** Conventional commits format
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation
  - `style:` Formatting
  - `refactor:` Code restructuring
  - `test:` Tests
  - `chore:` Maintenance


### Database Migrations
- Migrations managed via Supabase Dashboard
- **Best Practice:** Test migrations di development project first
- Always backup before major schema changes
- Use transactions untuk multi-step migrations

### Error Handling
```typescript
// Good: Specific error handling
try {
  const { data, error } = await supabase.from('novels').select('*');
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Failed to fetch novels:', error);
  toast.error('Unable to load novels');
  return [];
}

// Good: Query error handling
const { data, isError, error } = useQuery({
  queryKey: ['novels'],
  queryFn: fetchNovels,
  onError: (err) => {
    toast.error('Failed to load data');
  }
});
```

### Performance Tips
1. **Memoization:** Use `useMemo` & `useCallback` untuk expensive computations
2. **Virtualization:** Consider react-window untuk long lists
3. **Debouncing:** Debounce search inputs dengan lodash or custom hook
4. **Image Loading:** Use loading="lazy" & proper image sizes
5. **Query Caching:** Set appropriate staleTime di React Query

---

## 📚 Key Dependencies Deep Dive

### React Router DOM v6
**Key Features Used:**
- `BrowserRouter` - HTML5 history API routing
- `Routes` & `Route` - Route configuration
- `Outlet` - Nested route rendering (layouts)
- `Navigate` - Programmatic redirects
- `useNavigate()` - Navigation hook
- `useParams()` - URL params access
- `useLocation()` - Current location access

**Example:**
```typescript
import { useNavigate, useParams } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const handleClick = () => {
    navigate(`/series/${id}`);
  };
};
```


### TanStack Query (React Query) v5
**Key Features Used:**
- `useQuery` - Data fetching dengan caching
- `useMutation` - Data mutations
- `useQueryClient` - Cache management
- `QueryClientProvider` - Global provider
- Query invalidation & refetching
- Optimistic updates
- Loading & error states

**Advanced Patterns:**
```typescript
// Dependent queries
const { data: novel } = useQuery({
  queryKey: ['novels', novelId],
  queryFn: () => fetchNovel(novelId)
});

const { data: chapters } = useQuery({
  queryKey: ['chapters', novelId],
  queryFn: () => fetchChapters(novelId),
  enabled: !!novel  // Only run when novel exists
});

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateBookmark,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['bookmarks']);
    const previous = queryClient.getQueryData(['bookmarks']);
    queryClient.setQueryData(['bookmarks'], (old) => [...old, newData]);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['bookmarks'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['bookmarks']);
  }
});
```

### Framer Motion v12
**Key Features Used:**
- `motion` components untuk animations
- `AnimatePresence` untuk enter/exit animations
- Gesture animations (hover, tap, drag)
- Layout animations
- Scroll-based animations

**Example:**
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```


### Tailwind CSS v3
**Custom Configuration:**
- Extended color palette
- Custom animations
- Typography plugin (@tailwindcss/typography)
- Container queries
- Dark mode class-based

**Common Utility Patterns:**
```css
/* Layout */
.container mx-auto px-4
.flex items-center justify-between
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

/* Responsive */
.hidden md:block
.text-sm md:text-base lg:text-lg

/* Dark Mode */
.bg-white dark:bg-gray-900
.text-gray-900 dark:text-gray-100

/* Prose (Markdown) */
.prose dark:prose-invert max-w-none
```

### Zod v3
**Key Features Used:**
- Schema validation
- Type inference
- Error handling
- Environment variable validation

**Example:**
```typescript
import { z } from 'zod';

const novelSchema = z.object({
  title: z.string().min(1, 'Title required'),
  author: z.string().min(1, 'Author required'),
  description: z.string().optional(),
  published: z.boolean().default(false)
});

type Novel = z.infer<typeof novelSchema>;

// Validation
const result = novelSchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.errors);
}
```

### React Hook Form v7
**Key Features Used:**
- Form state management
- Validation dengan Zod resolver
- Error handling
- Optimized re-renders

**Example:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(novelSchema),
    defaultValues: {
      title: '',
      author: ''
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} />
      {form.formState.errors.title && (
        <span>{form.formState.errors.title.message}</span>
      )}
    </form>
  );
};
```


---

## 🔄 Data Flow Examples

### 1. User Registration Flow
```
1. User fills register form → /register
2. Form validation dengan Zod schema
3. Submit → supabase.auth.signUp({ email, password, metadata })
4. Supabase sends verification email
5. Database trigger creates profile record (default role: user)
6. Redirect to login page dengan success toast
7. User verifies email → activates account
```

### 2. Novel Reading Flow
```
1. User browses catalog → /series
2. Clicks novel → /series/:id (Novel Detail)
3. Clicks "Read Now" or chapter → /series/:id/chapter/:chapterId
4. Chapter loads:
   - Fetch chapter content
   - Fetch novel data
   - Create/update reading_history record
   - Increment chapter view_count
5. User customizes reader settings (saved to localStorage)
6. Navigate prev/next chapters
7. Exit reader → returns to novel detail with "Continue Reading" button
```

### 3. Comment Creation Flow
```
1. User types comment → CommentsSection component
2. Submit → Check authentication
3. Insert comment to database:
   - Supabase insert to comments table
   - Returns comment with user profile joined
4. If reply:
   - Set parent_id
   - Notify parent comment author via notifications table
   - Supabase Realtime pushes notification to parent author
5. Optimistic update UI (before confirmation)
6. React Query invalidates & refetches comments
7. Comment appears in list with user avatar & badge
```

### 4. Admin Chapter Creation Flow
```
1. Admin navigates to /admin/novels/:novelId/chapters/new
2. Fills ChapterForm:
   - Chapter number (auto-suggested)
   - Title
   - Content (Markdown editor)
   - Language selection (id/en)
   - Published toggle
3. Optional: Upload images via inline uploader
4. Preview tab shows rendered Markdown
5. Submit:
   - Validate form data
   - Insert to chapters table
   - Log action to admin_logs
   - Invalidate chapter queries
6. Redirect to chapter list dengan success toast
```


### 5. Notification Real-time Flow
```
1. Action occurs (e.g., comment reply created)
2. Backend creates notification record in notifications table
3. Supabase Realtime detects INSERT event
4. Pushes notification via WebSocket to subscribed client
5. NotificationDropdown component receives payload
6. Updates local state → shows red badge on bell icon
7. User clicks bell → dropdown shows notification list
8. User clicks notification:
   - Marks as read (UPDATE read = true)
   - Navigates to linked page (e.g., chapter with new reply)
```

### 6. Badge Calculation Flow
```
1. User reads chapters → reading_history records created
2. Profile page/modal queries user's total chapters read
3. Pass chapter count to getBadgeStageInfo(chapterCount)
4. Function returns:
   - Current badge tier (e.g., Martial Master)
   - Current stage within tier (e.g., 5th Star)
   - Progress to next stage (e.g., 70%)
   - Chapters needed for next stage
   - Style object (colors, gradients, glows)
5. UserBadge component renders badge with:
   - Background gradient
   - Border color
   - Glow effect (CSS box-shadow)
   - Stage label (e.g., "5⭐")
   - Tier name
6. Tooltip shows detailed progression stats
```

---

## 🎨 Design System Details

### Color Palette
**Primary Colors:**
```css
--primary: 222.2 47.4% 11.2%        /* Dark blue-gray */
--primary-foreground: 210 40% 98%   /* Light text */
--secondary: 210 40% 96.1%          /* Light gray */
--accent: 210 40% 96.1%             /* Highlight */
--destructive: 0 84.2% 60.2%        /* Red for errors */
--success: 142 76% 36%              /* Green for success */
```

**Semantic Colors:**
```css
--background: 0 0% 100%     /* Page background */
--foreground: 222.2 84% 4.9%  /* Primary text */
--card: 0 0% 100%           /* Card background */
--muted: 210 40% 96.1%      /* Muted text/bg */
--border: 214.3 31.8% 91.4%  /* Border color */
```

### Typography
**Font Family:**
- Primary: Plus Jakarta Sans (imported from @fontsource)
- Fallback: system-ui, sans-serif
- Code: Menlo, Monaco, monospace

**Font Sizes:**
```css
text-xs    → 0.75rem (12px)
text-sm    → 0.875rem (14px)
text-base  → 1rem (16px)
text-lg    → 1.125rem (18px)
text-xl    → 1.25rem (20px)
text-2xl   → 1.5rem (24px)
text-3xl   → 1.875rem (30px)
text-4xl   → 2.25rem (36px)
```


### Spacing Scale
```css
0  → 0
1  → 0.25rem (4px)
2  → 0.5rem (8px)
3  → 0.75rem (12px)
4  → 1rem (16px)
6  → 1.5rem (24px)
8  → 2rem (32px)
12 → 3rem (48px)
16 → 4rem (64px)
```

### Breakpoints
```css
sm  → 640px
md  → 768px
lg  → 1024px
xl  → 1280px
2xl → 1536px
```

**Usage:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Shadows
```css
shadow-sm  → 0 1px 2px rgba(0,0,0,0.05)
shadow     → 0 1px 3px rgba(0,0,0,0.1)
shadow-md  → 0 4px 6px rgba(0,0,0,0.1)
shadow-lg  → 0 10px 15px rgba(0,0,0,0.1)
shadow-xl  → 0 20px 25px rgba(0,0,0,0.1)
```

### Border Radius
```css
rounded-none → 0
rounded-sm   → 0.125rem (2px)
rounded      → 0.25rem (4px)
rounded-md   → 0.375rem (6px)
rounded-lg   → 0.5rem (8px)
rounded-xl   → 0.75rem (12px)
rounded-full → 9999px
```

### Custom Animations
```css
@keyframes accordion-down {
  from { height: 0 }
  to { height: var(--radix-accordion-content-height) }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height) }
  to { height: 0 }
}

.animate-accordion-down { animation: accordion-down 0.2s ease-out }
.animate-accordion-up { animation: accordion-up 0.2s ease-out }
```


---

## 🧩 Component Inventory

### Public Components

#### Navigation & Layout
- **Navbar** - Main navigation dengan search, language toggle, notifications
- **Footer** - Site footer dengan links & copyright
- **FloatingDockNavigation** - Mobile bottom navigation
- **ScrollButtons** - Scroll to top/bottom buttons
- **ScrollToTop** - Auto scroll to top on route change

#### Content Display
- **NovelCard** - Novel preview card untuk lists
- **HeroSection** - Homepage hero carousel dengan featured novels
- **TopSeriesSection** - Carousel untuk top-rated novels
- **NewReleasesSection** - Grid of newly updated novels
- **RecentUpdatesSection** - Latest chapter updates
- **PopularSection** - Most popular novels list
- **GenresSection** - Genre cards dengan hover effects
- **AnnouncementsSection** - Admin announcements display
- **RecentlyReadSection** - Continue reading section

#### User Interaction
- **CommentsSection** - Threaded comment system
- **UserProfileModal** - Public user profile modal
- **UserBadge** - Cultivation badge display
- **BadgeListModal** - Modal showing all badge tiers
- **NotificationDropdown** - Real-time notifications
- **ReaderSettings** - Chapter reader customization panel

#### Forms & Upload
- **ImageUpload** - UploadThing image uploader component
- **EpubImporter** - EPUB bulk import interface

#### UI Elements
- **ThemeToggle** - Theme switcher (Light/Dark/System)
- **SectionHeader** - Section title dengan subtitle
- **NavLink** - Navigation link dengan active state


### Admin Components

#### Dashboard
- **AdminSidebar** - Admin navigation sidebar
- **StatsCard** - Statistic display card dengan icon

#### Management
- Forms untuk CRUD operations (Novel, Chapter, Genre, etc.)
- Lists dengan pagination, search, filters
- Report review interfaces
- Activity monitoring components

### shadcn/ui Components (Base)
All located in `src/components/ui/`

**Form Components:**
- Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- Form (with react-hook-form integration)
- Label

**Layout Components:**
- Card, Separator, Scroll Area, Tabs, Accordion, Collapsible

**Overlay Components:**
- Dialog, Alert Dialog, Popover, Hover Card, Tooltip, Context Menu
- Dropdown Menu, Navigation Menu, Menubar

**Feedback Components:**
- Toast (Toaster component), Sonner (toast library)
- Alert, Badge, Progress, Skeleton

**Specialized:**
- Avatar, Calendar, Command (cmdk), Toggle, Aspect Ratio

---

## 📱 Responsive Design Strategy

### Mobile-First Approach
1. Design for mobile viewport first (320px+)
2. Add complexity for larger screens
3. Use Tailwind responsive prefixes (sm:, md:, lg:)

### Breakpoint Strategy
```typescript
// Mobile: < 768px
- Single column layouts
- Hamburger menu
- Floating dock navigation
- Simplified cards
- Stack elements vertically

// Tablet: 768px - 1024px
- 2-column grids
- Sidebar visible
- More spacing
- Hover states enabled

// Desktop: 1024px+
- 3+ column grids
- Full navigation
- Advanced interactions
- Follow cursor effect
- Enhanced animations
```


### Touch vs Mouse Interactions
```typescript
// Touch-optimized (Mobile)
- Larger tap targets (min 44x44px)
- No hover states
- Tap to toggle controls (reader mode)
- Swipe gestures (where applicable)
- No custom cursor effects

// Mouse-optimized (Desktop)
- Smaller clickable areas acceptable
- Hover effects & transitions
- Context menus
- Tooltips
- Follow cursor effect
- Precise interactions
```

### Responsive Components Examples
```typescript
// Navbar: Changes from mobile menu to full nav
<nav className="hidden md:flex">Desktop Nav</nav>
<Sheet>Mobile Menu Sheet</Sheet>

// Cards: Adjust columns by viewport
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

// Typography: Scale with viewport
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Spacing: Reduce on mobile
<div className="p-4 md:p-6 lg:p-8">
```

---

## 🔐 Authentication Deep Dive

### Supabase Auth Configuration
**File:** `src/integrations/supabase/client.ts`

```typescript
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,           // Store session in localStorage
    persistSession: true,             // Persist across page reloads
    autoRefreshToken: true,           // Auto refresh expired tokens
  }
});
```

### Auth Flow Details

#### Sign Up Flow
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'username'  // Saved to auth.users.raw_user_meta_data
    }
  }
});

// Database trigger automatically creates profile record
// Default role: 'user'
// Email verification sent automatically
```


#### Sign In Flow
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// On success:
// - Session stored in localStorage
// - User data available via supabase.auth.getUser()
// - AuthProvider updates context
// - App re-renders with authenticated state
```

#### Google OAuth Flow
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
});

// Process:
// 1. Redirects to Google OAuth
// 2. User authorizes
// 3. Redirects back to app
// 4. Supabase exchanges token
// 5. Session created
// 6. Profile auto-created if first time
```

#### Password Reset Flow
```typescript
// Step 1: Request reset email
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/update-password`
});

// Step 2: User clicks email link → redirected to /update-password

// Step 3: Update password
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

#### Session Management
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  }
  if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
  if (event === 'TOKEN_REFRESHED') {
    // Handle token refresh
  }
});

// Sign out
await supabase.auth.signOut();
```


### AuthProvider Context
**File:** `src/components/auth/AuthProvider.tsx`

```typescript
interface AuthContextType {
  user: User | null;           // Supabase auth user
  profile: Profile | null;     // Extended profile data
  loading: boolean;            // Auth loading state
}

const { user, profile, loading } = useAuth();

// profile contains:
// - username, bio, avatar_url
// - role (user | moderator | admin)
// - created_at, etc.
```

### Protected Routes Implementation

#### ProtectedRoute (requires authentication)
```typescript
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <Outlet />;  // Render child routes
};
```

#### AdminRoute (requires admin/moderator role)
```typescript
const AdminRoute = () => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';
  if (!isAdmin) return <Navigate to="/" />;
  
  return <Outlet />;
};
```

---

## 🌐 Internationalization (i18n) System

### Translation Structure
**File:** `src/i18n/translations.ts`

```typescript
export type Language = "id" | "en";

export const translations: Translations = {
  id: {
    "nav.home": "Beranda",
    "nav.series": "Seri",
    // ... 200+ translation keys
  },
  en: {
    "nav.home": "Home",
    "nav.series": "Series",
    // ... 200+ translation keys
  }
};
```

### Translation Categories
1. **Navigation:** nav.*
2. **Index/Home:** index.*, hero.*, popular.*, etc.
3. **Pages:** catalog.*, bookmarks.*, rankings.*, etc.
4. **Novel Detail:** novelDetail.*
5. **Reader:** reader.*
6. **Auth:** login.*, register.*, forgot.*, security.*
7. **Settings:** settings.*, profile.*
8. **Admin:** (handled separately, not in i18n)
9. **Footer:** footer.*
10. **Common:** common.*


### Usage Pattern
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const MyComponent = () => {
  const { t, language, setLanguageFilter } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button onClick={() => setLanguageFilter(language === 'id' ? 'en' : 'id')}>
        {language === 'id' ? '🇺🇸' : '🇮🇩'}
      </button>
    </div>
  );
};
```

### Adding New Translations
1. Add key to both `id` and `en` objects in `translations.ts`
2. Use descriptive, hierarchical keys (e.g., `section.subsection.key`)
3. Keep translations concise & natural
4. Test both languages

**Example:**
```typescript
// Add to translations.ts
id: {
  "myFeature.title": "Judul Fitur",
  "myFeature.description": "Deskripsi fitur"
},
en: {
  "myFeature.title": "Feature Title",
  "myFeature.description": "Feature description"
}

// Use in component
<h1>{t('myFeature.title')}</h1>
<p>{t('myFeature.description')}</p>
```

---

## 💾 LocalStorage Usage

### Keys & Data Stored

#### 1. Theme Preference
```typescript
Key: "vite-ui-theme"
Value: "light" | "dark" | "system"
Purpose: Persist theme selection
Location: ThemeProvider
```

#### 2. Language Filter
```typescript
Key: "languageFilter"
Value: "id" | "en"
Purpose: Persist chapter language preference
Location: LanguageContext
```

#### 3. Reader Settings
```typescript
Key: "readerSettings"
Value: JSON string
Structure: {
  fontSize: "sm" | "base" | "lg" | "xl",
  fontFamily: "serif" | "sans",
  theme: "light" | "sepia" | "dark"
}
Purpose: Persist reader customization
Location: ChapterReader component
```

#### 4. Supabase Auth Token
```typescript
Key: "supabase.auth.token" (auto-managed)
Value: JWT token & session data
Purpose: Persist authentication session
Location: Supabase client (automatic)
```


### localStorage Helper Functions
```typescript
// Save to localStorage
const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Load from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Remove from localStorage
const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};
```

---

## 🎯 Future Enhancement Ideas

### Planned/Potential Features
(Not yet implemented - reference untuk development selanjutnya)

1. **Advanced Search:**
   - Full-text search across novels & chapters
   - Filters: author, status, year, tags
   - Search history
   - Autocomplete suggestions

2. **Reading Lists:**
   - Create custom reading lists
   - Public/private lists
   - Share lists dengan link

3. **Social Features:**
   - User following system
   - Activity feed
   - Novel recommendations based on friends
   - Reading challenges & achievements

4. **Enhanced Reader:**
   - Text-to-speech
   - Highlight & note-taking
   - Dictionary integration
   - Translation hover (for Chinese terms)
   - Reading statistics (time, speed)

5. **Mobile App:**
   - Native iOS/Android apps
   - Offline reading
   - Push notifications
   - Background downloading


6. **Admin Improvements:**
   - Bulk operations (delete, publish multiple)
   - Advanced analytics dashboard
   - User permissions system (granular)
   - Content scheduling
   - Auto-translation integration

7. **Content Discovery:**
   - Personalized recommendations
   - Similar novels suggestion
   - Genre-based filtering improvements
   - Trending novels (time-based)
   - Award/badge system untuk novels

8. **Community:**
   - Forums/discussion boards
   - User reviews (separate from ratings)
   - Fan art gallery
   - Character wikis
   - Novel quizzes

---

## 📞 Support & Resources

### Documentation
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **Supabase:** https://supabase.com/docs
- **React Query:** https://tanstack.com/query/latest
- **React Router:** https://reactrouter.com/
- **Framer Motion:** https://www.framer.com/motion/

### Community & Help
- **GitHub Issues:** Report bugs & request features
- **Discord/Slack:** (if available for team communication)
- **Stack Overflow:** Tag with relevant technologies

### Development Tools Recommended
- **VS Code:** Primary IDE
  - Extensions: ESLint, Prettier, Tailwind CSS IntelliSense, ES7+ React/Redux snippets
- **Browser DevTools:** Chrome/Firefox Developer Tools
- **React DevTools:** Browser extension
- **Supabase Studio:** Database management
- **Postman/Insomnia:** API testing (if needed)

---

## 🏁 Quick Start Checklist

### For New Developers
- [ ] Clone repository
- [ ] Install Node.js (v18+)
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Get Supabase credentials & add to `.env`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Review this AGENT.md file
- [ ] Explore key files: App.tsx, main.tsx, AuthProvider.tsx
- [ ] Test login flow
- [ ] Read a chapter to understand user experience
- [ ] Access `/admin` (need admin role in database)


### For AI Agents Working on This Project

**When Making Changes:**
1. **Understand Context:** Read relevant sections of this doc before coding
2. **Check Existing Patterns:** Follow established code patterns & conventions
3. **Verify Types:** Ensure TypeScript types are correct
4. **Test Locally:** Run dev server & test changes
5. **Consider i18n:** Add translations untuk both languages if adding UI text
6. **Update Docs:** Update this AGENT.md if adding major features

**Common Tasks:**
- **Add New Page:** Create component → Add to App.tsx routes → Test navigation
- **Add Database Table:** Design schema → Create in Supabase → Update types.ts → Add RLS policies
- **Add UI Component:** Create component → Add to components/ → Use shadcn/ui primitives
- **Add Feature:** Plan data flow → Implement backend (Supabase) → Implement frontend → Test → Document

**Before Committing:**
- [ ] Code follows TypeScript strict mode
- [ ] No ESLint errors
- [ ] All imports resolved
- [ ] Responsive design works (test mobile/tablet/desktop)
- [ ] Dark mode works correctly
- [ ] Both languages work (if UI text added)
- [ ] No console errors
- [ ] Performance acceptable (no unnecessary re-renders)

---

## 🎬 Conclusion

Celestial Scrolls adalah platform novel web yang comprehensive dengan fitur-fitur modern:
- **User Experience:** Reading experience yang customizable, gamifikasi dengan badge system, notifikasi real-time
- **Content Management:** Admin dashboard lengkap dengan EPUB import, Markdown editor, audit logging
- **Technical Excellence:** Modern React stack, TypeScript, Supabase backend, responsive design
- **Scalability:** Modular architecture, efficient state management, optimized performance

Platform ini dirancang untuk memberikan pengalaman membaca yang optimal sambil menyediakan tools yang powerful untuk content management.

**Key Strengths:**
✅ Modern tech stack dengan best practices  
✅ Comprehensive feature set (reader, admin, social)  
✅ Real-time capabilities (notifications, subscriptions)  
✅ Multi-language content support  
✅ Gamification yang engaging (badge system)  
✅ Responsive & accessible design  
✅ Well-structured & maintainable codebase  

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-01  
**Maintained By:** Development Team  
**For Questions:** Contact project maintainer

