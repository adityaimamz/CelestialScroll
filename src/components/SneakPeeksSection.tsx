import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { Eye } from "lucide-react";
import novelCover3 from "@/assets/novel-cover-3.jpg";
import novelCover5 from "@/assets/novel-cover-5.jpg";
import novelCover6 from "@/assets/novel-cover-6.jpg";

const sneakPeeks = [
  {
    id: 1,
    title: "Throne of Jade",
    cover: novelCover3,
    releaseDate: "Coming Feb 15",
    description: "An epic tale of imperial cultivation...",
  },
  {
    id: 2,
    title: "Crimson Blade Legacy",
    cover: novelCover5,
    releaseDate: "Coming Feb 20",
    description: "When blood and steel meet destiny...",
  },
  {
    id: 3,
    title: "Arcane Awakening",
    cover: novelCover6,
    releaseDate: "Coming Feb 28",
    description: "Magic and martial arts combine...",
  },
];

const SneakPeeksSection = () => {
  return (
    <section className="section-spacing section-container">
      <SectionHeader 
        title="Sneak Peeks" 
        subtitle="Upcoming novels to look forward to"
        viewAllLink="/upcoming"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sneakPeeks.map((novel) => (
          <div
            key={novel.id}
            className="relative overflow-hidden rounded-xl bg-surface border border-border group cursor-pointer hover:border-primary/50 transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              
              {/* Coming Soon Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-accent/90 rounded-md">
                <Eye className="w-3 h-3 text-accent-foreground" />
                <span className="text-xs font-semibold text-accent-foreground">Preview</span>
              </div>
            </div>
            
            <div className="p-4">
              <span className="text-xs font-medium text-primary mb-1 block">
                {novel.releaseDate}
              </span>
              <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {novel.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {novel.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SneakPeeksSection;
