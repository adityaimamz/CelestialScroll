import { useState } from "react";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import novelCover1 from "@/assets/novel-cover-1.jpg";
import novelCover2 from "@/assets/novel-cover-2.jpg";
import novelCover3 from "@/assets/novel-cover-3.jpg";
import novelCover4 from "@/assets/novel-cover-4.jpg";
import novelCover5 from "@/assets/novel-cover-5.jpg";
import novelCover6 from "@/assets/novel-cover-6.jpg";

const genres = ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Action", "Horror"];

const genreNovels: Record<string, Array<{
  id: number;
  title: string;
  cover: string;
  rating: number;
  status: "ongoing" | "completed";
  chapters: number;
}>> = {
  Fantasy: [
    { id: 1, title: "Realm of Shadows", cover: novelCover1, rating: 4.7, status: "ongoing", chapters: 567 },
    { id: 2, title: "The Last Immortal", cover: novelCover2, rating: 4.9, status: "completed", chapters: 1200 },
    { id: 3, title: "Heavenly Demon Path", cover: novelCover3, rating: 4.6, status: "ongoing", chapters: 890 },
    { id: 4, title: "Spirit Emperor", cover: novelCover4, rating: 4.8, status: "ongoing", chapters: 456 },
  ],
  "Sci-Fi": [
    { id: 5, title: "Galactic Cultivator", cover: novelCover5, rating: 4.5, status: "ongoing", chapters: 234 },
    { id: 6, title: "Cyber Dao", cover: novelCover6, rating: 4.7, status: "ongoing", chapters: 567 },
    { id: 7, title: "Star Forger", cover: novelCover1, rating: 4.8, status: "completed", chapters: 890 },
    { id: 8, title: "Quantum Martial Arts", cover: novelCover2, rating: 4.6, status: "ongoing", chapters: 345 },
  ],
  Romance: [
    { id: 9, title: "Destined Love", cover: novelCover3, rating: 4.9, status: "completed", chapters: 456 },
    { id: 10, title: "Immortal Hearts", cover: novelCover4, rating: 4.7, status: "ongoing", chapters: 678 },
    { id: 11, title: "Cultivation of Love", cover: novelCover5, rating: 4.6, status: "ongoing", chapters: 234 },
    { id: 12, title: "Fated Encounter", cover: novelCover6, rating: 4.8, status: "completed", chapters: 890 },
  ],
  Mystery: [
    { id: 13, title: "Secret Sect", cover: novelCover1, rating: 4.7, status: "ongoing", chapters: 345 },
    { id: 14, title: "Hidden Realm", cover: novelCover2, rating: 4.8, status: "ongoing", chapters: 567 },
    { id: 15, title: "Mystic Investigation", cover: novelCover3, rating: 4.5, status: "completed", chapters: 234 },
    { id: 16, title: "Shadowed Truth", cover: novelCover4, rating: 4.6, status: "ongoing", chapters: 456 },
  ],
  Action: [
    { id: 17, title: "Martial Emperor", cover: novelCover5, rating: 4.9, status: "ongoing", chapters: 1200 },
    { id: 18, title: "Combat Supremacy", cover: novelCover6, rating: 4.7, status: "ongoing", chapters: 890 },
    { id: 19, title: "Blade of Glory", cover: novelCover1, rating: 4.8, status: "completed", chapters: 567 },
    { id: 20, title: "War God's Path", cover: novelCover2, rating: 4.6, status: "ongoing", chapters: 678 },
  ],
  Horror: [
    { id: 21, title: "Demonic Descent", cover: novelCover3, rating: 4.6, status: "ongoing", chapters: 345 },
    { id: 22, title: "Ghost Cultivator", cover: novelCover4, rating: 4.7, status: "ongoing", chapters: 456 },
    { id: 23, title: "Nightmare Realm", cover: novelCover5, rating: 4.5, status: "completed", chapters: 234 },
    { id: 24, title: "Dark Awakening", cover: novelCover6, rating: 4.8, status: "ongoing", chapters: 567 },
  ],
};

const GenresSection = () => {
  const [activeGenre, setActiveGenre] = useState("Fantasy");

  return (
    <section className="section-spacing section-container">
      <SectionHeader 
        title="Popular Genres" 
        subtitle="Explore stories by category"
        viewAllLink="/genres"
      />
      
      {/* Genre Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeGenre === genre
                ? "bg-primary text-primary-foreground shadow-glow-primary"
                : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Genre Novels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
        {genreNovels[activeGenre]?.map((novel) => (
          <NovelCard
            key={novel.id}
            title={novel.title}
            cover={novel.cover}
            rating={novel.rating}
            status={novel.status}
            chapters={novel.chapters}
            size="large"
          />
        ))}
      </div>
    </section>
  );
};

export default GenresSection;
