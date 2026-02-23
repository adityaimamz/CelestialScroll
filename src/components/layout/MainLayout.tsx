import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

import { FloatingDockNavigation } from "@/components/FloatingDockNavigation";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden max-w-[100vw]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingDockNavigation />
      <Footer />
    </div>
  );
};

export default MainLayout;
