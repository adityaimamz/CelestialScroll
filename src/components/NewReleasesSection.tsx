import { useEffect, useState } from "react";
import { BarLoader } from "@/components/ui/BarLoader";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/contexts/LanguageContext";

type Novel = Tables<"novels"> & {
  chapters_count?: number;
  latest_chapter_date?: string | null;
};
interface NewReleasesSectionProps {
  languageFilter?: string;
}

const NewReleasesSection = ({ languageFilter = "all" }: NewReleasesSectionProps) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchNewReleases();
  }, [languageFilter]);

  const fetchNewReleases = async () => {
    try {
      let query = supabase
        .from("novels")
        .select(`
          *,
          chapters_count:chapters(count),
          latest_chapters:chapters(created_at, language)
        `)
        .order("created_at", { ascending: false })
        .eq("is_published", true)
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .eq("chapters.language", "id")
        .eq("latest_chapters.language", "id")
        .order("created_at", { foreignTable: "latest_chapters", ascending: false })
        .limit(1, { foreignTable: "latest_chapters" });

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        let formattedNovels = data.map((novel: any) => {
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
        });

        // Tampilkan semua novel yang memiliki chapter indonesia
        formattedNovels = formattedNovels.filter((n: any) => n.has_id);

        // Resort by latest chapter date desc
        formattedNovels = formattedNovels.sort((a: any, b: any) => {
          const dateA = a.latest_chapter_date ? new Date(a.latest_chapter_date).getTime() : new Date(a.created_at).getTime();
          const dateB = b.latest_chapter_date ? new Date(b.latest_chapter_date).getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        setNovels(formattedNovels.slice(0, 6)); // limit to 6
      }
    } catch (error) {
      console.error("Error fetching new releases:", error);
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
