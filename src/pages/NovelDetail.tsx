import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, BookOpen, Clock, Tag, ChevronLeft, List, Info, PlayCircle, Loader2, Search, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

import { useAuth } from "@/components/auth/AuthProvider";
import CommentsSection from "@/components/CommentsSection";

type Novel = Tables<"novels">;
type Chapter = Tables<"chapters">;
type ReadingHistory = Tables<"reading_history">;

const NovelDetail = () => {
  const { id } = useParams(); // 'id' acts as 'slug' here
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [readChapterIds, setReadChapterIds] = useState<Set<string>>(new Set());
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  // Chapter List State
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [chapterSortOrder, setChapterSortOrder] = useState<"asc" | "desc">("desc");
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchNovelAndChapters(id);
    }
  }, [id]);

  useEffect(() => {
    if (novel?.id && user) {
      checkBookmarkStatus(novel.id);
      fetchUserRating(novel.id);
      fetchReadingHistory(novel.id);
    }
  }, [novel?.id, user]);

  const fetchNovelAndChapters = async (slug: string) => {
    try {
      // 1. Fetch Novel by Slug
      const { data: novelData, error: novelError } = await supabase
        .from("novels")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (novelError) throw novelError;
      if (!novelData) {
        toast({
          title: "Not Found",
          description: "Novel not found",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Optimistically update views locally
      setNovel({ ...novelData, views: novelData.views + 1 });

      // Increment Views in DB
      const { error: viewError } = await supabase.rpc('increment_novel_views', { _novel_id: novelData.id });
      if (viewError) {
        console.error("Failed to increment views:", viewError);
      }

      // Fetch Bookmark Count
      const { data: countData } = await supabase
        .rpc("get_novel_bookmark_count", { _novel_id: novelData.id });

      setBookmarkCount(countData || 0);

      // 2. Fetch Chapters using novel_id
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", novelData.id)
        .order("chapter_number", { ascending: false });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);

    } catch (error) {
      console.error("Error fetching novel details:", error);
      toast({
        title: "Error",
        description: "Failed to load novel details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async (novelId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("novel_id", novelId)
      .maybeSingle();
    setIsFavorite(!!data);
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to bookmark novels." });
      return;
    }
    if (!novel) return;

    const fetchBookmarkCount = async () => {
      const { data: countData } = await supabase
        .rpc("get_novel_bookmark_count", { _novel_id: novel!.id });
      setBookmarkCount(countData || 0);
    };

    try {
      if (isFavorite) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("novel_id", novel.id);
        setIsFavorite(false);
        await fetchBookmarkCount(); // Re-fetch from DB
        toast({ title: "Removed", description: "Removed from your library." });
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, novel_id: novel.id });
        setIsFavorite(true);
        await fetchBookmarkCount(); // Re-fetch from DB
        toast({ title: "Added", description: "Added to your library." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update bookmark.", variant: "destructive" });
    }
  };

  const fetchUserRating = async (novelId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("novel_ratings")
      .select("rating_value")
      .eq("user_id", user.id)
      .eq("novel_id", novelId)
      .maybeSingle();
    if (data) setUserRating(data.rating_value);
  };

  const handleRate = async (value: number) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to rate novels." });
      return;
    }
    if (!novel) return;

    setIsRatingLoading(true);
    try {
      const { error } = await supabase.from("novel_ratings").upsert({
        user_id: user.id,
        novel_id: novel.id,
        rating_value: value
      }, {
        onConflict: "user_id, novel_id"
      });

      if (error) throw error;

      setUserRating(value);
      toast({ title: "Rated", description: `You rated this novel ${value} stars.` });

      // Optionally refetch novel to update average rating instantly, or let the trigger handle it eventually?
      // The trigger updates the `novels` table, but we need to re-fetch `novel` state to see standard changes.
      const { data } = await supabase.from("novels").select("rating").eq("id", novel.id).single();
      if (data) setNovel(prev => prev ? ({ ...prev, rating: data.rating }) : null);

    } catch (error) {
      toast({ title: "Error", description: "Failed to submit rating.", variant: "destructive" });
    } finally {
      setIsRatingLoading(false);
    }
  };

  const fetchReadingHistory = async (novelId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("reading_history")
      .select("chapter_id")
      .eq("user_id", user.id)
      .eq("novel_id", novelId);

    if (data) {
      const ids = new Set(data.map(item => item.chapter_id));
      setReadChapterIds(ids);
    }
  };

  // Filter and Sort Chapters
  const getProcessedChapters = () => {
    let filtered = [...chapters];

    if (chapterSearchQuery) {
      const query = chapterSearchQuery.trim();
      // Check if query is a number
      const isNumber = /^\d+$/.test(query);

      if (isNumber) {
        // Exact match for chapter number
        const num = parseInt(query);
        filtered = filtered.filter(ch => ch.chapter_number === num);
      } else {
        // Fuzzy match for title
        filtered = filtered.filter(ch => ch.title.toLowerCase().includes(query.toLowerCase()));
      }
    }

    // Sort
    filtered.sort((a, b) => {
      const diff = a.chapter_number - b.chapter_number;
      return chapterSortOrder === "asc" ? diff : -diff;
    });

    return filtered;
  };

  const processedChapters = getProcessedChapters();

  const handleReadNow = () => {
    if (chapters.length > 0) {
      // Find the first chapter (lowest chapter number)
      const firstChapter = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number)[0];
      navigate(`/series/${id}/chapter/${firstChapter.chapter_number}`);
    } else {
      toast({
        title: "No Chapters",
        description: "No chapters available to read yet.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4">
        <h1 className="text-2xl font-bold">Novel Not Found</h1>
        <Button asChild>
          <Link to="/series">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner & Header */}
      <div className="relative h-[300px] md:h-[400px]">
        <div className="absolute inset-0">
          <img
            src={novel.cover_url || "/placeholder.jpg"}
            alt="Banner"
            className="w-full h-full object-cover blur-sm opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 z-10">
          <Link to="/series">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>

      <div className="section-container relative z-20 -mt-48 flex flex-col md:flex-row gap-8 items-center md:items-end">
        {/* Cover Image */}
        <div className="w-40 md:w-52 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden border-4 border-background">
          <img
            src={novel.cover_url || "/placeholder.jpg"}
            alt={novel.title}
            className="w-full h-auto object-cover aspect-[2/3]"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left text-foreground mb-0 md:mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{novel.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">By <span className="text-primary font-medium">{novel.author || "Unknown"}</span></p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 group relative">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <span className="font-bold text-lg">{novel.rating || "N/A"}</span>

                {/* Hover Rating Popup */}
                <div className="absolute top-8 left-0 bg-popover border border-border p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      disabled={isRatingLoading}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${star <= userRating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{chapters.length} Chapters</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="capitalize">{novel.status}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              {/* Views could be implemented later if we track them per page load */}
              <span className="text-sm">({novel.views} views)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span>{bookmarkCount} Bookmarks</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {novel.genres?.map((genre) => (
              <Badge key={genre} variant="secondary" className="px-3 py-1">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex justify-center md:justify-start gap-3">
            <Button size="lg" className="w-40 gap-2 btn-glow" onClick={handleReadNow}>
              <PlayCircle className="w-5 h-5" />
              Read Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`gap-2 border-0 shadow-sm ${isFavorite
                  ? "bg-white text-destructive border border-destructive hover:bg-destructive/10"
                  : "bg-white text-primary hover:bg-white/90"
                }`}
              onClick={toggleBookmark}
            >
              <Tag className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Saved" : "Add to Library"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="section-container mt-12">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="about" className="gap-2">
              <Info className="w-4 h-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2">
              <List className="w-4 h-4" />
              Chapters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="animate-fade-in">
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {novel.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="animate-fade-in">
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="font-medium text-muted-foreground mr-auto">Total {chapters.length} chapters</span>

                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search chapter..."
                      className="pl-10 h-9 bg-background"
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => setChapterSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    title={chapterSortOrder === "asc" ? "Oldest First" : "Newest First"}
                  >
                    {chapterSortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {processedChapters.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {chapters.length === 0 ? "No chapters uploaded yet." : "No chapters found matching your search."}
                  </div>
                ) : (
                  processedChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center group cursor-pointer"
                      onClick={() => navigate(`/series/${id}/chapter/${chapter.chapter_number}`)}
                    >
                      <div>
                        <h4 className={`font-medium group-hover:text-primary transition-colors ${readChapterIds.has(chapter.id) ? "text-purple-500" : ""}`}>
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {chapter.published_at ? formatDistanceToNow(new Date(chapter.published_at), { addSuffix: true }) : "Draft"}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Read
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="section-container mt-28 md:mt-24">
        <CommentsSection novelId={novel.id} />
      </div>
    </div>
  );
};

export default NovelDetail;
