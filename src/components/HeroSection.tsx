import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import heroBanner from "@/assets/hero-banner.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BarLoader } from "@/components/ui/BarLoader";

type Novel = Tables<"novels"> & {
  chapters_count?: number;
};

const HeroSection = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchFeaturedNovels();
  }, []);

  const fetchFeaturedNovels = async () => {
    try {
      // Fetch a batch of novels to randomize
      const { data, error } = await supabase
        .from("novels")
        .select("*, chapters(count)")
        .limit(10) // Fetch top 10 then we can shuffle or just display them
        .eq("chapters.language", "id")
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      if (data) {
        // Randomize the order of novels
        const shuffled = data.sort(() => 0.5 - Math.random());
        const formattedNovels = shuffled.map((novel: any) => ({
          ...novel,
          chapters_count: novel.chapters?.[0]?.count || 0,
        }));
        setNovels(formattedNovels.slice(0, 5)); // Take top 5 random ones
      }
    } catch (error) {
      console.error("Error fetching hero novels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-muted/20">
        <BarLoader />
      </section>
    );
  }

  if (novels.length === 0) return null;

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] overflow-hidden group">
      <Carousel
        opts={{
          loop: true,
          duration: 60,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="-ml-0">
          {novels.map((novel, index) => (
            <CarouselItem key={novel.id} className="pl-0 relative min-h-[500px] md:min-h-[600px]">
              {/* Background Image - Atmospheric Blur Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={novel.cover_url || heroBanner}
                  alt={novel.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  className="w-full h-full object-cover object-center blur-sm scale-110 brightness-[0.4] transition-all duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = heroBanner;
                  }}
                />

                {/* Texture Overlay (Dot Pattern) */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{ background: "var(--gradient-hero)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, hsl(var(--background)) 5%, transparent 50%), linear-gradient(to right, hsl(var(--background)) 10%, transparent 60%)"
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative section-container h-full flex items-center py-16 md:py-24 min-h-[500px] md:min-h-[600px]">
                <div className="max-w-xl animate-fade-in space-y-4">
                  <span className="status-badge status-badge-ongoing mb-2 inline-block capitalize">
                    {novel.status}
                  </span>

                  <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                    {novel.title}
                  </h1>

                  <p className="text-muted-foreground text-base md:text-lg mb-6 line-clamp-3">
                    {novel.description}
                  </p>

                  <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="text-accent font-semibold">{novel.rating || "N/A"}</span>
                      ★ {t("hero.rating")}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span>{novel.chapters_count || 0} {t("nav.chapters")}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="hero" size="lg" asChild className="btn-glow">
                      <Link to={`/series/${novel.slug}`}>{t("hero.startReading")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation Buttons - Visible on desktop / hover */}
        <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarouselPrevious className="left-4 bg-background/20 hover:bg-background/40 border-none text-white h-12 w-12" />
          <CarouselNext className="right-4 bg-background/20 hover:bg-background/40 border-none text-white h-12 w-12" />
        </div>
      </Carousel>
    </section>
  );
};

export default HeroSection;
