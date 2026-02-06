import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import SectionHeader from "@/components/SectionHeader";
import { BarLoader } from "./ui/BarLoader";

type Novel = Tables<"novels">;

const GRADIENTS = [
  "from-violet-900/80 to-purple-900/80",
  "from-blue-900/80 to-cyan-900/80",
  "from-amber-900/80 to-orange-900/80",
  "from-emerald-900/80 to-teal-900/80",
];

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TopSeriesSection = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopSeries();
  }, []);

  const fetchTopSeries = async () => {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .order("rating", { ascending: false })
        .eq("is_published", true)
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .limit(6); // Increased limit slightly since it's scrollable

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error("Error fetching top series:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-spacing section-container flex justify-center py-10">
        <BarLoader />
      </section>
    );
  }

  if (novels.length === 0) return null;

  return (
    <section className="section-spacing section-container" id="popular">
      <SectionHeader
        title="Top Series"
        subtitle="Series with highest ratings"
        viewAllLink="/series"
      />

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {novels.map((novel, index) => (
            <CarouselItem key={novel.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
              <div
                className={`relative overflow-hidden rounded-xl h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} border border-border/50 group cursor-pointer transition-all duration-300 hover:shadow-card flex flex-col sm:flex-row`}
              >
                {/* Cover Image - Left Side */}
                <div className="w-full sm:w-1/3 h-48 sm:h-auto relative shrink-0 overflow-hidden">
                  {novel.cover_url ? (
                    <img
                      src={novel.cover_url}
                      alt={novel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/20 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}

                  {/* Gradient Overlay for text readability on mobile if stacked, or just style */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
                </div>

                {/* Content - Right Side */}
                <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="genre-pill capitalize text-xs">
                        {novel.genres?.[0] || "Fantasy"}
                      </span>
                      {novel.rating && (
                        <span className="text-xs font-medium text-yellow-500 flex items-center gap-1">
                          ★ {novel.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {novel.title}
                    </h3>
                    <p className="text-sm text-white/80 mb-4 line-clamp-2">
                      {novel.description}
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" asChild className="w-fit">
                    <Link to={`/series/${novel.slug}`}>Learn More</Link>
                  </Button>

                  {/* Decorative gradient inside the content area */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="-left-4 lg:-left-12" />
          <CarouselNext className="-right-4 lg:-right-12" />
        </div>
      </Carousel>
    </section>
  );
};

export default TopSeriesSection;
