import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { HoverEffect } from "@/components/ui/card-hover-effect";

interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  novel_genres: {
    novels: {
      is_published: boolean;
    } | null;
  }[];
}

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase
          .from("genres")
          .select("*, novel_genres(novels(is_published))")
          .order("name");

        if (error) throw error;
        setGenres((data as any) || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform genres to the format expected by HoverEffect
  const items = genres.map((genre) => {
    // Filter and count only published novels manually
    const publishedCount = genre.novel_genres?.filter(
      (ng) => ng.novels?.is_published === true
    ).length || 0;

    return {
      title: genre.name,
      description: `${genre.description || "No description available."}`,
      novels: `${publishedCount} Novels`,
      link: `/series?genre=${genre.slug}`,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-center">Popular Genres</h1>
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto">
          Explore our vast collection of novels by genre. From action-packed martial arts to
          mystical cultivation journeys, find your next favorite story.
        </p>
      </div>

      <HoverEffect items={items} />

      {genres.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No genres found.
        </div>
      )}
    </div>
  );
};

export default Genres;
