import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import novelCover1 from "@/assets/novel-cover-1.jpg";
import novelCover2 from "@/assets/novel-cover-2.jpg";
import novelCover3 from "@/assets/novel-cover-3.jpg";
import novelCover4 from "@/assets/novel-cover-4.jpg";

const newReleases = [
  {
    id: 1,
    title: "Sovereign of Darkness",
    cover: novelCover1,
    rating: 4.8,
    status: "ongoing" as const,
    chapters: 24,
    genre: "Wuxia",
  },
  {
    id: 2,
    title: "Heaven's Chosen One",
    cover: novelCover2,
    rating: 4.6,
    status: "ongoing" as const,
    chapters: 18,
    genre: "Xianxia",
  },
  {
    id: 3,
    title: "Reborn as a Dragon",
    cover: novelCover3,
    rating: 4.7,
    status: "ongoing" as const,
    chapters: 32,
    genre: "Fantasy",
  },
  {
    id: 4,
    title: "Immortal Academy",
    cover: novelCover4,
    rating: 4.5,
    status: "ongoing" as const,
    chapters: 15,
    genre: "School",
  },
];

const NewReleasesSection = () => {
  return (
    <section className="section-spacing section-container">
      <SectionHeader 
        title="New Releases" 
        subtitle="Fresh stories just started"
        viewAllLink="/new"
      />
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {newReleases.map((novel) => (
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

export default NewReleasesSection;
