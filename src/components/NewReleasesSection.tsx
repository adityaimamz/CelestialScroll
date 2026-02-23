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
        .select("*, chapters(count, language), latest_chapter:chapters(created_at, language)")
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "latest_chapter", ascending: false })
        .eq("is_published", true)
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (languageFilter !== "all") {
        query = query.eq("chapters.language", languageFilter).eq("latest_chapter.language", languageFilter);
      }

      const { data, error } = await query.limit(6);

      if (error) throw error;

      if (data) {
        const novelsWithChapterCount = data.map((novel: any) => ({
          ...novel,
          chapters_count: novel.chapters?.[0]?.count || 0,
          latest_chapter_date: novel.latest_chapter?.[0]?.created_at || null,
        }));
        setNovels(novelsWithChapterCount);
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
