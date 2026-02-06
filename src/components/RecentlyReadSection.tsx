
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

// Define the type for the joined data
type ReadingHistoryEntry = {
    read_at: string;
    chapter_id: string;
    novel_id: string;
    novels: {
        title: string;
        cover_url: string | null;
        slug: string;
    } | null;
    chapters: {
        chapter_number: number;
        title: string;
    } | null;
};

const RecentlyReadSection = () => {
    const { user } = useAuth();
    const [recentlyRead, setRecentlyRead] = useState<ReadingHistoryEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentlyRead = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("reading_history")
                    .select(`
            read_at,
            chapter_id,
            novel_id,
            novels!inner (
              title,
              cover_url,
              slug
            ),
            chapters (
              chapter_number,
              title
            )
          `)
                    .eq("novels.is_published", true)
                    .neq("novel_id", "00000000-0000-0000-0000-000000000000")
                    .eq("user_id", user.id)
                    .order("read_at", { ascending: false })
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
                    console.error("Error fetching reading history:", error);
                }

                if (data) {
                    // Cast the data to our type. Supabase types can be tricky with joins.
                    setRecentlyRead(data as unknown as ReadingHistoryEntry);
                }
            } catch (error) {
                console.error("Unexpected error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyRead();
    }, [user]);

    if (loading) return null; // Or a skeleton if preferred
    if (!recentlyRead || !recentlyRead.novels || !recentlyRead.chapters) return null;

    const { novels: novel, chapters: chapter } = recentlyRead;

    return (
        <section className="section-container pb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Pick Up Where You Left Off</h3>
            </div>

            <Link
                to={`/series/${novel.slug}/chapter/${chapter.chapter_number}`}
                className="block group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
                <div className="flex flex-col sm:flex-row h-full">
                    {/* Image Section - Banner on mobile, Side on desktop */}
                    <div className="sm:w-48 h-32 sm:h-auto relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                        <img
                            src={novel.cover_url || "/placeholder.jpg"}
                            alt={novel.title}
                            className="w-full h-full object-cover sm:object-center object-top group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                            {novel.title}
                        </h4>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded text-xs font-medium">
                                <BookOpen className="w-3.5 h-3.5" />
                                Chapter {chapter.chapter_number}
                            </span>
                            <span className="text-xs opacity-75">
                                Last read {new Date(recentlyRead.read_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="mt-auto">
                            <span className="text-sm font-medium text-primary group-hover:underline decoration-primary/50 underline-offset-4">
                                Continue Reading →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </section>
    );
};

export default RecentlyReadSection;
