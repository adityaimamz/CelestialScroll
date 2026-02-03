import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const featuredNovels = [
  {
    id: 1,
    title: "Immortal Sovereign's Path",
    description: "In a world where cultivation determines fate, a young orphan discovers an ancient technique that could shake the heavens. Follow Lin Chen as he rises from nothing to challenge the immortal realm.",
    status: "Ongoing",
    chapters: 1847,
    rating: 4.9,
  },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBanner}
          alt="Featured novel"
          className="w-full h-full object-cover object-center"
        />
        <div 
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative section-container h-full flex items-center py-16 md:py-24">
        <div className="max-w-xl animate-fade-in">
          <span className="status-badge status-badge-ongoing mb-4 inline-block">
            {featuredNovels[0].status}
          </span>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            {featuredNovels[0].title}
          </h1>
          
          <p className="text-muted-foreground text-base md:text-lg mb-6 line-clamp-3">
            {featuredNovels[0].description}
          </p>

          <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-accent font-semibold">{featuredNovels[0].rating}</span>
              ★ Rating
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{featuredNovels[0].chapters.toLocaleString()} Chapters</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="hero" size="lg">
              Start Reading
            </Button>
            <Button variant="surface" size="lg">
              Add to Library
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Navigation */}
      <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-2">
        <Button variant="surface" size="icon" className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="surface" size="icon" className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
