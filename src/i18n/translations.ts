export type Language = 'id' | 'en';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

export const translations: Translations = {
    id: {
        // Navbar
        'nav.home': 'Beranda',
        'nav.series': 'Seri',
        'nav.bookmarks': 'Markah',
        'nav.genres': 'Genre',
        'nav.request': 'Permintaan',
        'nav.search': 'Cari novel...',
        'nav.noResults': 'Tidak ada hasil yang ditemukan.',
        'nav.chapters': 'bab',
        'nav.signIn': 'Masuk',
        'nav.signUp': 'Daftar',
        'nav.settings': 'Pengaturan',
        'nav.admin': 'Dasbor Admin',
        'nav.logout': 'Keluar',

        // Index Page
        'index.language.all': 'Semua',
        'index.language.id': 'Indonesia',
        'index.language.en': 'Inggris',

        // Hero Section
        'hero.rating': 'Penilaian',
        'hero.startReading': 'Mulai Membaca',

        // New Releases Section
        'newReleases.title': 'Rilis Baru',
        'newReleases.subtitle': 'Cerita segar yang baru dimulai',

        // Popular Section
        'popular.title': 'Seri Populer',
        'popular.ranking': '#1 PERINGKAT',
        'popular.chapters': 'Bab',
        'popular.views': 'tayangan',
        'popular.viewFull': 'Lihat Peringkat Lengkap',

        // Genres Section
        'genres.title': 'Genre Populer',
        'genres.subtitle': 'Jelajahi cerita berdasarkan kategori',
        'genres.noNovels': 'Belum ada novel yang ditemukan dalam genre ini.',

        // Top Series Section
        'topSeries.title': 'Seri Teratas',
        'topSeries.subtitle': 'Seri dengan peringkat tertinggi',
        'topSeries.learnMore': 'Pelajari Lebih Lanjut',

        // Recent Updates Section
        'recent.title': 'Pembaruan Terbaru',
        'recent.subtitle': 'Bab segar yang baru saja rilis',
        'recent.novel': 'Novel',
        'recent.latestChapter': 'Bab Terbaru',
        'recent.author': 'Penulis',
        'recent.updated': 'Diperbarui',
        'recent.chapter': 'Bab',
        'recent.recently': 'Baru Saja',

        // Announcements Section
        'announcements.title': 'Pengumuman',

        // Request Section
        'request.title': 'Novel yang anda cari tidak ada?',
        'request.subtitle': 'Request novel favoritmu disini. Kami akan berusaha menambahkannya ke koleksi kami.',
        'request.button': 'Request Disini',

        // Recently Read Section
        'recentlyRead.title': 'Lanjutkan Membaca',
        'recentlyRead.chapter': 'Bab',
        'recentlyRead.lastRead': 'Terakhir dibaca',
        'recentlyRead.continue': 'Lanjutkan Membaca →',

        // Catalog Page
        'catalog.browse': 'Jelajahi Seri',
        'catalog.archive': 'Arsip untuk',
        'catalog.search': 'Cari seri...',
        'catalog.genre': 'Genre',
        'catalog.sort': 'Urutkan',
        'catalog.allSeries': 'Semua Seri',
        'catalog.loadMore': 'Muat Lebih Banyak Seri',
        'catalog.noNovels': 'Tidak ada novel yang sesuai dengan kriteria Anda.',
        'catalog.clearFilters': 'Hapus filter',

        // Rankings
        'rankings.title': 'Seri Terpopuler',
        'rankings.subtitle': 'Novel yang paling banyak dibaca di Celestial Scrolls',
        'rankings.loading': 'Memuat peringkat...',
        'rankings.leaderboard': 'Papan Peringkat Lengkap',
        'rankings.rank': 'Peringkat',
        'rankings.seriesTitle': 'Judul Seri',
        'rankings.chapters': 'Bab',
        'rankings.rating': 'Penilaian',
        'rankings.totalViews': 'Total Tayangan',

        // Bookmarks
        'bookmarks.timeAdded': 'Waktu Ditambahkan',
        'bookmarks.rating': 'Penilaian',
        'bookmarks.latestChapter': 'Bab Terbaru',
        'bookmarks.loginRequired': 'Login Diperlukan',
        'bookmarks.loginMessage': 'Silakan login untuk melihat markah Anda.',
        'bookmarks.title': 'Markah Saya',
        'bookmarks.savedSeries': 'Seri Tersimpan',
        'bookmarks.previous': 'Sebelumnya',
        'bookmarks.next': 'Selanjutnya',
        'bookmarks.page': 'Halaman',
        'bookmarks.of': 'dari',
        'bookmarks.empty': 'Anda belum menandai novel apa pun.',
        'bookmarks.browse': 'Jelajahi Seri',
        'bookmarks.ascending': 'Menaik',
        'bookmarks.descending': 'Menurun',

        // Genres Page
        'genresPage.title': 'Genre Populer',
        'genresPage.subtitle': 'Jelajahi koleksi novel kami berdasarkan genre. Dari aksi seni bela diri yang epik hingga perjalanan kultivasi yang mistis, temukan cerita favorit Anda selanjutnya.',
        'genresPage.noGenres': 'Tidak ada genre yang ditemukan.',
        'genresPage.noDescription': 'Tidak ada deskripsi yang tersedia.',
        'genresPage.novels': 'Novel',

        // Novel Detail
        'novelDetail.notFound': 'Pencarian Tidak Ditemukan',
        'novelDetail.novelNotFound': 'Novel tidak ditemukan',
        'novelDetail.unavailable': 'Tidak tersedia',
        'novelDetail.notPublished': 'Novel ini saat ini tidak dipublikasikan.',
        'novelDetail.error': 'Galat',
        'novelDetail.loadError': 'Gagal memuat detail novel',
        'novelDetail.removed': 'Dihapus',
        'novelDetail.removedMessage': 'Dihapus dari perpustakaan Anda.',
        'novelDetail.added': 'Ditambahkan',
        'novelDetail.addedMessage': 'Ditambahkan ke perpustakaan Anda.',
        'novelDetail.rated': 'Dinilai',
        'novelDetail.ratedMessage': 'Anda menilai novel ini',
        'novelDetail.stars': 'bintang',
        'novelDetail.noChapters': 'Belum Ada Bab',
        'novelDetail.noChaptersMessage': 'Belum ada bab yang tersedia untuk dibaca.',
        'novelDetail.backToCatalog': 'Kembali ke Katalog',
        'novelDetail.by': 'Oleh',
        'novelDetail.unknown': 'Tidak diketahui',
        'novelDetail.chaptersCount': 'Bab',
        'novelDetail.views': 'tayangan',
        'novelDetail.bookmarksCount': 'Markah',
        'novelDetail.readNow': 'Baca Sekarang',
        'novelDetail.continueChapter': 'Lanjutkan Bab',
        'novelDetail.saved': 'Tersimpan',
        'novelDetail.addToLibrary': 'Tambahkan ke Perpustakaan',
        'novelDetail.about': 'Tentang',
        'novelDetail.synopsis': 'Sinopsis',
        'novelDetail.totalChapters': 'Total',
        'novelDetail.searchChapter': 'Cari bab...',
        'novelDetail.oldestFirst': 'Terlama Dahulu',
        'novelDetail.newestFirst': 'Terbaru Dahulu',
        'novelDetail.noChaptersUploaded': 'Belum ada bab yang diunggah.',
        'novelDetail.noChaptersFound': 'Tidak ada bab yang sesuai dengan pencarian Anda.',
        'novelDetail.draft': 'Draf',
        'novelDetail.readBtn': 'Baca',
        'novelDetail.chapter': 'Bab',
        'novelDetail.page': 'Halaman',
        'novelDetail.of': 'dari',

        // Chapter Reader
        'reader.novelNotFound': 'Novel tidak ditemukan',
        'reader.notPublished': 'Novel ini tidak dipublikasikan.',
        'reader.chapterNotFound': 'Bab tidak ditemukan',
        'reader.loginRequired': 'Silakan login untuk melaporkan masalah.',
        'reader.emptyReason': 'Silakan masukkan alasan laporan.',
        'reader.reportSubmitted': 'Laporan Terkirim',
        'reader.reportThankYou': 'Terima kasih telah mendeteksi galat. Kami akan segera memperbaikinya.',
        'reader.reportFailed': 'Gagal mengirim laporan.',
        'reader.home': 'Beranda',
        'reader.backToSeries': 'Kembali ke Seri',
        'reader.chapter': 'Bab',
        'reader.toc': 'Daftar Isi',
        'reader.noContent': 'Tidak ada konten.',
        'reader.reportIssue': 'Ada terjemahan yang salah? Laporkan',
        'reader.reportTitle': 'Lapor Kesalahan Terjemahan',
        'reader.reportDescription': 'Bantu kami memperbaiki kualitas terjemahan dengan melaporkan kesalahan yang Anda temukan.',
        'reader.reportDetailLabel': 'Detail Kesalahan',
        'reader.reportPlaceholder': 'Contoh: Pada paragraf ke-3, kata \'Apple\' seharusnya diterjemahkan menjadi \'Apel\', bukan \'Jeruk\'.',
        'reader.cancel': 'Batal',
        'reader.submitReport': 'Kirim Laporan',
        'reader.prev': 'Sebelumnya',
        'reader.next': 'Selanjutnya',

        // Not Found
        'notFound.title': 'Ups! Halaman tidak ditemukan',
        'notFound.return': 'Kembali ke Beranda',

        // Request Novel
        'requestPage.title': 'Minta Novel',
        'requestPage.subtitle': 'Tulis novel yang mau kalian request disini.',
        'requestPage.dmcaTitle': 'Novelpia & DMCA',
        'requestPage.dmcaDesc1': 'Tidak akan menerjemahkan novel dari ',
        'requestPage.dmcaDesc2': ', karena bisa terkena DMCA.',
        'requestPage.comments': 'Komentar',

        // Settings
        'settings.title': 'Pengaturan',
        'settings.subtitle': 'Kelola pengaturan akun Anda dan pilih preferensi surel.',
        'settings.profile.label': 'Profil',
        'settings.profile.desc': 'Kelola profil publik Anda',
        'settings.security.label': 'Keamanan',
        'settings.security.desc': 'Kelola pengaturan keamanan akun dan kata sandi Anda',

        // Profile Settings
        'profile.title': 'Profil',
        'profile.subtitle': 'Ini adalah bagaimana orang lain akan melihat Anda di situs.',
        'profile.viewPublic': 'Lihat Profil Publik',
        'profile.avatarUpload': 'Unggah gambar avatar baru.',
        'profile.avatarMaxSize': 'Ukuran maksimal 4MB.',
        'profile.email': 'Surel',
        'profile.emailDesc': 'Ini adalah surel Anda dan tidak dapat diubah.',
        'profile.username': 'Nama Pengguna',
        'profile.usernamePlaceholder': 'Nama pengguna Anda',
        'profile.usernameDesc': 'Ini adalah nama tampilan publik Anda.',
        'profile.bio': 'Biodata',
        'profile.bioPlaceholder': 'Ceritakan sedikit tentang diri Anda',
        'profile.updateBtn': 'Perbarui profil',
        'profile.success': 'Profil berhasil diperbarui',
        'profile.error': 'Galat memuat data pengguna!',

        // Security Settings
        'security.title': 'Keamanan',
        'security.subtitle': 'Kelola pengaturan keamanan akun dan kata sandi Anda.',
        'security.currentPassword': 'Kata Sandi Saat Ini',
        'security.currentPasswordPlaceholder': 'Masukkan kata sandi saat ini',
        'security.newPassword': 'Kata Sandi Baru',
        'security.newPasswordPlaceholder': 'Masukkan kata sandi baru',
        'security.confirmPassword': 'Konfirmasi Kata Sandi Baru',
        'security.confirmPasswordPlaceholder': 'Konfirmasi kata sandi baru',
        'security.updateBtn': 'Perbarui Kata Sandi',
        'security.success': 'Kata sandi berhasil diperbarui',
        'security.errorMismatch': 'Kata sandi tidak cocok',
        'security.errorLength': 'Kata sandi minimal harus 6 karakter',
        'security.errorMissing': 'Silakan masukkan kata sandi Anda saat ini',
        'security.errorIncorrect': 'Kata sandi saat ini tidak benar',

        // Auth common
        'auth.or': 'atau',
        'auth.email': 'Email',
        'auth.password': 'Password',

        // Login
        'login.success': 'Login berhasil!',
        'login.welcome': 'Selamat datang kembali.',
        'login.failed': 'Login gagal',
        'login.errorDesc': 'Terjadi kesalahan saat login.',
        'login.googleErrorDesc': 'Terjadi kesalahan saat login with Google.',
        'login.title': 'Masuk ke Akun',
        'login.subtitle': 'Masukkan email dan password untuk melanjutkan',
        'login.forgotPassword': 'Lupa password?',
        'login.loginBtn': 'Masuk',
        'login.googleBtn': 'Masuk dengan Google',
        'login.noAccount': 'Belum punya akun?',
        'login.registerLink': 'Daftar sekarang',

        // Register
        'register.passwordMismatchTitle': 'Password tidak cocok',
        'register.passwordMismatchDesc': 'Pastikan password dan konfirmasi password sama.',
        'register.passwordShortTitle': 'Password terlalu pendek',
        'register.passwordShortDesc': 'Password minimal 6 karakter.',
        'register.successTitle': 'Registrasi berhasil!',
        'register.successDesc': 'Silakan cek email untuk verifikasi akun Anda.',
        'register.failedTitle': 'Registrasi gagal',
        'register.failedDesc': 'Terjadi kesalahan saat registrasi.',
        'register.title': 'Buat Akun Baru',
        'register.subtitle': 'Isi form di bawah untuk membuat akun',
        'register.username': 'Username',
        'register.confirmPassword': 'Konfirmasi Password',
        'register.registerBtn': 'Daftar',
        'register.googleBtn': 'Daftar dengan Google',
        'register.hasAccount': 'Sudah punya akun?',
        'register.loginLink': 'Masuk',

        // Forgot Password
        'forgot.successTitle': 'Email terkirim!',
        'forgot.successDesc': 'Silakan cek email untuk link reset password Anda.',
        'forgot.failedTitle': 'Gagal mengirim email',
        'forgot.failedDesc': 'Terjadi kesalahan.',
        'forgot.title': 'Lupa Password?',
        'forgot.subtitle': 'Masukkan email Anda, kami akan mengirimkan link reset password.',
        'forgot.sendBtn': 'Kirim Link Reset',
        'forgot.backToLogin': 'Kembali ke Login',

        // Update Password
        'updatePw.deniedTitle': 'Akses Ditolak',
        'updatePw.deniedDesc': 'Link tidak valid atau kadaluarsa.',
        'updatePw.mismatchTitle': 'Password tidak cocok',
        'updatePw.mismatchDesc': 'Pastikan kedua password sama.',
        'updatePw.shortTitle': 'Password terlalu pendek',
        'updatePw.shortDesc': 'Password minimal 6 karakter.',
        'updatePw.successTitle': 'Password berhasil diubah!',
        'updatePw.successDesc': 'Silakan login dengan password baru Anda.',
        'updatePw.failedTitle': 'Gagal mengubah password',
        'updatePw.failedDesc': 'Terjadi kesalahan.',
        'updatePw.title': 'Buat Password Baru',
        'updatePw.subtitle': 'Masukkan password baru Anda di bawah ini.',
        'updatePw.newPassword': 'Password Baru',
        'updatePw.confirmPassword': 'Konfirmasi Password',
        'updatePw.btn': 'Ubah Password',

        // Other common words
        'common.loading': 'Memuat...',
    },
    en: {
        // Navbar
        'nav.home': 'Home',
        'nav.series': 'Series',
        'nav.bookmarks': 'Bookmarks',
        'nav.genres': 'Genres',
        'nav.request': 'Request',
        'nav.search': 'Search novels...',
        'nav.noResults': 'No results found.',
        'nav.chapters': 'chapters',
        'nav.signIn': 'Sign In',
        'nav.signUp': 'Sign Up',
        'nav.settings': 'Settings',
        'nav.admin': 'Admin Dashboard',
        'nav.logout': 'Log out',

        // Index Page
        'index.language.all': 'All',
        'index.language.id': 'Indonesian',
        'index.language.en': 'English',

        // Hero Section
        'hero.rating': 'Rating',
        'hero.startReading': 'Start Reading',

        // New Releases Section
        'newReleases.title': 'New Releases',
        'newReleases.subtitle': 'Fresh stories just started',

        // Popular Section
        'popular.title': 'Popular Series',
        'popular.ranking': '#1 RANKING',
        'popular.chapters': 'Chapters',
        'popular.views': 'views',
        'popular.viewFull': 'View Full Rankings',

        // Genres Section
        'genres.title': 'Popular Genres',
        'genres.subtitle': 'Explore stories by category',
        'genres.noNovels': 'No novels found in this genre yet.',

        // Top Series Section
        'topSeries.title': 'Top Series',
        'topSeries.subtitle': 'Series with highest ratings',
        'topSeries.learnMore': 'Learn More',

        // Recent Updates Section
        'recent.title': 'Most Recently Updated',
        'recent.subtitle': 'Fresh chapters hot off the press',
        'recent.novel': 'Novel',
        'recent.latestChapter': 'Latest Chapter',
        'recent.author': 'Author',
        'recent.updated': 'Updated',
        'recent.chapter': 'Chapter',
        'recent.recently': 'Recently',

        // Announcements Section
        'announcements.title': 'Announcements',

        // Request Section
        'request.title': 'Looking for a novel not here?',
        'request.subtitle': 'Request your favorite novel here. We will try to add it to our collection.',
        'request.button': 'Request Here',

        // Recently Read Section
        'recentlyRead.title': 'Pick Up Where You Left Off',
        'recentlyRead.chapter': 'Chapter',
        'recentlyRead.lastRead': 'Last read',
        'recentlyRead.continue': 'Continue Reading →',

        // Catalog Page
        'catalog.browse': 'Browse Series',
        'catalog.archive': 'Archive for',
        'catalog.search': 'Search series...',
        'catalog.genre': 'Genre',
        'catalog.sort': 'Sort',
        'catalog.allSeries': 'All Series',
        'catalog.loadMore': 'Load More Series',
        'catalog.noNovels': 'No novels found matching your criteria.',
        'catalog.clearFilters': 'Clear filters',

        // Rankings
        'rankings.title': 'Most Popular Series',
        'rankings.subtitle': 'The most read novels on Celestial Scrolls',
        'rankings.loading': 'Loading rankings...',
        'rankings.leaderboard': 'Full Leaderboard',
        'rankings.rank': 'Rank',
        'rankings.seriesTitle': 'Series Title',
        'rankings.chapters': 'Chapters',
        'rankings.rating': 'Rating',
        'rankings.totalViews': 'Total Views',

        // Bookmarks
        'bookmarks.timeAdded': 'Time Added',
        'bookmarks.rating': 'Rating',
        'bookmarks.latestChapter': 'Latest Chapter',
        'bookmarks.loginRequired': 'Login Required',
        'bookmarks.loginMessage': 'Please login to view your bookmarks.',
        'bookmarks.title': 'My Bookmarks',
        'bookmarks.savedSeries': 'Saved Series',
        'bookmarks.previous': 'Previous',
        'bookmarks.next': 'Next',
        'bookmarks.page': 'Page',
        'bookmarks.of': 'of',
        'bookmarks.empty': 'You haven\'t bookmarked any novels yet.',
        'bookmarks.browse': 'Browse Series',
        'bookmarks.ascending': 'Ascending',
        'bookmarks.descending': 'Descending',

        // Genres Page
        'genresPage.title': 'Popular Genres',
        'genresPage.subtitle': 'Explore our vast collection of novels by genre. From action-packed martial arts to mystical cultivation journeys, find your next favorite story.',
        'genresPage.noGenres': 'No genres found.',
        'genresPage.noDescription': 'No description available.',
        'genresPage.novels': 'Novels',

        // Novel Detail
        'novelDetail.notFound': 'Not Found',
        'novelDetail.novelNotFound': 'Novel not found',
        'novelDetail.unavailable': 'Unavailable',
        'novelDetail.notPublished': 'This novel is not currently published.',
        'novelDetail.error': 'Error',
        'novelDetail.loadError': 'Failed to load novel details',
        'novelDetail.removed': 'Removed',
        'novelDetail.removedMessage': 'Removed from your library.',
        'novelDetail.added': 'Added',
        'novelDetail.addedMessage': 'Added to your library.',
        'novelDetail.rated': 'Rated',
        'novelDetail.ratedMessage': 'You rated this novel',
        'novelDetail.stars': 'stars',
        'novelDetail.noChapters': 'No Chapters',
        'novelDetail.noChaptersMessage': 'No chapters available to read yet.',
        'novelDetail.backToCatalog': 'Back to Catalog',
        'novelDetail.by': 'By',
        'novelDetail.unknown': 'Unknown',
        'novelDetail.chaptersCount': 'Chapters',
        'novelDetail.views': 'views',
        'novelDetail.bookmarksCount': 'Bookmarks',
        'novelDetail.readNow': 'Read Now',
        'novelDetail.continueChapter': 'Continue Chapter',
        'novelDetail.saved': 'Saved',
        'novelDetail.addToLibrary': 'Add to Library',
        'novelDetail.about': 'About',
        'novelDetail.synopsis': 'Synopsis',
        'novelDetail.totalChapters': 'Total',
        'novelDetail.searchChapter': 'Search chapter...',
        'novelDetail.oldestFirst': 'Oldest First',
        'novelDetail.newestFirst': 'Newest First',
        'novelDetail.noChaptersUploaded': 'No chapters uploaded yet.',
        'novelDetail.noChaptersFound': 'No chapters found matching your search.',
        'novelDetail.draft': 'Draft',
        'novelDetail.readBtn': 'Read',
        'novelDetail.chapter': 'Chapter',
        'novelDetail.page': 'Page',
        'novelDetail.of': 'of',

        // Chapter Reader
        'reader.novelNotFound': 'Novel not found',
        'reader.notPublished': 'This novel is not published.',
        'reader.chapterNotFound': 'Chapter not found',
        'reader.loginRequired': 'Please login to report issues.',
        'reader.emptyReason': 'Please enter a reason for the report.',
        'reader.reportSubmitted': 'Report Submitted',
        'reader.reportThankYou': 'Thank you for detecting the error. We will fix it soon.',
        'reader.reportFailed': 'Failed to submit report.',
        'reader.home': 'Home',
        'reader.backToSeries': 'Back to Series',
        'reader.chapter': 'Chapter',
        'reader.toc': 'Table of Contents',
        'reader.noContent': 'No content.',
        'reader.reportIssue': 'Translation error? Report it',
        'reader.reportTitle': 'Report Translation Error',
        'reader.reportDescription': 'Help us improve translation quality by reporting errors you found.',
        'reader.reportDetailLabel': 'Error Detail',
        'reader.reportPlaceholder': 'Example: In the 3rd paragraph, the word \'Apple\' should be translated as \'Apel\', not \'Jeruk\'.',
        'reader.cancel': 'Cancel',
        'reader.submitReport': 'Submit Report',
        'reader.prev': 'Prev',
        'reader.next': 'Next',

        // Not Found
        'notFound.title': 'Oops! Page not found',
        'notFound.return': 'Return to Home',

        // Request Novel
        'requestPage.title': 'Request Novel',
        'requestPage.subtitle': 'Write down the novel you want to request here.',
        'requestPage.dmcaTitle': 'Novelpia & DMCA',
        'requestPage.dmcaDesc1': 'Will not translate novels from ',
        'requestPage.dmcaDesc2': ', as it may result in DMCA strikes.',
        'requestPage.comments': 'Comments',

        // Settings
        'settings.title': 'Settings',
        'settings.subtitle': 'Manage your account settings and set e-mail preferences.',
        'settings.profile.label': 'Profile',
        'settings.profile.desc': 'Manage your public profile',
        'settings.security.label': 'Security',
        'settings.security.desc': 'Manage your password and account security',

        // Profile Settings
        'profile.title': 'Profile',
        'profile.subtitle': 'This is how others will see you on the site.',
        'profile.viewPublic': 'View Public Profile',
        'profile.avatarUpload': 'Upload a new avatar image.',
        'profile.avatarMaxSize': 'Max size 4MB.',
        'profile.email': 'Email',
        'profile.emailDesc': 'This is your e-mail and cannot be changed.',
        'profile.username': 'Username',
        'profile.usernamePlaceholder': 'Your username',
        'profile.usernameDesc': 'This is your public display name.',
        'profile.bio': 'Bio',
        'profile.bioPlaceholder': 'Tell us a little bit about yourself',
        'profile.updateBtn': 'Update profile',
        'profile.success': 'Profile updated successfully',
        'profile.error': 'Error loading user data!',

        // Security Settings
        'security.title': 'Security',
        'security.subtitle': 'Manage your password and account security settings.',
        'security.currentPassword': 'Current Password',
        'security.currentPasswordPlaceholder': 'Enter current password',
        'security.newPassword': 'New Password',
        'security.newPasswordPlaceholder': 'Enter new password',
        'security.confirmPassword': 'Confirm New Password',
        'security.confirmPasswordPlaceholder': 'Confirm new password',
        'security.updateBtn': 'Update Password',
        'security.success': 'Password updated successfully',
        'security.errorMismatch': 'Passwords do not match',
        'security.errorLength': 'Password must be at least 6 characters',
        'security.errorMissing': 'Please enter your current password',
        'security.errorIncorrect': 'Current password is incorrect',

        // Auth common
        'auth.or': 'or',
        'auth.email': 'Email',
        'auth.password': 'Password',

        // Login
        'login.success': 'Login successful!',
        'login.welcome': 'Welcome back.',
        'login.failed': 'Login failed',
        'login.errorDesc': 'An error occurred during login.',
        'login.googleErrorDesc': 'An error occurred during Google login.',
        'login.title': 'Sign In',
        'login.subtitle': 'Enter your email and password to continue',
        'login.forgotPassword': 'Forgot password?',
        'login.loginBtn': 'Sign In',
        'login.googleBtn': 'Sign in with Google',
        'login.noAccount': 'Don\'t have an account?',
        'login.registerLink': 'Sign Up',

        // Register
        'register.passwordMismatchTitle': 'Passwords do not match',
        'register.passwordMismatchDesc': 'Make sure the password and confirmation password are the same.',
        'register.passwordShortTitle': 'Password too short',
        'register.passwordShortDesc': 'Password must be at least 6 characters.',
        'register.successTitle': 'Registration successful!',
        'register.successDesc': 'Please check your email to verify your account.',
        'register.failedTitle': 'Registration failed',
        'register.failedDesc': 'An error occurred during registration.',
        'register.title': 'Create New Account',
        'register.subtitle': 'Fill out the form below to create an account',
        'register.username': 'Username',
        'register.confirmPassword': 'Confirm Password',
        'register.registerBtn': 'Sign Up',
        'register.googleBtn': 'Sign up with Google',
        'register.hasAccount': 'Already have an account?',
        'register.loginLink': 'Sign In',

        // Forgot Password
        'forgot.successTitle': 'Email sent!',
        'forgot.successDesc': 'Please check your email for the reset password link.',
        'forgot.failedTitle': 'Failed to send email',
        'forgot.failedDesc': 'An error occurred.',
        'forgot.title': 'Forgot Password?',
        'forgot.subtitle': 'Enter your email, we will send you a reset password link.',
        'forgot.sendBtn': 'Send Reset Link',
        'forgot.backToLogin': 'Back to Login',

        // Update Password
        'updatePw.deniedTitle': 'Access Denied',
        'updatePw.deniedDesc': 'Invalid or expired link.',
        'updatePw.mismatchTitle': 'Passwords do not match',
        'updatePw.mismatchDesc': 'Make sure both passwords are the same.',
        'updatePw.shortTitle': 'Password too short',
        'updatePw.shortDesc': 'Password must be at least 6 characters.',
        'updatePw.successTitle': 'Password changed successfully!',
        'updatePw.successDesc': 'Please log in with your new password.',
        'updatePw.failedTitle': 'Failed to change password',
        'updatePw.failedDesc': 'An error occurred.',
        'updatePw.title': 'Create New Password',
        'updatePw.subtitle': 'Enter your new password below.',
        'updatePw.newPassword': 'New Password',
        'updatePw.confirmPassword': 'Confirm Password',
        'updatePw.btn': 'Change Password',

        // Other common words
        'common.loading': 'Loading...',
    }
};
