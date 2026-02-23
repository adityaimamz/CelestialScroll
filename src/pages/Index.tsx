import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import { useLanguage } from "@/contexts/LanguageContext";

const AnnouncementsSection = lazy(() => import("@/components/AnnouncementsSection"));
const TopSeriesSection = lazy(() => import("@/components/TopSeriesSection"));
const PopularSection = lazy(() => import("@/components/PopularSection"));
const NewReleasesSection = lazy(() => import("@/components/NewReleasesSection"));
const GenresSection = lazy(() => import("@/components/GenresSection"));
const RecentUpdatesSection = lazy(() => import("@/components/RecentUpdatesSection"));
const RequestSection = lazy(() => import("@/components/RequestSection"));
const RecentlyReadSection = lazy(() => import("@/components/RecentlyReadSection"));

const SectionFallback = () => (
  <div className="section-container py-6">
    <div className="h-24 rounded-xl bg-muted/20" />
  </div>
);

const Index = () => {
  const location = useLocation();
  const [deferSections, setDeferSections] = useState(false);
  const { languageFilter } = useLanguage();

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

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setDeferSections(true));
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(() => setDeferSections(true), 200);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main>
      <HeroSection />

      {deferSections ? (
        <Suspense fallback={<SectionFallback />}>
          <AnnouncementsSection />
          <RecentlyReadSection />
          <TopSeriesSection />

          <div className="section-container grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            <div className="lg:col-span-2 space-y-8 min-w-0">
              <NewReleasesSection languageFilter={languageFilter} />
              <GenresSection />
            </div>

            <div className="lg:col-span-1 min-w-0">
              <PopularSection />
            </div>
          </div>

          <RecentUpdatesSection languageFilter={languageFilter} />

          <RequestSection />
        </Suspense>
      ) : (
        <SectionFallback />
      )}

      {/* <SneakPeeksSection /> */}
    </main>
  );
};

export default Index;
