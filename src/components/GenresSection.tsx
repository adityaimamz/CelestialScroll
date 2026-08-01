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
      const { data, error } = await supabase
        .from("novel_genres")
        .select(`
          novel:novels!inner (
            *,
            chapters_count:chapters(count),
            latest_chapters:chapters(created_at, language)
          )
        `)
        .eq("novel.is_published", true)
        .neq("novel_id", "00000000-0000-0000-0000-000000000000")
        .eq("genre_id", activeGenre)
        .eq("novel.chapters.language", "id") // Only count 'id' language chapters
        .eq("novel.latest_chapters.language", "id") // Only fetch 'id' for latest
        .order("created_at", { foreignTable: "novel.latest_chapters", ascending: false })
        .limit(1, { foreignTable: "novel.latest_chapters" })
        .limit(8);

      if (error) throw error;
      if (!data) return [];

      // Extract the novel objects from the junction result
      let formattedNovels = data.map((item: any) => {
        const novel = item.novel;
        if (!novel) return null;

        const countArr = novel.chapters_count || [];
        const chapters_count = countArr?.[0]?.count || 0;

        const latestArr = novel.latest_chapters || [];
        const latest_date = latestArr.length > 0 ? latestArr[0].created_at : null;

        return {
          ...novel,
          chapters_count: chapters_count,
          latest_chapter_date: latest_date || null,
          has_id: chapters_count > 0
        };
      }).filter(Boolean);

      // Hanya tampilkan yang mempunyai chapter indonesia
      return formattedNovels.filter((n: any) => n.has_id);
    },
    enabled: !!activeGenre,
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
