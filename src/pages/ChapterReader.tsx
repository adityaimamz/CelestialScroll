import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, Home, BookOpen, ArrowLeft, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ReaderSettings from "@/components/ReaderSettings";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Data
const chapterContent = `
  <p>The sky was vast and endless, covered in clouds that swirled like ink in water. Lin Chen stood at the edge of the Precipice of Forgotten Souls, the wind howling around him like the wails of ghosts.</p>
  
  <p>"Three years," he whispered, his voice barely audible over the gale. "It has been three years since I was cast down."</p>
  
  <p>His robes, tattered and stained with the dust of the mortal realm, flapped violently. Yet, his eyes burned with a fire that refused to be extinguished. In his hand, he clutched a jade pendant, its surface warm against his palm.</p>
  
  <br />
  <hr />
  <br />

  <p>The cultivation world of the Azure Dragon Continent was ruthless. The strong preyed on the weak, and the weak had no choice but to submit or perish. Lin Chen had learned this lesson the hard way. Born into the prestigious Lin Clan, he was once hailed as a genius. But when his meridian was crippled by a jealous rival, he was discarded like trash.</p>
  
  <p>But they didn't know about the pendant. They didn't know about the voice that spoke to him in his dreams, guiding him to this very spot.</p>
  
  <p>He took a deep breath, the cold mountain air filling his lungs. "Master," he called out to the void. "I am ready."</p>
  
  <p>Suddenly, the jade pendant glowed with a blinding light. The space in front of him rippled, and a portal opened—a gateway to a destiny that would shake the heavens themselves.</p>
  
  <p>Stepping forward, Lin Chen didn't look back. The path of the Immortal Sovereign had begun.</p>
`;

const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Chapter ${i + 1}`,
}));

const ChapterReader = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("sans");
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>("dark");
  const [showControls, setShowControls] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide controls on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  const currentChapter = parseInt(chapterId || "1");

  const handleNext = () => {
    navigate(`/series/${id}/chapter/${currentChapter + 1}`);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    if (currentChapter > 1) {
      navigate(`/series/${id}/chapter/${currentChapter - 1}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeColors()}`}>
      {/* Top Navigation */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        } ${theme === 'dark' ? "bg-background/95 border-b border-border" : "bg-white/95 border-b border-slate-200"} backdrop-blur-sm`}
      >
        <div className="section-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/series/${id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold line-clamp-1">Immortal Sovereign's Path</span>
              <span className="text-xs text-muted-foreground">Chapter {currentChapter}</span>
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
                    {chapters.map((ch) => (
                      <Button
                        key={ch.id}
                        variant={ch.id === currentChapter ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          navigate(`/series/${id}/chapter/${ch.id}`);
                          /* Close sheet automatically would require state control of sheet open */
                        }}
                      >
                        {ch.title}
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
        <article 
          className={`prose max-w-none ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div dangerouslySetInnerHTML={{ __html: chapterContent }} />
        </article>
      </main>

      {/* Bottom Navigation */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "translate-y-full"
        } ${theme === 'dark' ? "bg-background/95 border-t border-border" : "bg-white/95 border-t border-slate-200"} backdrop-blur-sm`}
      >
        <div className="section-container h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            disabled={currentChapter <= 1}
            onClick={handlePrev}
            className="w-1/3"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Prev
          </Button>
          
          <span className="text-sm font-medium text-muted-foreground">
            {currentChapter} / {chapters.length}
          </span>

          <Button 
            variant="ghost" 
            disabled={currentChapter >= chapters.length}
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
