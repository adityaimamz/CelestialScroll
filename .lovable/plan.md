

# Rencana Implementasi: Admin Dashboard & Login System

## Ringkasan
Membuat sistem autentikasi lengkap dengan halaman login (email/password & Google OAuth), halaman register, dan admin dashboard dengan fitur manajemen novel, chapter, user, serta statistik.

---

## 1. Setup Backend dengan Lovable Cloud

### Database Schema

**Tabel `profiles`** - Data profil user
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (FK → auth.users) | Primary key |
| username | text | Nama tampilan |
| avatar_url | text | URL foto profil |
| bio | text | Bio singkat |
| created_at | timestamp | Waktu registrasi |
| updated_at | timestamp | Waktu update terakhir |

**Tabel `user_roles`** - Role user (terpisah untuk keamanan)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| user_id | UUID (FK → auth.users) | Referensi user |
| role | app_role enum | admin, moderator, user |

**Tabel `novels`** - Data novel
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| title | text | Judul novel |
| slug | text | URL-friendly identifier |
| cover_url | text | Cover image |
| description | text | Sinopsis |
| author | text | Penulis asli |
| status | text | ongoing/completed |
| genres | text[] | Array genre |
| views | integer | Total views |
| rating | decimal | Rating rata-rata |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu update |

**Tabel `chapters`** - Chapter novel
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| novel_id | UUID (FK → novels) | Referensi novel |
| chapter_number | integer | Nomor chapter |
| title | text | Judul chapter |
| content | text | Isi chapter |
| published_at | timestamp | Waktu publish |
| created_at | timestamp | Waktu dibuat |

### Row Level Security (RLS)
- `profiles`: User hanya bisa read/update profile sendiri
- `user_roles`: Hanya admin yang bisa manage roles (via security definer function)
- `novels`: Public read, admin/moderator bisa CRUD
- `chapters`: Public read, admin/moderator bisa CRUD

---

## 2. Halaman Authentication

### Login Page (`/login`)
- Form email & password
- Tombol "Sign in with Google" 
- Link ke halaman register
- Redirect ke homepage setelah login sukses
- Admin redirect ke `/admin` jika role = admin

### Register Page (`/register`)
- Form email, password, konfirmasi password
- Input username
- Auto-create profile via database trigger
- Default role: user

### Auth Components
- `AuthProvider` context untuk state management
- `ProtectedRoute` component untuk route yang butuh login
- `AdminRoute` component untuk route admin only

---

## 3. Admin Dashboard

### Layout Admin (`/admin/*`)
Layout khusus dengan sidebar navigation, berbeda dari MainLayout untuk user biasa.

```text
┌─────────────────────────────────────────────────┐
│  Logo    Admin Dashboard           [User Menu]  │
├────────┬────────────────────────────────────────┤
│        │                                        │
│ Menu   │  Content Area                          │
│        │                                        │
│ ├ Dashboard                                     │
│ ├ Novels                                        │
│ ├ Chapters                                      │
│ ├ Users                                         │
│ └ Settings                                      │
│        │                                        │
└────────┴────────────────────────────────────────┘
```

### Halaman Admin

**Dashboard Overview (`/admin`)**
- Cards statistik: Total novels, chapters, users, views
- Grafik views per hari (7 hari terakhir)
- Novel terpopuler
- User baru terdaftar

**Manage Novels (`/admin/novels`)**
- Tabel daftar novel dengan search & filter
- Tombol Add Novel → Dialog/Page form
- Action: Edit, Delete, View chapters

**Add/Edit Novel (`/admin/novels/new`, `/admin/novels/:id/edit`)**
- Form: Title, description, cover upload, author, status, genres
- Image upload ke Supabase Storage

**Manage Chapters (`/admin/novels/:id/chapters`)**
- Tabel chapters untuk novel tertentu
- Add, Edit, Delete, Reorder chapters

**Add/Edit Chapter (`/admin/chapters/new`, `/admin/chapters/:id/edit`)**
- Form: Title, chapter number, content (rich text editor)

**Manage Users (`/admin/users`)**
- Tabel user dengan search
- Kolom: Avatar, Username, Email, Role, Status, Joined
- Action: Change role, Ban/Unban

---

## 4. Struktur File Baru

```text
src/
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Auth context & provider
│   │   ├── ProtectedRoute.tsx    # Route guard untuk login
│   │   ├── AdminRoute.tsx        # Route guard untuk admin
│   │   └── LoginForm.tsx         # Reusable login form
│   ├── admin/
│   │   ├── AdminSidebar.tsx      # Sidebar navigasi admin
│   │   ├── StatsCard.tsx         # Card statistik
│   │   ├── NovelForm.tsx         # Form novel
│   │   ├── ChapterForm.tsx       # Form chapter
│   │   └── DataTable.tsx         # Reusable data table
│   └── layout/
│       └── AdminLayout.tsx       # Layout untuk admin pages
├── hooks/
│   ├── useAuth.ts               # Hook untuk auth state
│   └── useAdmin.ts              # Hook untuk admin operations
├── lib/
│   └── supabase.ts              # Supabase client setup
├── pages/
│   ├── auth/
│   │   ├── Login.tsx            # Halaman login
│   │   └── Register.tsx         # Halaman register
│   └── admin/
│       ├── Dashboard.tsx        # Admin dashboard overview
│       ├── NovelList.tsx        # Daftar novel
│       ├── NovelForm.tsx        # Add/Edit novel
│       ├── ChapterList.tsx      # Daftar chapter
│       ├── ChapterForm.tsx      # Add/Edit chapter
│       └── UserList.tsx         # Daftar user
```

---

## 5. Routing Update

```typescript
// Struktur route baru di App.tsx
<Routes>
  {/* Public Routes */}
  <Route element={<MainLayout />}>
    <Route path="/" element={<Index />} />
    <Route path="/series" element={<Catalog />} />
    <Route path="/series/:id" element={<NovelDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
  
  {/* Reader Route */}
  <Route path="/series/:id/chapter/:chapterId" element={<ChapterReader />} />
  
  {/* Admin Routes - Protected */}
  <Route element={<AdminRoute />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/novels" element={<NovelList />} />
      <Route path="/admin/novels/new" element={<NovelForm />} />
      <Route path="/admin/novels/:id/edit" element={<NovelForm />} />
      <Route path="/admin/novels/:id/chapters" element={<ChapterList />} />
      <Route path="/admin/chapters/new" element={<ChapterForm />} />
      <Route path="/admin/chapters/:id/edit" element={<ChapterForm />} />
      <Route path="/admin/users" element={<UserList />} />
    </Route>
  </Route>
</Routes>
```

---

## 6. Langkah Implementasi

| No | Langkah | Keterangan |
|----|---------|------------|
| 1 | Setup Lovable Cloud | Koneksi database untuk backend |
| 2 | Buat tabel database | profiles, user_roles, novels, chapters dengan RLS |
| 3 | Setup Supabase auth | Email/password + Google OAuth config |
| 4 | Buat AuthProvider | Context untuk auth state management |
| 5 | Halaman Login & Register | UI dengan form validation |
| 6 | Route guards | ProtectedRoute & AdminRoute components |
| 7 | Admin Layout | Sidebar + content area |
| 8 | Dashboard page | Statistik cards + charts |
| 9 | Novel CRUD | List, add, edit, delete novels |
| 10 | Chapter CRUD | List, add, edit, delete chapters |
| 11 | User management | List users, change roles |
| 12 | Testing end-to-end | Verifikasi semua flow |

---

## 7. Catatan Teknis

### Google OAuth Setup
Untuk Google login, Anda perlu:
1. Buat project di Google Cloud Console
2. Setup OAuth consent screen
3. Buat OAuth credentials (Client ID & Secret)
4. Input credentials di Supabase Dashboard > Authentication > Providers > Google

### Security
- Roles disimpan di tabel terpisah (bukan di profiles) untuk mencegah privilege escalation
- Gunakan security definer function untuk check roles
- RLS policies untuk semua tabel
- Admin check dilakukan server-side via Supabase

