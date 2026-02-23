import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Novel = Tables<"novels"> & {
  chapters_count?: number;
};

const PopularSection = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [timeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { t, languageFilter } = useLanguage();

  useEffect(() => {
    fetchPopularNovels();
  }, [timeFilter, languageFilter]);

  const fetchPopularNovels = async () => {
    setLoading(true);
    try {
      // For now, we only have 'views' which is effectively "All Time"
      // In a real app with 'novel_stats' table, we could filter by date.
      let query = supabase
        .from("novels")
        .select("*, chapters(count)")
        .order("views", { ascending: false })
        .eq("is_published", true)
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (languageFilter) {
        query = query.eq("chapters.language", languageFilter);
      }

      const { data, error } = await query.limit(6);

      if (error) throw error;

      if (data) {
        const novelsWithChapterCount = data.map(novel => ({
          ...novel,
          chapters_count: novel.chapters?.[0]?.count || 0,
        }));
        setNovels(novelsWithChapterCount);
      }
    } catch (error) {
      console.error("Error fetching popular novels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && novels.length === 0) {
    return <div className="w-full h-96 bg-card/50 animate-pulse rounded-lg" />;
  }

  if (novels.length === 0) return null;

  const featured = novels[0];
  const listItems = novels.slice(1);

  return (
    <div className="w-full bg-card rounded-xl p-6 border border-border shadow-sm h-fit" id="popular">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {t("popular.title")}
        </h2>
      </div>

      {/* Time Filter Tabs */}
      {/* <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg">
        {[
          { label: 'Weekly', value: 'week' },
          { label: 'Monthly', value: 'month' },
          { label: 'All time', value: 'all' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setTimeFilter(filter.value)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === filter.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div> */}

      {/* Featured Item (#1) */}
      <Link to={`/series/${featured.slug}`} className="block mb-6 relative rounded-lg overflow-hidden group cursor-pointer aspect-video md:aspect-[4/3] lg:aspect-video">
        <div className="absolute inset-0">
          <img
            src={featured.cover_url || "/placeholder.jpg"}
            alt={featured.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
            {t("popular.ranking")}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {featured.title}
          </h3>
          <div className="flex items-center gap-2 text-white/70 text-xs mt-2">
            <BookOpen className="w-3 h-3" />
            <span>{featured.chapters_count} {t("popular.chapters")}</span>
            <span>•</span>
            <span className="text-yellow-500">★ {featured.rating?.toFixed(1) || "N/A"}</span>
            <span>•</span>
            <span>{featured.views.toLocaleString()} {t("popular.views")}</span>
          </div>
        </div>
      </Link>

      {/* Ranking List (#2-6) */}
      <div className="flex flex-col gap-3">
        {listItems.map((novel, index) => (
          <Link
            key={novel.id}
            to={`/series/${novel.slug}`}
            className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* Rank */}
            <div className="text-xl font-bold text-muted-foreground/50 min-w-[1.5rem] text-center font-mono">
              {index + 2}
            </div>

            {/* Thumbnail */}
            <div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden shadow-sm border border-border/50">
              <img
                src={novel.cover_url || "/placeholder.jpg"}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {novel.title}
              </h4>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <BookOpen className="w-3 h-3" />
                  {novel.chapters_count}
                </span>
                <span className="flex items-center text-yellow-500 gap-1 bg-muted px-1.5 py-0.5 rounded">
                  ★ {novel.rating?.toFixed(1) || "N/A"}
                </span>
                {/* <span className="line-clamp-1 px-1.5 py-0.5">
                  {(novel.genres as string[])?.[0]}
                </span> */}
                <span className="text-[10px] ml-auto">
                  {novel.views.toLocaleString()} {t("popular.views")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border text-center">
        <Link to="/series/rankings" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          {t("popular.viewFull")}
        </Link>
      </div>
    </div>
  );
};

export default PopularSection;
