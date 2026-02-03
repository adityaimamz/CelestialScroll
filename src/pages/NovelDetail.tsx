import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, BookOpen, Clock, Tag, ChevronLeft, List, Info, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock Data
const novelData = {
  id: 1,
  title: "Immortal Sovereign's Path",
  cover: "https://images.unsplash.com/photo-1614726365723-49cfaeb5d8c7?q=80&w=300&auto=format&fit=crop",
  banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
  author: "Celestial Master",
  rating: 4.9,
  ratingCount: 12450,
  status: "Ongoing",
  views: "12.5M",
  chapters: 1847,
  genres: ["Xianxia", "Action", "Adventure", "Fantasy", "Martial Arts"],
  description: `In a world where cultivation determines fate, a young orphan discovers an ancient technique that could shake the heavens. Follow Lin Chen as he rises from nothing to challenge the immortal realm.

  Born with a crippled meridian, Lin Chen was destined to be a mortal for life. However, fate had other plans when he stumbled upon the forgotten tomb of the Primordial Chaos Emperor. Inheriting a legacy that defies the laws of nature, he begins a journey of cultivation that will lead him to the peak of existence.
  
  But the path to immortality is paved with blood and betrayal. Powerful sects, ancient beasts, and jealous rivals stand in his way. With his indomitable will and the mysterious artifact known as the 'Void Mirror', Lin Chen will shatter the heavens and forge his own destiny.`,
};

const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Chapter ${i + 1}: The Beginning of the End ${i === 0 ? "(Prologue)" : ""}`,
  date: "2 days ago",
}));

const NovelDetail = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // In a real app, fetch data based on ID
  console.log("Fetching details for novel:", id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner & Header */}
      <div className="relative h-[300px] md:h-[400px]">
        <div className="absolute inset-0">
          <img 
            src={novelData.banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
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

        <div className="absolute -bottom-24 md:-bottom-16 left-0 right-0 section-container flex flex-col md:flex-row gap-8 items-center md:items-end">
          {/* Cover Image */}
          <div className="w-40 md:w-52 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden border-4 border-background">
            <img 
              src={novelData.cover} 
              alt={novelData.title} 
              className="w-full h-auto object-cover aspect-[2/3]" 
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left text-foreground mb-4 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{novelData.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">By <span className="text-primary font-medium">{novelData.author}</span></p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <span className="font-bold text-lg">{novelData.rating}</span>
                <span className="text-sm text-muted-foreground">({novelData.ratingCount})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{novelData.chapters} Chapters</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{novelData.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {novelData.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="px-3 py-1">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex justify-center md:justify-start gap-3">
              <Button size="lg" className="w-40 gap-2 btn-glow">
                <PlayCircle className="w-5 h-5" />
                Read Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={`gap-2 ${isFavorite ? "text-red-500 border-red-500 hover:text-red-600 hover:bg-red-500/10" : ""}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Tag className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Saved" : "Library"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="section-container mt-28 md:mt-24">
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
                {novelData.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="animate-fade-in">
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Total {chapters.length} chapters</span>
                <Button variant="ghost" size="sm">Sort by: Newest</Button>
              </div>
              <div className="divide-y divide-border">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center group cursor-pointer">
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">{chapter.title}</h4>
                      <span className="text-xs text-muted-foreground">{chapter.date}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Read
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NovelDetail;
