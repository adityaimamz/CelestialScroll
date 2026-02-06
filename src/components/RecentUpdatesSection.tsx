import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "@/components/SectionHeader";

interface ChapterUpdate {
  id: string;
  title: string;
  chapter_number: number;
  published_at: string;
  novel_id: string;
  novels: {
    title: string;
    author: string;
    slug: string;
  } | null;
}

const RecentUpdatesSection = () => {
  const [updates, setUpdates] = useState<ChapterUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentUpdates();
  }, []);

  const fetchRecentUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select(`
          id,
          title,
          chapter_number,
          published_at,
          novel_id,
          novels!inner (
            title,
            author,
            slug,
            is_published
          )
        `)
        .eq("novels.is_published", true)
        .neq("novel_id", "00000000-0000-0000-0000-000000000000")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      setUpdates((data as any) || []);
    } catch (error) {
      console.error("Error fetching updates:", error);
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

  if (updates.length === 0) return null;

  return (
    <section className="section-spacing section-container">
      <SectionHeader
        title="Most Recently Updated"
        subtitle="Fresh chapters hot off the press"
        viewAllLink="/updates"
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Novel</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground hidden md:table-cell">Latest Chapter</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground hidden lg:table-cell">Author</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-foreground">Updated</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update, index) => (
                <tr
                  key={update.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-4">
                    <Link to={`/series/${update.novels?.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors block">
                      {update.novels?.title}
                    </Link>
                    <Link to={`/series/${update.novels?.slug}/${update.chapter_number}`} className="text-sm text-muted-foreground md:hidden mt-1 line-clamp-1 hover:text-primary">
                      Chapter {update.chapter_number}: {update.title}
                    </Link>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <Link to={`/series/${update.novels?.slug}/${update.chapter_number}`} className="text-sm text-muted-foreground line-clamp-1 hover:text-primary">
                      Chapter {update.chapter_number}: {update.title}
                    </Link>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="text-sm">
                      <span className="text-foreground">{update.novels?.author || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {update.published_at ? formatDistanceToNow(new Date(update.published_at), { addSuffix: true }) : "Recently"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RecentUpdatesSection;
