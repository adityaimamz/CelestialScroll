import { BarLoader } from "@/components/ui/BarLoader";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

type Novel = Tables<"novels"> & {
  chapters_count?: number;
  latest_chapter_date?: string | null;
};
interface NewReleasesSectionProps {
  languageFilter?: string;
}

const NewReleasesSection = ({ languageFilter = "all" }: NewReleasesSectionProps) => {
  const { t } = useLanguage();

  const { data: novels = [], isLoading } = useQuery({
    queryKey: ["new-releases", languageFilter],
    queryFn: async () => {
      // Step 1: Get novels
      const { data: novelsData, error: novelsError } = await supabase
        .from("novels")
        .select("id, title, cover_url, rating, status, slug, updated_at, created_at")
        .eq("is_published", true)
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .order("created_at", { ascending: false })
        .limit(20); // Fetch more to filter later

      if (novelsError) throw novelsError;
      if (!novelsData) return [];

      const novelIds = novelsData.map(n => n.id);

      // Step 2: Get chapters data separately
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("novel_id, created_at")
        .eq("language", "id")
        .in("novel_id", novelIds)
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

      // Format and filter
      let formattedNovels = novelsData
        .map(novel => ({
          ...novel,
          chapters_count: novelStats[novel.id]?.count || 0,
          latest_chapter_date: novelStats[novel.id]?.latest_date || null,
          has_id: (novelStats[novel.id]?.count || 0) > 0
        }))
        .filter(n => n.has_id);

      // Sort by latest chapter date
      formattedNovels = formattedNovels.sort((a, b) => {
        const dateA = a.latest_chapter_date ? new Date(a.latest_chapter_date).getTime() : new Date(a.created_at).getTime();
        const dateB = b.latest_chapter_date ? new Date(b.latest_chapter_date).getTime() : new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      return formattedNovels.slice(0, 6);
    },
    staleTime: 2 * 60 * 1000, // Cache 2 minutes - new releases
    gcTime: 5 * 60 * 1000, // Keep in memory 5 minutes
  });

  if (isLoading) {
    return (
      <section className="section-spacing section-container flex justify-center py-10">
        <BarLoader />
      </section>
    );
  }

  if (novels.length === 0) return null;

  return (
    <section className="section-spacing" id="new">
      <SectionHeader
        title={t("newReleases.title")}
        subtitle={t("newReleases.subtitle")}
        viewAllLink="/series"
      />

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {novels.map((novel) => (
          <NovelCard
            key={novel.id}
            id={novel.id}
            slug={novel.slug}
            title={novel.title}
            cover={novel.cover_url || ""}
            rating={novel.rating || 0}
            status={novel.status as any}
            chapters={novel.chapters_count || 0}
            // genre={novel.genres?.[0] || "Unknown"}
            size="medium"
            lastUpdate={novel.latest_chapter_date || novel.updated_at}
          />
        ))}
      </div>
    </section>
  );
};

export default NewReleasesSection;
