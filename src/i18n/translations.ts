export type Language = "id" | "en";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  id: {
    // Navbar
    "nav.home": "Beranda",
    "nav.series": "Seri",
    "nav.bookmarks": "Bookmark",
    "nav.genres": "Genre",
    "nav.request": "Request",
    "nav.search": "Cari novel...",
    "nav.noResults": "Tidak ditemukan.",
    "nav.chapters": "Chapter",
    "nav.signIn": "Login",
    "nav.signUp": "Daftar",
    "nav.settings": "Pengaturan",
    "nav.admin": "Dashboard Admin",
    "nav.logout": "Keluar",

    // Index Page
    "index.language.all": "Semua",
    "index.language.id": "Indonesia",
    "index.language.en": "Inggris",

    // Hero
    "hero.rating": "Rating",
    "hero.startReading": "Mulai Baca",

    // New Releases
    "newReleases.title": "Rilisan Baru",
    "newReleases.subtitle": "Novel yang baru diupdate",

    // Popular
    "popular.title": "Seri Populer",
    "popular.ranking": "#1 POPULER",
    "popular.chapters": "Chapter",
    "popular.views": "dibaca",
    "popular.viewFull": "Lihat Ranking Lengkap",

    // Genres
    "genres.title": "Genre Populer",
    "genres.subtitle": "Cari cerita berdasarkan genre",
    "genres.noNovels": "Belum ada novel di genre ini.",

    // Top Series
    "topSeries.title": "Seri Teratas",
    "topSeries.subtitle": "Seri dengan rating tertinggi",
    "topSeries.learnMore": "Lihat Detail",

    // Recent Updates
    "recent.title": "Update Terbaru",
    "recent.subtitle": "Chapter baru yang baru rilis",
    "recent.novel": "Novel",
    "recent.latestChapter": "Chapter Terbaru",
    "recent.author": "Penulis",
    "recent.updated": "Diperbarui",
    "recent.chapter": "Chapter",
    "recent.recently": "Baru saja",

    // Announcements
    "announcements.title": "Pengumuman",

    // Request
    "request.title": "Novel yang kamu cari tidak ada?",
    "request.subtitle":
      "Request novel favoritmu di sini, nanti kami coba tambahkan.",
    "request.button": "Request Novel",

    // Recently Read
    "recentlyRead.title": "Lanjutkan Membaca",
    "recentlyRead.chapter": "Chapter",
    "recentlyRead.lastRead": "Terakhir dibaca",
    "recentlyRead.continue": "Lanjut baca →",

    // Catalog
    "catalog.browse": "Jelajahi Seri",
    "catalog.archive": "Daftar",
    "catalog.search": "Cari seri...",
    "catalog.genre": "Genre",
    "catalog.sort": "Urutkan",
    "catalog.allSeries": "Semua Seri",
    "catalog.loadMore": "Muat lebih banyak",
    "catalog.noNovels": "Novel tidak ditemukan.",
    "catalog.clearFilters": "Hapus filter",

    // Rankings
    "rankings.title": "Seri Terpopuler",
    "rankings.subtitle": "Novel yang paling banyak dibaca di Celestial Scrolls",
    "rankings.loading": "Memuat ranking...",
    "rankings.leaderboard": "Ranking Lengkap",
    "rankings.rank": "Peringkat",
    "rankings.seriesTitle": "Judul",
    "rankings.chapters": "Chapter",
    "rankings.rating": "Rating",
    "rankings.totalViews": "Total Dibaca",

    // Bookmarks
    "bookmarks.timeAdded": "Waktu ditambahkan",
    "bookmarks.rating": "Rating",
    "bookmarks.latestChapter": "Chapter Terbaru",
    "bookmarks.loginRequired": "Perlu login",
    "bookmarks.loginMessage": "Login dulu untuk melihat bookmark kamu.",
    "bookmarks.title": "Bookmark",
    "bookmarks.savedSeries": "Seri Tersimpan",
    "bookmarks.previous": "Sebelumnya",
    "bookmarks.next": "Selanjutnya",
    "bookmarks.page": "Halaman",
    "bookmarks.of": "dari",
    "bookmarks.empty": "Belum ada bookmark.",
    "bookmarks.browse": "Jelajahi Seri",
    "bookmarks.ascending": "A-Z",
    "bookmarks.descending": "Z-A",

    // Genres Page
    "genresPage.title": "Genre Populer",
    "genresPage.subtitle":
      "Jelajahi koleksi novel berdasarkan genre dan temukan bacaan favoritmu berikutnya.",
    "genresPage.noGenres": "Genre tidak ditemukan.",
    "genresPage.noDescription": "Tidak ada deskripsi.",
    "genresPage.novels": "Novel",

    // Novel Detail
    "novelDetail.notFound": "Tidak ditemukan",
    "novelDetail.novelNotFound": "Novel tidak ditemukan",
    "novelDetail.unavailable": "Tidak tersedia",
    "novelDetail.notPublished": "Novel ini belum dipublikasikan.",
    "novelDetail.error": "Terjadi kesalahan",
    "novelDetail.loadError": "Gagal memuat detail novel",
    "novelDetail.removed": "Dihapus",
    "novelDetail.removedMessage": "Dihapus dari library kamu.",
    "novelDetail.added": "Ditambahkan",
    "novelDetail.addedMessage": "Ditambahkan ke library kamu.",
    "novelDetail.rated": "Rating tersimpan",
    "novelDetail.ratedMessage": "Rating kamu sudah dicatat",
    "novelDetail.stars": "bintang",
    "novelDetail.noChapters": "Belum ada Chapter",
    "novelDetail.noChaptersMessage": "Belum ada Chapter yang bisa dibaca.",
    "novelDetail.backToCatalog": "Kembali",
    "novelDetail.by": "Oleh",
    "novelDetail.unknown": "Unknown",
    "novelDetail.chaptersCount": "Chapter",
    "novelDetail.views": "dibaca",
    "novelDetail.bookmarksCount": "Bookmark",
    "novelDetail.readNow": "Mulai Baca",
    "novelDetail.continueChapter": "Lanjutkan",
    "novelDetail.saved": "Tersimpan",
    "novelDetail.addToLibrary": "Tambah ke Library",
    "novelDetail.about": "Tentang",
    "novelDetail.synopsis": "Sinopsis",
    "novelDetail.totalChapters": "Total",
    "novelDetail.searchChapter": "Cari chapter...",
    "novelDetail.oldestFirst": "Terawal",
    "novelDetail.newestFirst": "Terbaru",
    "novelDetail.noChaptersUploaded": "Belum ada chapter diunggah.",
    "novelDetail.noChaptersFound": "Chapter tidak ditemukan.",
    "novelDetail.draft": "Draft",
    "novelDetail.readBtn": "Baca",
    "novelDetail.chapter": "Chapter",
    "novelDetail.page": "Halaman",
    "novelDetail.of": "dari",
    "novelDetail.show": "Tampilkan",
    "novelDetail.goTo": "Ke halaman",

    // Reader
    "reader.novelNotFound": "Novel tidak ditemukan",
    "reader.notPublished": "Novel ini belum dipublikasikan.",
    "reader.chapterNotFound": "Chapter tidak ditemukan",
    "reader.loginRequired": "Login dulu untuk melapor.",
    "reader.emptyReason": "Masukkan detail laporan.",
    "reader.reportSubmitted": "Laporan terkirim!",
    "reader.reportThankYou": "Akan segera kami perbaiki.",
    "reader.reportFailed": "Gagal mengirim laporan.",
    "reader.home": "Beranda",
    "reader.backToSeries": "Kembali ke Seri",
    "reader.chapter": "Chapter",
    "reader.toc": "Daftar Isi",
    "reader.noContent": "Konten kosong.",
    "reader.reportIssue": "Ada typo? Laporkan",
    "reader.reportTitle": "Laporkan Terjemahan",
    "reader.reportDescription": "Bantu kami memperbaiki kualitas terjemahan.",
    "reader.reportDetailLabel": "Detail Laporan",
    "reader.reportPlaceholder":
      'Contoh: Paragraf 3, kata "Apple" seharusnya "Apel".',
    "reader.cancel": "Batal",
    "reader.submitReport": "Kirim Laporan",
    "reader.prev": "Sebelumnya",
    "reader.next": "Selanjutnya",

    // Not Found
    "notFound.title": "Ups! Halaman tidak ditemukan",
    "notFound.return": "Kembali ke Beranda",

    // Request Novel
    "requestPage.title": "Minta Novel",
    "requestPage.subtitle": "Tulis novel yang ingin kamu request di sini.",
    "requestPage.dmcaTitle": "Novelpia & DMCA",
    "requestPage.dmcaDesc1": "Kami tidak menerjemahkan novel dari ",
    "requestPage.dmcaDesc2": ", karena berisiko DMCA.",
    "requestPage.comments": "Komentar",

    // Settings
    "settings.title": "Pengaturan",
    "settings.subtitle": "Kelola akun dan preferensi kamu.",
    "settings.profile.label": "Profil",
    "settings.profile.desc": "Kelola profil publik kamu",
    "settings.security.label": "Keamanan",
    "settings.security.desc": "Kelola keamanan akun dan password kamu",

    // Profile Settings
    "profile.title": "Profil",
    "profile.subtitle": "Begini profilmu akan terlihat oleh pengguna lain.",
    "profile.viewPublic": "Lihat Profil Publik",
    "profile.avatarUpload": "Upload avatar baru.",
    "profile.avatarMaxSize": "Maksimal 4MB.",
    "profile.email": "Email",
    "profile.emailDesc": "Email ini tidak bisa diubah.",
    "profile.username": "Username",
    "profile.usernamePlaceholder": "Masukkan username",
    "profile.usernameDesc": "Nama yang akan tampil secara publik.",
    "profile.bio": "Bio",
    "profile.bioPlaceholder": "Ceritakan sedikit tentang dirimu",
    "profile.updateBtn": "Simpan Perubahan",
    "profile.success": "Profil berhasil diperbarui",
    "profile.error": "Gagal memuat data pengguna",

    // Security Settings
    "security.title": "Keamanan",
    "security.subtitle": "Kelola keamanan akun kamu.",
    "security.currentPassword": "Password Saat Ini",
    "security.currentPasswordPlaceholder": "Masukkan password sekarang",
    "security.newPassword": "Password Baru",
    "security.newPasswordPlaceholder": "Masukkan password baru",
    "security.confirmPassword": "Konfirmasi Password",
    "security.confirmPasswordPlaceholder": "Ulangi password baru",
    "security.updateBtn": "Ubah Password",
    "security.success": "Password berhasil diperbarui",
    "security.errorMismatch": "Password tidak cocok",
    "security.errorLength": "Password minimal 6 karakter",
    "security.errorMissing": "Masukkan password saat ini",
    "security.errorIncorrect": "Password saat ini salah",

    // Auth
    "auth.or": "atau",
    "auth.email": "Email",
    "auth.password": "Password",

    // Login
    "login.success": "Login berhasil!",
    "login.welcome": "Selamat datang kembali.",
    "login.failed": "Login gagal",
    "login.errorDesc": "Terjadi kesalahan saat login.",
    "login.googleErrorDesc": "Gagal login dengan Google.",
    "login.title": "Login",
    "login.subtitle": "Masukkan email dan password kamu",
    "login.forgotPassword": "Lupa password?",
    "login.loginBtn": "Login",
    "login.googleBtn": "Login dengan Google",
    "login.noAccount": "Belum punya akun?",
    "login.registerLink": "Daftar sekarang",

    // Register
    "register.passwordMismatchTitle": "Password tidak cocok",
    "register.passwordMismatchDesc": "Pastikan password sama.",
    "register.passwordShortTitle": "Password terlalu pendek",
    "register.passwordShortDesc": "Minimal 6 karakter.",
    "register.successTitle": "Registrasi berhasil!",
    "register.successDesc": "Cek email untuk verifikasi akun.",
    "register.failedTitle": "Registrasi gagal",
    "register.failedDesc": "Terjadi kesalahan.",
    "register.title": "Buat Akun",
    "register.subtitle": "Isi data di bawah",
    "register.username": "Username",
    "register.confirmPassword": "Konfirmasi Password",
    "register.registerBtn": "Daftar",
    "register.googleBtn": "Daftar dengan Google",
    "register.hasAccount": "Sudah punya akun?",
    "register.loginLink": "Login",

    // Forgot Password
    "forgot.successTitle": "Email terkirim!",
    "forgot.successDesc": "Cek email untuk link reset password.",
    "forgot.failedTitle": "Gagal mengirim email",
    "forgot.failedDesc": "Terjadi kesalahan.",
    "forgot.title": "Lupa Password?",
    "forgot.subtitle":
      "Masukkan email kamu, kami akan kirim link reset password.",
    "forgot.sendBtn": "Kirim Link Reset",
    "forgot.backToLogin": "Kembali ke Login",

    // Update Password
    "updatePw.deniedTitle": "Akses ditolak",
    "updatePw.deniedDesc": "Link tidak valid atau kadaluarsa.",
    "updatePw.mismatchTitle": "Password tidak cocok",
    "updatePw.mismatchDesc": "Pastikan kedua password sama.",
    "updatePw.shortTitle": "Password terlalu pendek",
    "updatePw.shortDesc": "Minimal 6 karakter.",
    "updatePw.successTitle": "Password berhasil diubah!",
    "updatePw.successDesc": "Silakan login dengan password baru.",
    "updatePw.failedTitle": "Gagal mengubah password",
    "updatePw.failedDesc": "Terjadi kesalahan.",
    "updatePw.title": "Buat Password Baru",
    "updatePw.subtitle": "Masukkan password baru kamu.",
    "updatePw.newPassword": "Password Baru",
    "updatePw.confirmPassword": "Konfirmasi Password",
    "updatePw.btn": "Ubah Password",

    // Common
    "common.loading": "Memuat...",
  },

  en: {
    // Navbar
    "nav.home": "Home",
    "nav.series": "Series",
    "nav.bookmarks": "Bookmarks",
    "nav.genres": "Genres",
    "nav.request": "Request",
    "nav.search": "Search novels...",
    "nav.noResults": "No results found.",
    "nav.chapters": "chapters",
    "nav.signIn": "Sign In",
    "nav.signUp": "Sign Up",
    "nav.settings": "Settings",
    "nav.admin": "Admin Dashboard",
    "nav.logout": "Log out",

    // Index Page
    "index.language.all": "All",
    "index.language.id": "Indonesian",
    "index.language.en": "English",

    // Hero Section
    "hero.rating": "Rating",
    "hero.startReading": "Start Reading",

    // New Releases Section
    "newReleases.title": "New Releases",
    "newReleases.subtitle": "Fresh novels just updated",

    // Popular Section
    "popular.title": "Popular Series",
    "popular.ranking": "#1 RANKING",
    "popular.chapters": "Chapters",
    "popular.views": "views",
    "popular.viewFull": "View Full Rankings",

    // Genres Section
    "genres.title": "Popular Genres",
    "genres.subtitle": "Explore stories by category",
    "genres.noNovels": "No novels found in this genre yet.",

    // Top Series Section
    "topSeries.title": "Top Series",
    "topSeries.subtitle": "Series with highest ratings",
    "topSeries.learnMore": "Learn More",

    // Recent Updates Section
    "recent.title": "Most Recently Updated",
    "recent.subtitle": "Fresh chapters hot off the press",
    "recent.novel": "Novel",
    "recent.latestChapter": "Latest Chapter",
    "recent.author": "Author",
    "recent.updated": "Updated",
    "recent.chapter": "Chapter",
    "recent.recently": "Recently",

    // Announcements Section
    "announcements.title": "Announcements",

    // Request Section
    "request.title": "Looking for a novel not here?",
    "request.subtitle":
      "Request your favorite novel here. We will try to add it to our collection.",
    "request.button": "Request Here",

    // Recently Read Section
    "recentlyRead.title": "Pick Up Where You Left Off",
    "recentlyRead.chapter": "Chapter",
    "recentlyRead.lastRead": "Last read",
    "recentlyRead.continue": "Continue Reading →",

    // Catalog Page
    "catalog.browse": "Browse Series",
    "catalog.archive": "Archive for",
    "catalog.search": "Search series...",
    "catalog.genre": "Genre",
    "catalog.sort": "Sort",
    "catalog.allSeries": "All Series",
    "catalog.loadMore": "Load More Series",
    "catalog.noNovels": "No novels found matching your criteria.",
    "catalog.clearFilters": "Clear filters",

    // Rankings
    "rankings.title": "Most Popular Series",
    "rankings.subtitle": "The most read novels on Celestial Scrolls",
    "rankings.loading": "Loading rankings...",
    "rankings.leaderboard": "Full Leaderboard",
    "rankings.rank": "Rank",
    "rankings.seriesTitle": "Series Title",
    "rankings.chapters": "Chapters",
    "rankings.rating": "Rating",
    "rankings.totalViews": "Total Views",

    // Bookmarks
    "bookmarks.timeAdded": "Time Added",
    "bookmarks.rating": "Rating",
    "bookmarks.latestChapter": "Latest Chapter",
    "bookmarks.loginRequired": "Login Required",
    "bookmarks.loginMessage": "Please login to view your bookmarks.",
    "bookmarks.title": "My Bookmarks",
    "bookmarks.savedSeries": "Saved Series",
    "bookmarks.previous": "Previous",
    "bookmarks.next": "Next",
    "bookmarks.page": "Page",
    "bookmarks.of": "of",
    "bookmarks.empty": "You haven't bookmarked any novels yet.",
    "bookmarks.browse": "Browse Series",
    "bookmarks.ascending": "Ascending",
    "bookmarks.descending": "Descending",

    // Genres Page
    "genresPage.title": "Popular Genres",
    "genresPage.subtitle":
      "Explore our vast collection of novels by genre. From action-packed martial arts to mystical cultivation journeys, find your next favorite story.",
    "genresPage.noGenres": "No genres found.",
    "genresPage.noDescription": "No description available.",
    "genresPage.novels": "Novels",

    // Novel Detail
    "novelDetail.notFound": "Not Found",
    "novelDetail.novelNotFound": "Novel not found",
    "novelDetail.unavailable": "Unavailable",
    "novelDetail.notPublished": "This novel is not currently published.",
    "novelDetail.error": "Error",
    "novelDetail.loadError": "Failed to load novel details",
    "novelDetail.removed": "Removed",
    "novelDetail.removedMessage": "Removed from your library.",
    "novelDetail.added": "Added",
    "novelDetail.addedMessage": "Added to your library.",
    "novelDetail.rated": "Rated",
    "novelDetail.ratedMessage": "You rated this novel",
    "novelDetail.stars": "stars",
    "novelDetail.noChapters": "No Chapters",
    "novelDetail.noChaptersMessage": "No chapters available to read yet.",
    "novelDetail.backToCatalog": "Back to Catalog",
    "novelDetail.by": "By",
    "novelDetail.unknown": "Unknown",
    "novelDetail.chaptersCount": "Chapters",
    "novelDetail.views": "views",
    "novelDetail.bookmarksCount": "Bookmarks",
    "novelDetail.readNow": "Read Now",
    "novelDetail.continueChapter": "Continue Chapter",
    "novelDetail.saved": "Saved",
    "novelDetail.addToLibrary": "Add to Library",
    "novelDetail.about": "About",
    "novelDetail.synopsis": "Synopsis",
    "novelDetail.totalChapters": "Total",
    "novelDetail.searchChapter": "Search chapter...",
    "novelDetail.oldestFirst": "Oldest First",
    "novelDetail.newestFirst": "Newest First",
    "novelDetail.noChaptersUploaded": "No chapters uploaded yet.",
    "novelDetail.noChaptersFound": "No chapters found matching your search.",
    "novelDetail.draft": "Draft",
    "novelDetail.readBtn": "Read",
    "novelDetail.chapter": "Chapter",
    "novelDetail.page": "Page",
    "novelDetail.of": "of",
    "novelDetail.goTo": "Go to",
    "novelDetail.show": "Show",

    // Chapter Reader
    "reader.novelNotFound": "Novel not found",
    "reader.notPublished": "This novel is not published.",
    "reader.chapterNotFound": "Chapter not found",
    "reader.loginRequired": "Please login to report issues.",
    "reader.emptyReason": "Please enter a reason for the report.",
    "reader.reportSubmitted": "Report Submitted",
    "reader.reportThankYou":
      "Thank you for detecting the error. We will fix it soon.",
    "reader.reportFailed": "Failed to submit report.",
    "reader.home": "Home",
    "reader.backToSeries": "Back to Series",
    "reader.chapter": "Chapter",
    "reader.toc": "Table of Contents",
    "reader.noContent": "No content.",
    "reader.reportIssue": "Translation error? Report it",
    "reader.reportTitle": "Report Translation Error",
    "reader.reportDescription":
      "Help us improve translation quality by reporting errors you found.",
    "reader.reportDetailLabel": "Error Detail",
    "reader.reportPlaceholder":
      "Example: In the 3rd paragraph, the word 'Apple' should be translated as 'Apel', not 'Jeruk'.",
    "reader.cancel": "Cancel",
    "reader.submitReport": "Submit Report",
    "reader.prev": "Prev",
    "reader.next": "Next",

    // Not Found
    "notFound.title": "Oops! Page not found",
    "notFound.return": "Return to Home",

    // Request Novel
    "requestPage.title": "Request Novel",
    "requestPage.subtitle": "Write down the novel you want to request here.",
    "requestPage.dmcaTitle": "Novelpia & DMCA",
    "requestPage.dmcaDesc1": "Will not translate novels from ",
    "requestPage.dmcaDesc2": ", as it may result in DMCA strikes.",
    "requestPage.comments": "Comments",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle":
      "Manage your account settings and set e-mail preferences.",
    "settings.profile.label": "Profile",
    "settings.profile.desc": "Manage your public profile",
    "settings.security.label": "Security",
    "settings.security.desc": "Manage your password and account security",

    // Profile Settings
    "profile.title": "Profile",
    "profile.subtitle": "This is how others will see you on the site.",
    "profile.viewPublic": "View Public Profile",
    "profile.avatarUpload": "Upload a new avatar image.",
    "profile.avatarMaxSize": "Max size 4MB.",
    "profile.email": "Email",
    "profile.emailDesc": "This is your e-mail and cannot be changed.",
    "profile.username": "Username",
    "profile.usernamePlaceholder": "Your username",
    "profile.usernameDesc": "This is your public display name.",
    "profile.bio": "Bio",
    "profile.bioPlaceholder": "Tell us a little bit about yourself",
    "profile.updateBtn": "Update profile",
    "profile.success": "Profile updated successfully",
    "profile.error": "Error loading user data!",

    // Security Settings
    "security.title": "Security",
    "security.subtitle": "Manage your password and account security settings.",
    "security.currentPassword": "Current Password",
    "security.currentPasswordPlaceholder": "Enter current password",
    "security.newPassword": "New Password",
    "security.newPasswordPlaceholder": "Enter new password",
    "security.confirmPassword": "Confirm New Password",
    "security.confirmPasswordPlaceholder": "Confirm new password",
    "security.updateBtn": "Update Password",
    "security.success": "Password updated successfully",
    "security.errorMismatch": "Passwords do not match",
    "security.errorLength": "Password must be at least 6 characters",
    "security.errorMissing": "Please enter your current password",
    "security.errorIncorrect": "Current password is incorrect",

    // Auth common
    "auth.or": "or",
    "auth.email": "Email",
    "auth.password": "Password",

    // Login
    "login.success": "Login successful!",
    "login.welcome": "Welcome back.",
    "login.failed": "Login failed",
    "login.errorDesc": "An error occurred during login.",
    "login.googleErrorDesc": "An error occurred during Google login.",
    "login.title": "Sign In",
    "login.subtitle": "Enter your email and password to continue",
    "login.forgotPassword": "Forgot password?",
    "login.loginBtn": "Sign In",
    "login.googleBtn": "Sign in with Google",
    "login.noAccount": "Don't have an account?",
    "login.registerLink": "Sign Up",

    // Register
    "register.passwordMismatchTitle": "Passwords do not match",
    "register.passwordMismatchDesc":
      "Make sure the password and confirmation password are the same.",
    "register.passwordShortTitle": "Password too short",
    "register.passwordShortDesc": "Password must be at least 6 characters.",
    "register.successTitle": "Registration successful!",
    "register.successDesc": "Please check your email to verify your account.",
    "register.failedTitle": "Registration failed",
    "register.failedDesc": "An error occurred during registration.",
    "register.title": "Create New Account",
    "register.subtitle": "Fill out the form below to create an account",
    "register.username": "Username",
    "register.confirmPassword": "Confirm Password",
    "register.registerBtn": "Sign Up",
    "register.googleBtn": "Sign up with Google",
    "register.hasAccount": "Already have an account?",
    "register.loginLink": "Sign In",

    // Forgot Password
    "forgot.successTitle": "Email sent!",
    "forgot.successDesc":
      "Please check your email for the reset password link.",
    "forgot.failedTitle": "Failed to send email",
    "forgot.failedDesc": "An error occurred.",
    "forgot.title": "Forgot Password?",
    "forgot.subtitle":
      "Enter your email, we will send you a reset password link.",
    "forgot.sendBtn": "Send Reset Link",
    "forgot.backToLogin": "Back to Login",

    // Update Password
    "updatePw.deniedTitle": "Access Denied",
    "updatePw.deniedDesc": "Invalid or expired link.",
    "updatePw.mismatchTitle": "Passwords do not match",
    "updatePw.mismatchDesc": "Make sure both passwords are the same.",
    "updatePw.shortTitle": "Password too short",
    "updatePw.shortDesc": "Password must be at least 6 characters.",
    "updatePw.successTitle": "Password changed successfully!",
    "updatePw.successDesc": "Please log in with your new password.",
    "updatePw.failedTitle": "Failed to change password",
    "updatePw.failedDesc": "An error occurred.",
    "updatePw.title": "Create New Password",
    "updatePw.subtitle": "Enter your new password below.",
    "updatePw.newPassword": "New Password",
    "updatePw.confirmPassword": "Confirm Password",
    "updatePw.btn": "Change Password",

    // Other common words
    "common.loading": "Loading...",
  },
};
