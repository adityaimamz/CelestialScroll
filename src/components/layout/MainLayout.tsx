import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import AnnouncementBanner from "../AnnouncementBanner";
import { FloatingDockNavigation } from "@/components/FloatingDockNavigation";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-clip max-w-[100vw]">
      <Navbar />
      <div className="sticky top-0 z-40 w-full">
        <AnnouncementBanner />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingDockNavigation />
      <Footer />
    </div>
  );
};

export default MainLayout;
