import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import TopSeriesSection from "@/components/TopSeriesSection";
import PopularSection from "@/components/PopularSection";
import NewReleasesSection from "@/components/NewReleasesSection";
import GenresSection from "@/components/GenresSection";
import RecentUpdatesSection from "@/components/RecentUpdatesSection";
import RecentlyReadSection from "@/components/RecentlyReadSection";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");

      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };

      if (!scrollToElement()) {
        // Retry for async content
        const intervalId = setInterval(() => {
          if (scrollToElement()) {
            clearInterval(intervalId);
          }
        }, 100);

        // Stop retrying after 2 seconds
        setTimeout(() => clearInterval(intervalId), 2000);
      }
    }
  }, [location]);

  return (
    <main>
      <HeroSection />
      <AnnouncementsSection />
      <RecentlyReadSection />
      <TopSeriesSection />

      <div className="section-container grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-8">
          <NewReleasesSection />
          <GenresSection />
        </div>

        <div className="lg:col-span-1">
          <PopularSection />
        </div>
      </div>

      <RecentUpdatesSection />

      {/* <SneakPeeksSection /> */}
    </main>
  );
};

export default Index;
