import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import novelCover1 from "@/assets/novel-cover-1.jpg";
import novelCover2 from "@/assets/novel-cover-2.jpg";
import novelCover3 from "@/assets/novel-cover-3.jpg";
import novelCover4 from "@/assets/novel-cover-4.jpg";
import novelCover5 from "@/assets/novel-cover-5.jpg";
import novelCover6 from "@/assets/novel-cover-6.jpg";

const popularNovels = [
  {
    id: 1,
    title: "Moonlit Sword Maiden",
    cover: novelCover1,
    rating: 4.8,
    status: "ongoing" as const,
    chapters: 892,
    genre: "Wuxia",
  },
  {
    id: 2,
    title: "Eternal Flame Cultivator",
    cover: novelCover2,
    rating: 4.7,
    status: "ongoing" as const,
    chapters: 1234,
    genre: "Xianxia",
  },
  {
    id: 3,
    title: "Dragon Rider's Legacy",
    cover: novelCover3,
    rating: 4.9,
    status: "completed" as const,
    chapters: 2100,
    genre: "Fantasy",
  },
  {
    id: 4,
    title: "Celestial Ascension",
    cover: novelCover4,
    rating: 4.6,
    status: "ongoing" as const,
    chapters: 456,
    genre: "Xianxia",
  },
  {
    id: 5,
    title: "Blood Blade Chronicles",
    cover: novelCover5,
    rating: 4.8,
    status: "ongoing" as const,
    chapters: 678,
    genre: "Action",
  },
  {
    id: 6,
    title: "Mystic Alchemist",
    cover: novelCover6,
    rating: 4.5,
    status: "ongoing" as const,
    chapters: 345,
    genre: "Mystery",
  },
];

const PopularSection = () => {
  return (
    <section className="section-spacing section-container">
      <SectionHeader 
        title="Popular This Week" 
        subtitle="Trending among our community"
        viewAllLink="/popular"
      />
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {popularNovels.map((novel) => (
          <NovelCard
            key={novel.id}
            title={novel.title}
            cover={novel.cover}
            rating={novel.rating}
            status={novel.status}
            chapters={novel.chapters}
            genre={novel.genre}
            size="medium"
          />
        ))}
      </div>
    </section>
  );
};

export default PopularSection;
