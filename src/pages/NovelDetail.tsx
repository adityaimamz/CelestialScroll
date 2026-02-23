import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, BookOpen, Clock, Tag, ChevronLeft, List, Info, PlayCircle, Search, ArrowUp, ArrowDown, Eye, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarLoader } from "@/components/ui/BarLoader";
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
import { useLanguage } from "@/contexts/LanguageContext";

type Novel = Tables<"novels">;
type Chapter = Tables<"chapters"> & { views: number };
type ReadingHistory = Tables<"reading_history">;

const NovelDetail = () => {
  const { id } = useParams(); // 'id' acts as 'slug' here
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, languageFilter } = useLanguage();

  const [chapterLangFilter, setChapterLangFilter] = useState(languageFilter);

  const { user, isAdmin } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [readChapterIds, setReadChapterIds] = useState<Set<string>>(new Set());
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [chapterSortOrder, setChapterSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersPerPage, setChaptersPerPage] = useState(20);
  const [totalChapterCount, setTotalChapterCount] = useState(0);
  const [indonesianChapterCount, setIndonesianChapterCount] = useState(0);
  const [firstChapterNumber, setFirstChapterNumber] = useState<number | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [lastReadChapterNumber, setLastReadChapterNumber] = useState<number | null>(null);
  useEffect(() => {
    const fetchFirstChapter = async () => {
      if (!novel) return;
      const { data: firstChapter } = await supabase
        .from("chapters")
        .select("chapter_number")
        .eq("novel_id", novel.id)
        .eq("language", chapterLangFilter)
        .order("chapter_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      setFirstChapterNumber(firstChapter?.chapter_number ?? null);
    };
    fetchFirstChapter();
  }, [novel, chapterLangFilter]);

  useEffect(() => {
    if (id && loading !== undefined) {
      fetchNovelAndChapters(id);
    }
  }, [id, isAdmin]);


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
        .select("*, indocount:chapters(count)")
        .eq("slug", slug)
        .eq("indocount.language", "id")
        .maybeSingle();

      if (novelError) throw novelError;
      if (!novelData) {
        toast({
          title: t("novelDetail.notFound"),
          description: t("novelDetail.novelNotFound"),
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check access for unpublished novels
      if (!novelData.is_published && !isAdmin) {
        toast({
          title: t("novelDetail.unavailable"),
          description: t("novelDetail.notPublished"),
          variant: "destructive"
        });
        setLoading(false);
        // Effectively clear novel if it was somehow set
        setNovel(null);
        return;
      }

      setNovel({ ...novelData, views: novelData.views + 1 });
      setIndonesianChapterCount(novelData.indocount?.[0]?.count || 0);

      // Increment Views in DB
      const { error: viewError } = await supabase.rpc('increment_novel_views', { _novel_id: novelData.id });
      if (viewError) {
        console.error("Failed to increment views:", viewError);
      }

      // Fetch Bookmark Count
      const { data: countData } = await supabase
        .rpc("get_novel_bookmark_count", { _novel_id: novelData.id });

      setBookmarkCount(countData || 0);

      // 2. We don't fetch total chapter count and first chapter here anymore
      // because they will be driven dynamically by `fetchChapters` and `fetchFirstChapter` 
      // effect based on `languageFilter`.

    } catch (error) {
      console.error("Error fetching novel details:", error);
      toast({
        title: t("novelDetail.error"),
        description: t("novelDetail.loadError"),
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
      toast({ title: t("bookmarks.loginRequired"), description: t("bookmarks.loginMessage") });
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
        toast({ title: t("novelDetail.removed"), description: t("novelDetail.removedMessage") });
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, novel_id: novel.id });
        setIsFavorite(true);
        await fetchBookmarkCount(); // Re-fetch from DB
        toast({ title: t("novelDetail.added"), description: t("novelDetail.addedMessage") });
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
      toast({ title: t("bookmarks.loginRequired"), description: "Please login to rate novels." });
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
      toast({ title: t("novelDetail.rated"), description: `${t("novelDetail.ratedMessage")} ${value} ${t("novelDetail.stars")}.` });

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
      .select(`
        chapter_id,
        read_at,
        chapters (
          chapter_number
        )
      `)
      .eq("user_id", user.id)
      .eq("novel_id", novelId)
      .order("read_at", { ascending: false });

    if (data && data.length > 0) {
      const ids = new Set(data.map(item => item.chapter_id));
      setReadChapterIds(ids);

      // Get the latest read chapter number
      const latest = data[0];
      if (latest.chapters) {
        setLastReadChapterNumber(latest.chapters.chapter_number);
      }
    }
  };

  // Debounce search to avoid too many requests
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(chapterSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [chapterSearchQuery]);

  // Server-side chapter fetching with pagination
  const fetchChapters = useCallback(async () => {
    if (!novel) return;
    setChaptersLoading(true);
    try {
      const from = (currentPage - 1) * chaptersPerPage;
      const to = from + chaptersPerPage - 1;

      let query = supabase
        .from("chapters")
        .select("*, views", { count: "exact" })
        .eq("novel_id", novel.id)
        .eq("language", chapterLangFilter);

      // Server-side search (uses debounced value)
      if (debouncedSearch.trim()) {
        const searchTerm = debouncedSearch.trim();
        const isNumber = /^\d+$/.test(searchTerm);
        if (isNumber) {
          query = query.eq("chapter_number", parseFloat(searchTerm));
        } else {
          query = query.ilike("title", `%${searchTerm}%`);
        }
      }

      // Server-side sort + pagination
      query = query
        .order("chapter_number", { ascending: chapterSortOrder === "asc" })
        .range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;
      setChapters((data as unknown as Chapter[]) || []);
      setTotalChapterCount(count || 0);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setChaptersLoading(false);
    }
  }, [novel, currentPage, chaptersPerPage, chapterSortOrder, debouncedSearch, chapterLangFilter]);

  // Fetch chapters when dependencies change
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Reset page when search or sort or language or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, chapterSortOrder, chapterLangFilter, chaptersPerPage]);

  const totalPages = Math.ceil(totalChapterCount / chaptersPerPage);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleReadNow = () => {
    if (user && lastReadChapterNumber !== null) {
      navigate(`/series/${id}/chapter/${lastReadChapterNumber}`);
      return;
    }

    if (firstChapterNumber !== null) {
      navigate(`/series/${id}/chapter/${firstChapterNumber}`);
    } else {
      toast({
        title: t("novelDetail.noChapters"),
        description: t("novelDetail.noChaptersMessage"),
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <BarLoader />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4">
        <h1 className="text-2xl font-bold">{t("novelDetail.novelNotFound")}</h1>
        <Button asChild>
          <Link to="/series">{t("novelDetail.backToCatalog")}</Link>
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
              {t("novelDetail.backToCatalog")}
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
          <p className="text-lg text-muted-foreground mb-4">{t("novelDetail.by")} <span className="text-primary font-medium">{novel.author || t("novelDetail.unknown")}</span></p>

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
              <span>{indonesianChapterCount} {t("novelDetail.chaptersCount")}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="capitalize">{novel.status}</span>
            </div>
            {!novel.is_published && (
              <Badge variant="destructive" className="ml-2">{t("novelDetail.draft")}</Badge>
            )}
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

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-6 md:px-8 gap-2 btn-glow text-sm md:text-base h-10 md:h-11" onClick={handleReadNow}>
              <PlayCircle className="w-4 h-4 md:w-5 md:h-5" />
              {lastReadChapterNumber ? `${t("novelDetail.continueChapter")} ${lastReadChapterNumber}` : t("novelDetail.readNow")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`w-full sm:w-auto gap-2 border-0 shadow-sm text-sm md:text-base h-10 md:h-11 ${isFavorite
                ? "bg-white text-destructive border border-destructive hover:bg-destructive/10"
                : "bg-white text-primary hover:bg-white/90"
                }`}
              onClick={toggleBookmark}
            >
              <Tag className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? t("novelDetail.saved") : t("novelDetail.addToLibrary")}
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
              {t("novelDetail.about")}
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2">
              <List className="w-4 h-4" />
              {t("novelDetail.chaptersCount")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="animate-fade-in">
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">{t("novelDetail.synopsis")}</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {novel.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="animate-fade-in">
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center mr-auto w-full sm:w-auto">
                  <span className="font-medium text-muted-foreground whitespace-nowrap">{t("novelDetail.totalChapters")} {totalChapterCount} {t("novelDetail.chaptersCount")}</span>

                  <div className="flex bg-background rounded-lg p-1 border border-border">
                    <Button
                      variant={chapterLangFilter === "id" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setChapterLangFilter("id")}
                      className="h-8 rounded-md px-4"
                    >
                      Indonesia
                    </Button>
                    <Button
                      variant={chapterLangFilter === "en" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setChapterLangFilter("en")}
                      className="h-8 rounded-md px-4"
                    >
                      English
                    </Button>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t("novelDetail.searchChapter")}
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
                    title={chapterSortOrder === "asc" ? t("novelDetail.oldestFirst") : t("novelDetail.newestFirst")}
                  >
                    {chapterSortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border relative">
                {chaptersLoading && (
                  <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                {chapters.length === 0 && !chaptersLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {totalChapterCount === 0 ? t("novelDetail.noChaptersUploaded") : t("novelDetail.noChaptersFound")}
                  </div>
                ) : (
                  chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center group cursor-pointer"
                      onClick={() => navigate(`/series/${id}/chapter/${chapter.chapter_number}`)}
                    >
                      <div>
                        <h4 className={`font-medium group-hover:text-primary transition-colors ${readChapterIds.has(chapter.id) ? "text-purple-500" : ""}`}>
                          {chapterLangFilter === "id" ? `${t("novelDetail.chapter")} ${chapter.chapter_number}: ` : ""}{chapter.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>
                            {chapter.published_at ? formatDistanceToNow(new Date(chapter.published_at), { addSuffix: true }) : t("novelDetail.draft")}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {chapter.views || 0}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {t("novelDetail.readBtn")}
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="p-4 border-t border-border flex flex-col items-center justify-between gap-4 w-full">
                  {/* Top Bar Pagination Controls: Items per page & Jump to */}
                  <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{t("novelDetail.show")}</span>
                      <Select
                        value={chaptersPerPage.toString()}
                        onValueChange={(val) => setChaptersPerPage(Number(val))}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder="20" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>{t("novelDetail.chaptersCount").toLowerCase()}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span>
                        {t("novelDetail.page")} <span className="font-medium text-foreground">{currentPage}</span> {t("novelDetail.of")} <span className="font-medium text-foreground">{totalPages}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{t("novelDetail.goTo")}</span>
                        <Input
                          type="number"
                          min={1}
                          max={totalPages || 1}
                          className="h-8 w-[60px] text-center"
                          placeholder={currentPage.toString()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt(e.currentTarget.value);
                              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                setCurrentPage(val);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Standard Pagination Nav */}
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page, idx) => (
                        <PaginationItem key={idx}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => setCurrentPage(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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
