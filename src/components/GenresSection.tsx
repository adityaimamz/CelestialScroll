import { useEffect, useState } from "react";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type Genre = Tables<"genres">;
type Novel = Tables<"novels"> & {
  chapters: { count: number }[];
};

const GenresSection = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [novelsLoading, setNovelsLoading] = useState(false);

  // Fetch Genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase
          .from("genres")
          .select("*, novel_genres(count)");

        if (error) throw error;

        if (data && data.length > 0) {
          const sortedGenres = data
            .map(g => ({
              ...g,
              count: g.novel_genres?.[0]?.count || 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setGenres(sortedGenres);
          if (sortedGenres.length > 0) {
            setActiveGenre(sortedGenres[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Fetch Novels when activeGenre changes
  useEffect(() => {
    if (!activeGenre) return;

    const fetchNovelsByGenre = async () => {
      setNovelsLoading(true);
      try {
        // Query novels through the junction table
        const { data, error } = await supabase
          .from("novel_genres")
          .select(`
            novel:novels (
              *,
              chapters (count)
            )
          `)
          .eq("genre_id", activeGenre)
          .limit(8);

        if (error) throw error;

        // Extract the novel objects from the junction result
        const formattedNovels = data.map((item: any) => item.novel).filter(Boolean);
        setNovels(formattedNovels);
      } catch (error) {
        console.error("Error fetching novels for genre:", error);
      } finally {
        setNovelsLoading(false);
      }
    };

    fetchNovelsByGenre();
  }, [activeGenre]);

  if (loading) return null;
  if (genres.length === 0) return null;

  return (
    <section className="section-spacing" id="genres">
      <SectionHeader
        title="Popular Genres"
        subtitle="Explore stories by category"
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
      {novelsLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              chapters={novel.chapters?.[0]?.count || 0}
              size="large"
              slug={novel.slug}
              lastUpdate={novel.updated_at}
            />
          ))}
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <p>No novels found in this genre yet.</p>
        </div>
      )}
    </section>
  );
};

export default GenresSection;
