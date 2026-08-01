import { useEffect, useState } from "react";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { BarLoader } from "@/components/ui/BarLoader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

type Genre = Tables<"genres">;
type Novel = Tables<"novels"> & {
  chapters_count?: number;
  latest_chapter_date?: string | null;
};

const GenresSection = () => {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const { t, languageFilter } = useLanguage();

  // Fetch Genres
  const { data: genres = [], isLoading: isGenresLoading } = useQuery({
    queryKey: ["genres-with-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("genres")
        .select("*, novel_genres(count)");

      if (error) throw error;
      if (!data) return [];

      const sortedGenres = data
        .map(g => ({
          ...g,
          count: g.novel_genres?.[0]?.count || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return sortedGenres;
    },
    staleTime: 10 * 60 * 1000, // Cache 10 minutes - genres rarely change
    gcTime: 30 * 60 * 1000, // Keep in memory 30 minutes
  });

  // Set default activeGenre when genres are loaded
  useEffect(() => {
    if (genres.length > 0 && !activeGenre) {
      setActiveGenre(genres[0].id);
    }
  }, [genres, activeGenre]);

  // Fetch Novels when activeGenre changes
  const { data: novels = [], isLoading: isNovelsLoading } = useQuery({
    queryKey: ["novels-by-genre", activeGenre, languageFilter],
    queryFn: async () => {
      if (!activeGenre) return [];
      
      // Step 1: Get novel IDs for this genre
      const { data: novelGenresData, error: ngError } = await supabase
        .from("novel_genres")
        .select("novel_id")
        .eq("genre_id", activeGenre)
        .neq("novel_id", "00000000-0000-0000-0000-000000000000");

      if (ngError) throw ngError;
      if (!novelGenresData || novelGenresData.length === 0) return [];

      const novelIds = novelGenresData.map(ng => ng.novel_id);

      // Step 2: Get novels data
      const { data: novelsData, error: novelsError } = await supabase
        .from("novels")
        .select("id, title, cover_url, rating, status, slug, updated_at")
        .eq("is_published", true)
        .in("id", novelIds)
        .limit(8);

      if (novelsError) throw novelsError;
      if (!novelsData) return [];

      // Step 3: Get chapter counts and latest dates separately
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("novel_id, created_at")
        .eq("language", "id")
        .in("novel_id", novelsData.map(n => n.id))
        .order("created_at", { ascending: false });

      if (chaptersError) throw chaptersError;

      // Process chapter data
      const novelStats = (chaptersData || []).reduce((acc, ch) => {
        if (!acc[ch.novel_id]) {
          acc[ch.novel_id] = {
            count: 0,
            latest_date: ch.created_at
          };
        }
        acc[ch.novel_id].count++;
        return acc;
      }, {} as Record<string, { count: number; latest_date: string }>);

      // Combine and filter
      const formattedNovels = novelsData
        .map(novel => ({
          ...novel,
          chapters_count: novelStats[novel.id]?.count || 0,
          latest_chapter_date: novelStats[novel.id]?.latest_date || null,
          has_id: (novelStats[novel.id]?.count || 0) > 0
        }))
        .filter(n => n.has_id)
        .sort((a, b) => {
          const dateA = a.latest_chapter_date ? new Date(a.latest_chapter_date).getTime() : 0;
          const dateB = b.latest_chapter_date ? new Date(b.latest_chapter_date).getTime() : 0;
          return dateB - dateA;
        });

      return formattedNovels;
    },
    enabled: !!activeGenre,
    staleTime: 3 * 60 * 1000, // Cache 3 minutes - novels by genre
    gcTime: 10 * 60 * 1000, // Keep in memory 10 minutes
  });

  if (isGenresLoading) return null;
  if (genres.length === 0) return null;

  return (
    <section className="section-spacing" id="genres">
      <SectionHeader
        title={t("genres.title")}
        subtitle={t("genres.subtitle")}
        viewAllLink="/genres"
      />

      {/* Genre Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeGenre === genre.id
              ? "bg-primary text-primary-foreground shadow-glow-primary"
              : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Genre Novels Grid */}
      {isNovelsLoading ? (
        <div className="h-64 flex items-center justify-center">
          <BarLoader />
        </div>
      ) : novels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {novels.map((novel) => (
            <NovelCard
              key={novel.id}
              id={novel.id}
              title={novel.title}
              cover={novel.cover_url || ""}
              rating={novel.rating || 0}
              status={novel.status as any}
              chapters={novel.chapters_count || 0}
              size="auto"
              slug={novel.slug}
              lastUpdate={novel.latest_chapter_date || novel.updated_at}
            />
          ))}
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <p>{t("genres.noNovels")}</p>
        </div>
      )}
    </section>
  );
};

export default GenresSection;
