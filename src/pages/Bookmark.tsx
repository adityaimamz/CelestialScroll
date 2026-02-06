import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowUp, ArrowDown, Bookmark as BookmarkIcon } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { Link } from "react-router-dom";

// Defines the shape of data we get from the join
type BookmarkWithNovel = {
  id: string;
  created_at: string;
  novels: Tables<"novels"> & {
    chapters: { count: number }[]; // Because we fetch chapters(count)
  } | null;
};

// Flattened novel type for the card
type NovelDisplay = Tables<"novels"> & {
  chapters_count: number;
  bookmark_created_at: string;
};

const ITEMS_PER_PAGE = 10;
const SORT_OPTIONS = [
  { label: "Waktu Ditambahkan", value: "time_added" },
  { label: "Rating", value: "rating" },
  { label: "Chapter Terbaru", value: "latest_chapter" },
];

const Bookmark = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bookmarks, setBookmarks] = useState<NovelDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState<string>("time_added");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setLoading(false); // Not logged in
    }
  }, [user]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      // Fetch all bookmarks with related novel data
      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
            id,
            created_at,
            novels!inner (
                *,
                chapters (count)
            )
        `)
        .eq("user_id", user!.id)
        .eq("novels.is_published", true)
        .neq("novel_id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      // Transform data
      const formattedData: NovelDisplay[] = (data as unknown as BookmarkWithNovel[])
        .filter(item => item.novels) // Filter out if novel was deleted
        .map(item => ({
          ...item.novels!,
          chapters_count: item.novels!.chapters?.[0]?.count || 0,
          bookmark_created_at: item.created_at
        }));

      setBookmarks(formattedData);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Client-side Sorting & Pagination Logic
  const getProcessedData = () => {
    let sorted = [...bookmarks];

    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "time_added":
          comparison = new Date(a.bookmark_created_at).getTime() - new Date(b.bookmark_created_at).getTime();
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "latest_chapter":
          // Using updated_at as proxy for latest chapter update
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE);
  const currentData = getProcessedData();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4">
        <BookmarkIcon className="w-16 h-16 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold">Login Required</h1>
        <p className="text-muted-foreground">Please login to view your bookmarks.</p>
        <Link to="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-surface border-b border-border py-8">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-4">My Bookmarks</h1>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48 justify-between">
                  <span className="truncate">
                    {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SORT_OPTIONS.map(option => (
                  <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <SectionHeader title={`Saved Series (${bookmarks.length})`} />

        {loading ? (
          <div className="flex justify-center py-20">
            <BarLoader />
          </div>
        ) : bookmarks.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 mt-6">
              {currentData.map((novel) => (
                <NovelCard
                  key={novel.id}
                  title={novel.title}
                  cover={novel.cover_url || ""}
                  rating={novel.rating || 0}
                  status={novel.status as any}
                  chapters={novel.chapters_count}
                  genre={novel.genres?.[0] || "Unknown"}
                  size="medium"
                  id={novel.id}
                  slug={novel.slug}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <BookmarkIcon className="w-12 h-12 opacity-20" />
            <p>You haven't bookmarked any novels yet.</p>
            <Link to="/series">
              <Button variant="link">Browse Series</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmark;
