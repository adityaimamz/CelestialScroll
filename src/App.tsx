import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollButtons from "@/components/ScrollButtons";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AuthListener } from "@/components/auth/AuthListener";
import FollowCursor from "@/components/ui/FollowCursor";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Public pages
const Index = lazy(() => import("./pages/Index"));
const Catalog = lazy(() => import("./pages/Catalog"));
const NovelDetail = lazy(() => import("./pages/NovelDetail"));
const ChapterReader = lazy(() => import("./pages/ChapterReader"));
const Bookmark = lazy(() => import("./pages/Bookmark"));
const Rankings = lazy(() => import("./pages/Rankings"));
const Genres = lazy(() => import("./pages/Genres"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RequestNovel = lazy(() => import("./pages/RequestNovel"));

// Auth pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/auth/UpdatePassword"));
const Settings = lazy(() => import("./pages/Settings"));

// Admin pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const NovelList = lazy(() => import("./pages/admin/NovelList"));
const NovelForm = lazy(() => import("./pages/admin/NovelForm"));
const ChapterList = lazy(() => import("./pages/admin/ChapterList"));
const ChapterForm = lazy(() => import("./pages/admin/ChapterForm"));
const UserList = lazy(() => import("./pages/admin/UserList"));
const GenresList = lazy(() => import("./pages/admin/GenresList"));
const AnnouncementsList = lazy(() => import("./pages/admin/AnnouncementsList"));
const CommentReports = lazy(() => import("./pages/admin/CommentReports"));
const ChapterReports = lazy(() => import("./pages/admin/ChapterReports"));
const Activity = lazy(() => import("./pages/admin/Activity"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));

import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthListener />
              <ScrollToTop />
              <ScrollButtons />
              <div className="hidden md:block">
                <FollowCursor color="#19202f" zIndex={50} />
              </div>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Public Routes with MainLayout */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/series" element={<Catalog />} />
                    <Route path="/series/:id" element={<NovelDetail />} />
                    <Route path="/bookmarks" element={<Bookmark />} />
                    <Route path="/series/rankings" element={<Rankings />} />
                    <Route path="/genres" element={<Genres />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/request" element={<RequestNovel />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Reader Route (No MainLayout/Navbar/Footer) */}
                  <Route path="/series/:id/chapter/:chapterId" element={<ChapterReader />} />

                  {/* Admin Routes - Protected */}
                  <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<Dashboard />} />
                      <Route path="/admin/novels" element={<NovelList />} />
                      <Route path="/admin/novels/new" element={<NovelForm />} />
                      <Route path="/admin/novels/:id/edit" element={<NovelForm />} />
                      <Route path="/admin/novels/:novelId/chapters" element={<ChapterList />} />
                      <Route path="/admin/novels/:novelId/chapters/new" element={<ChapterForm />} />
                      <Route path="/admin/novels/:novelId/chapters/:chapterId/edit" element={<ChapterForm />} />
                      <Route path="/admin/users" element={<UserList />} />
                      <Route path="/admin/genres" element={<GenresList />} />
                      <Route path="/admin/announcements" element={<AnnouncementsList />} />
                      <Route path="/admin/reports/comments" element={<CommentReports />} />
                      <Route path="/admin/reports/chapters" element={<ChapterReports />} />
                      <Route path="/admin/activity" element={<Activity />} />
                      <Route path="/admin/logs" element={<AdminLogs />} /> {/* New logs route */}
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
              <Analytics />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
