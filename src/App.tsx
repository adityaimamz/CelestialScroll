import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AuthListener } from "@/components/auth/AuthListener";
import CommentReports from "./pages/admin/CommentReports";

// Public pages
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import NovelDetail from "./pages/NovelDetail";
import ChapterReader from "./pages/ChapterReader";
import Bookmark from "./pages/Bookmark";
import Genres from "./pages/Genres";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Settings from "./pages/Settings";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import NovelList from "./pages/admin/NovelList";
import NovelForm from "./pages/admin/NovelForm";
import ChapterList from "./pages/admin/ChapterList";
import ChapterForm from "./pages/admin/ChapterForm";
import UserList from "./pages/admin/UserList";
import GenresList from "./pages/admin/GenresList";
import AnnouncementsList from "./pages/admin/AnnouncementsList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthListener />
            <ScrollToTop />
            <Routes>
              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/series" element={<Catalog />} />
                <Route path="/series/:id" element={<NovelDetail />} />
                <Route path="/bookmarks" element={<Bookmark />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/settings" element={<Settings />} />
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
                  <Route path="/admin/reports" element={<CommentReports />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
