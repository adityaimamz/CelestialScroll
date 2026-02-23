import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, ArrowLeft, List, Loader2 } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ReaderSettings from "@/components/ReaderSettings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/components/auth/AuthProvider";
import CommentsSection from "@/components/CommentsSection";
import ScrollButtons from "@/components/ScrollButtons";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

type Chapter = Tables<"chapters">;
type Novel = Tables<"novels">;

type ChapterListItem = Pick<Chapter, "id" | "title" | "chapter_number">;

const markdownComponents = {
  p: ({ node, ...props }: any) => <p className="mb-8 leading-loose" {...props} />
};

const markdownPlugins = [remarkGfm];

const ChapterReader = () => {
  const { id: novelSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { t, languageFilter } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Bahasa lokal reader: dari ?lang= param atau fallback ke languageFilter global
  // Ini TIDAK mengubah bahasa global app
  const [readerLanguage, setReaderLanguage] = useState<string>(() => {
    const lp = new URLSearchParams(window.location.search).get('lang');
    if (lp === 'en' || lp === 'id') return lp;
    return languageFilter;
  });

  // Bersihkan ?lang= dari URL setelah dibaca
  useEffect(() => {
    const lp = searchParams.get('lang');
    if (lp) {
      searchParams.delete('lang');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chaptersList, setChaptersList] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("sans");
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>("dark");

  // Autoscroll state
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(() => {
    const saved = localStorage.getItem('reader_autoscroll_speed');
    return saved ? parseFloat(saved) : 1.0;
  });
  const autoScrollRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const scrollAccumulatorRef = useRef<number>(0);

  // Fetch data
  useEffect(() => {
    if (novelSlug && chapterId) {
      if (!novel) {
        // Initial load: Fetch Novel & All Chapters list (for sidebar/navigation)
        fetchNovelAndAllChapters(novelSlug, parseFloat(chapterId));
      } else {
        // Novel sudah loaded, hanya fetch chapter content (navigasi antar chapter)
        fetchChapterContent(novel.id, parseFloat(chapterId));
      }
    }
  }, [novelSlug, chapterId]);

  const fetchNovelAndAllChapters = async (slug: string, chapterNum: number) => {
    setLoading(true);
    try {
      // 1. Fetch Novel
      const { data: novelData, error: novelError } = await supabase
        .from("novels")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (novelError) throw novelError;
      if (!novelData) {
        toast({ title: t("novelDetail.error"), description: t("reader.novelNotFound"), variant: "destructive" });
        navigate("/series");
        return;
      }

      if (!novelData.is_published && !isAdmin) {
        toast({
          title: t("novelDetail.unavailable"),
          description: t("reader.notPublished"),
          variant: "destructive"
        });
        navigate("/series");
        return;
      }

      setNovel(novelData);

      // 2. Fetch Chapters List (Lightweight, just id, title, number)
      const { data: listData, error: listError } = await supabase
        .from("chapters")
        .select("id, title, chapter_number")
        .eq("novel_id", novelData.id)
        .eq("language", readerLanguage)
        .order("chapter_number", { ascending: true });

      if (listError) throw listError;
      setChaptersList(listData || []);

      // 3. Fetch Current Chapter Content
      await fetchChapterContent(novelData.id, chapterNum);

    } catch (error) {
      console.error("Error initializing reader:", error);
    }
  };

  const fetchChapterContent = async (novelId: string, chapterNum: number) => {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", novelId)
        .eq("chapter_number", chapterNum)
        .eq("language", readerLanguage)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({ title: t("novelDetail.error"), description: t("reader.chapterNotFound"), variant: "destructive" });
      } else {
        setChapter(data);
        // Stop autoscroll & scroll to top on new chapter
        setIsAutoScrolling(false);
        window.scrollTo(0, 0);

        // Increment Chapter Views
        const { error: viewError } = await supabase.rpc('increment_chapter_views' as any, { _chapter_id: data.id });
        if (viewError) console.error("Failed to increment views:", viewError);

        // Record reading history if user is logged in
        if (user) {
          recordReadHistory(novelId, data.id);
        }
      }
    } catch (error) {
      console.error("Error fetching chapter content:", error);
    } finally {
      setLoading(false);
    }
  }

  const recordReadHistory = async (novelId: string, chapterId: string) => {
    if (!user) return;
    try {
      await supabase.from("reading_history").upsert({
        user_id: user.id,
        novel_id: novelId,
        chapter_id: chapterId,
        read_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,chapter_id' // tambahkan ini
      });
    } catch (error) {
      console.error("Error updating reading history:", error);
    }
  };

  // Autoscroll logic using requestAnimationFrame with precise floating-point accumulation
  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    // Reset accumulator when starting/resuming
    scrollAccumulatorRef.current = 0;

    const scrollStep = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clamp delta to prevent huge jumps (e.g. tab switching)
      const clampedDelta = Math.min(delta, 50);

      const pixelsToScroll = (autoScrollSpeed * 40 * clampedDelta) / 1000;

      scrollAccumulatorRef.current += pixelsToScroll;

      const scrollAmount = Math.floor(scrollAccumulatorRef.current);

      if (scrollAmount > 0) {
        window.scrollBy(0, scrollAmount);
        scrollAccumulatorRef.current -= scrollAmount;
      }

      // Auto-stop at bottom
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setIsAutoScrolling(false);
        return;
      }

      autoScrollRef.current = requestAnimationFrame(scrollStep);
    };

    lastTimeRef.current = 0;
    autoScrollRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, autoScrollSpeed]);

  // Save autoscroll speed to localStorage
  const handleSetAutoScrollSpeed = useCallback((speed: number) => {
    setAutoScrollSpeed(speed);
    localStorage.setItem('reader_autoscroll_speed', speed.toString());
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling(prev => !prev);
  }, []);

  const [showControls, setShowControls] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    if (isTocOpen) {
      const timer = setTimeout(() => {
        const activeElement = document.getElementById("active-chapter-toc");
        if (activeElement) {
          activeElement.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTocOpen]);

  const handleToggleControls = () => {
    if (!window.getSelection()?.toString()) {
      setShowControls((prev) => !prev);
    }
  };

  const toggleTheme = (newTheme: 'light' | 'sepia' | 'dark') => {
    setTheme(newTheme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === 'dark') {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'sepia':
        return "bg-[#f4ecd8] text-[#5b4636]";
      case 'light':
        return "bg-white text-slate-900";
      case 'dark':
        return "bg-background text-foreground";
      default:
        return "bg-background text-foreground";
    }
  };

  const currentChapterNum = parseFloat(chapterId || "1");

  const currentIndex = chaptersList.findIndex(c => c.chapter_number === currentChapterNum);
  const nextChapter = currentIndex >= 0 && currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null;
  const prevChapter = currentIndex > 0 ? chaptersList[currentIndex - 1] : null;

  const hasNext = !!nextChapter;
  const hasPrev = !!prevChapter;

  const handleNext = () => {
    if (nextChapter) {
      navigate(`/series/${novelSlug}/chapter/${nextChapter.chapter_number}`);
    }
  };

  const handlePrev = () => {
    if (prevChapter) {
      navigate(`/series/${novelSlug}/chapter/${prevChapter.chapter_number}`);
    }
  };

  // Report Logic
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportSubmit = async () => {
    if (!user) {
      toast({
        title: t("bookmarks.loginRequired"),
        description: t("reader.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!reportReason.trim()) {
      toast({
        title: t("novelDetail.error"),
        description: t("reader.emptyReason"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      const { error } = await supabase.from("chapter_reports" as any).insert({
        chapter_id: chapter.id,
        user_id: user.id,
        report_text: reportReason.trim(),
      });

      if (error) throw error;

      toast({
        title: t("reader.reportSubmitted"),
        description: t("reader.reportThankYou"),
      });
      setIsReportOpen(false);
      setReportReason("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: t("novelDetail.error"),
        description: t("reader.reportFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeColors()}`}>
        <BarLoader />
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${getThemeColors()}`}
      onClick={handleToggleControls}
    >
      {/* Top Navigation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "-translate-y-full"
          } ${theme === 'dark' ? "bg-background/95 border-b border-border" : "bg-white/95 border-b border-slate-200"} backdrop-blur-sm`}
      >
        <div className="section-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} title={t("reader.home")}>
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(`/series/${novelSlug}`)} title={t("reader.backToSeries")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold line-clamp-1">{novel?.title}</span>
              <span className="text-xs text-muted-foreground">{t("reader.chapter")} {chapter.chapter_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ReaderSettings
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              theme={theme}
              setTheme={toggleTheme}
              isAutoScrolling={isAutoScrolling}
              setIsAutoScrolling={setIsAutoScrolling}
              autoScrollSpeed={autoScrollSpeed}
              setAutoScrollSpeed={handleSetAutoScrollSpeed}
            />

            <Sheet open={isTocOpen} onOpenChange={setIsTocOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <List className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{t("reader.toc")}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)] mt-4">
                  <div className="flex flex-col gap-1 pr-4">
                    {chaptersList.map((ch) => (
                      <Button
                        key={ch.id}
                        id={ch.chapter_number === currentChapterNum ? "active-chapter-toc" : undefined}
                        variant={ch.chapter_number === currentChapterNum ? "secondary" : "ghost"}
                        className="justify-start w-full text-left font-normal"
                        onClick={() => {
                          navigate(`/series/${novelSlug}/chapter/${ch.chapter_number}`);
                          setIsTocOpen(false);
                        }}
                      >
                        <span className="truncate">
                          {t("reader.chapter")} {ch.chapter_number}: {ch.title}
                        </span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-20 md:py-32 overflow-hidden">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {chapter.title}
        </h1>
        <article
          className={`prose max-w-none break-words ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${theme === 'dark' ? 'prose-invert' : ''}`}
          style={{ fontSize: `${fontSize}px`, overflowWrap: 'break-word', wordBreak: 'break-word' }}
        >
          <ReactMarkdown
            remarkPlugins={markdownPlugins}
            components={markdownComponents}
          >
            {chapter.content || t("reader.noContent")}
          </ReactMarkdown>
        </article>

        {/* Report Button Area */}
        <div className="mt-16 flex justify-center">
          <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground hover:text-destructive gap-2 text-sm">
                <Flag className="h-4 w-4" />
                {t("reader.reportIssue")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("reader.reportTitle")}</DialogTitle>
                <DialogDescription>
                  {t("reader.reportDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">{t("reader.reportDetailLabel")}</Label>
                  <Textarea
                    id="reason"
                    placeholder={t("reader.reportPlaceholder")}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportOpen(false)}>
                  {t("reader.cancel")}
                </Button>
                <Button onClick={handleReportSubmit} disabled={isSubmittingReport}>
                  {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("reader.submitReport")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          {novel && <CommentsSection novelId={novel.id} chapterId={chapter.id} />}
        </div>
      </main>



      {/* Bottom Navigation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "translate-y-full"
          } ${theme === 'dark' ? "bg-background/95 border-t border-border" : "bg-white/95 border-t border-slate-200"} backdrop-blur-sm`}
      >
        <div className="section-container h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={!hasPrev}
            onClick={handlePrev}
            className="w-1/3"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("reader.prev")}
          </Button>

          <span className="text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => setIsTocOpen(true)}>
            {/* Find index of current chapter in the list to show position */}
            {chaptersList.findIndex(c => c.chapter_number === currentChapterNum) + 1} / {chaptersList.length}
          </span>

          <Button
            variant="ghost"
            disabled={!hasNext}
            onClick={handleNext}
            className="w-1/3"
          >
            {t("reader.next")}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      <ScrollButtons
        customVisibility={showControls}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={toggleAutoScroll}
      />
    </div>
  );
};

export default ChapterReader;
