
import HeroSection from "@/components/HeroSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import TopSeriesSection from "@/components/TopSeriesSection";
import PopularSection from "@/components/PopularSection";
import NewReleasesSection from "@/components/NewReleasesSection";
import GenresSection from "@/components/GenresSection";
import SneakPeeksSection from "@/components/SneakPeeksSection";
import RecentUpdatesSection from "@/components/RecentUpdatesSection";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <AnnouncementsSection />
      <TopSeriesSection />
      {/* <PopularSection /> */}
      <NewReleasesSection />
      <GenresSection />
      {/* <SneakPeeksSection /> */}
      <RecentUpdatesSection />
    </main>
  );
};

export default Index;
