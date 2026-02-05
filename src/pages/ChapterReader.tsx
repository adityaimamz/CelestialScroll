import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, ArrowLeft, List, Loader2 } from "lucide-react";
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
import { useScrollHideNav } from "@/hooks/useScrollHideNav";

type Chapter = Tables<"chapters">;
type Novel = Tables<"novels">;

type ChapterListItem = Pick<Chapter, "id" | "title" | "chapter_number">;

const ChapterReader = () => {
  const { id: novelSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chaptersList, setChaptersList] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("sans");
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>("dark");
  // showControls is now derived from useScrollHideNav hook
  // lastScrollY is handled inside the hook

  // Fetch data
  useEffect(() => {
    if (novelSlug && chapterId) {
      if (!novel) {
        // Initial load: Fetch Novel & All Chapters list (for sidebar/navigation)
        fetchNovelAndAllChapters(novelSlug, parseInt(chapterId));
      } else {
        // Novel already loaded, just fetch specific chapter content if we changed chapters
        fetchChapterContent(novel.id, parseInt(chapterId));
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
        toast({ title: "Error", description: "Novel not found", variant: "destructive" });
        navigate("/series");
        return;
      }
      setNovel(novelData);

      // 2. Fetch Chapters List (Lightweight, just id, title, number)
      const { data: listData, error: listError } = await supabase
        .from("chapters")
        .select("id, title, chapter_number")
        .eq("novel_id", novelData.id)
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
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({ title: "Error", description: "Chapter not found", variant: "destructive" });
      } else {
        setChapter(data);
        // Scroll to top on new chapter
        window.scrollTo(0, 0);

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
      });
    } catch (error) {
      console.error("Error updating reading history:", error);
    }
  };

  const showControls = useScrollHideNav();

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

  const currentChapterNum = parseInt(chapterId || "1");
  const hasNext = chaptersList.some(c => c.chapter_number === currentChapterNum + 1);
  const hasPrev = chaptersList.some(c => c.chapter_number === currentChapterNum - 1);

  const handleNext = () => {
    if (hasNext) {
      navigate(`/series/${novelSlug}/chapter/${currentChapterNum + 1}`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      navigate(`/series/${novelSlug}/chapter/${currentChapterNum - 1}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeColors()}`}>
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeColors()}`}>
      {/* Top Navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "-translate-y-full"
          } ${theme === 'dark' ? "bg-background/95 border-b border-border" : "bg-white/95 border-b border-slate-200"} backdrop-blur-sm`}
      >
        <div className="section-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} title="Home">
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(`/series/${novelSlug}`)} title="Back to Series">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold line-clamp-1">{novel?.title}</span>
              <span className="text-xs text-muted-foreground">Chapter {chapter.chapter_number}</span>
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
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <List className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Table of Contents</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)] mt-4">
                  <div className="flex flex-col gap-1">
                    {chaptersList.map((ch) => (
                      <Button
                        key={ch.id}
                        variant={ch.chapter_number === currentChapterNum ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          navigate(`/series/${novelSlug}/chapter/${ch.chapter_number}`);
                        }}
                      >
                        Chapter {ch.chapter_number}: {ch.title}
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
      <main className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {chapter.title}
        </h1>
        <article
          className={`prose max-w-none ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${theme === 'dark' ? 'prose-invert' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="mb-8 leading-loose" {...props} />
            }}
          >
            {chapter.content || "No content."}
          </ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-border">
          {novel && <CommentsSection novelId={novel.id} chapterId={chapter.id} />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div
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
            Prev
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            {/* Find index of current chapter in the list to show position */}
            {chaptersList.findIndex(c => c.chapter_number === currentChapterNum) + 1} / {chaptersList.length}
          </span>

          <Button
            variant="ghost"
            disabled={!hasNext}
            onClick={handleNext}
            className="w-1/3"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;
