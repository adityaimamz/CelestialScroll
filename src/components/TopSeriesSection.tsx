import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";

const topSeries = [
  {
    id: 1,
    title: "Against the Gods",
    description: "Mythical Abode Mountain, Cloud's End Cliff, the most dangerous place in the Azure Cloud Continent...",
    genre: "Xianxia",
    gradient: "from-violet-900/80 to-purple-900/80",
  },
  {
    id: 2,
    title: "Martial World",
    description: "In the divine realm, countless worlds move through the void, and martial arts reign supreme...",
    genre: "Wuxia",
    gradient: "from-blue-900/80 to-cyan-900/80",
  },
  {
    id: 3,
    title: "Coiling Dragon",
    description: "The ring, passed down by his ancestors, sparks Linley's destiny as a legendary warrior...",
    genre: "Fantasy",
    gradient: "from-amber-900/80 to-orange-900/80",
  },
  {
    id: 4,
    title: "Stellar Transformations",
    description: "A journey through the cosmos, where cultivation leads to the transformation of stars...",
    genre: "Xianxia",
    gradient: "from-emerald-900/80 to-teal-900/80",
  },
];

const TopSeriesSection = () => {
  return (
    <section className="section-spacing section-container">
      <SectionHeader 
        title="Top Series" 
        subtitle="Most beloved stories by our readers"
        viewAllLink="/series"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topSeries.map((series, index) => (
          <div
            key={series.id}
            className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${series.gradient} border border-border/50 group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-card`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative z-10">
              <span className="genre-pill mb-3 inline-block">{series.genre}</span>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {series.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {series.description}
              </p>
              <Button variant="surface" size="sm">
                Learn More
              </Button>
            </div>
            
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-8 translate-x-8" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopSeriesSection;
