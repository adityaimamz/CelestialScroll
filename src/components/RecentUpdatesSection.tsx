import SectionHeader from "@/components/SectionHeader";
import { Clock } from "lucide-react";

const recentUpdates = [
  {
    id: 1,
    title: "Against the Gods",
    chapter: "Chapter 2847: The Final Tribulation",
    author: "Mars Gravity",
    translator: "AlysGateway",
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    title: "Martial World",
    chapter: "Chapter 1892: Breaking Through",
    author: "Cocooned Cow",
    translator: "Hyorinmaru",
    timeAgo: "4 hours ago",
  },
  {
    id: 3,
    title: "I Shall Seal the Heavens",
    chapter: "Chapter 1614: Eternal Night",
    author: "Er Gen",
    translator: "Deathblade",
    timeAgo: "5 hours ago",
  },
  {
    id: 4,
    title: "Coiling Dragon",
    chapter: "Chapter 806: Divine Realm",
    author: "I Eat Tomatoes",
    translator: "RWX",
    timeAgo: "7 hours ago",
  },
  {
    id: 5,
    title: "Stellar Transformations",
    chapter: "Chapter 1024: Cosmos Breakthrough",
    author: "I Eat Tomatoes",
    translator: "Crimson",
    timeAgo: "8 hours ago",
  },
  {
    id: 6,
    title: "Desolate Era",
    chapter: "Chapter 1456: True Immortal",
    author: "I Eat Tomatoes",
    translator: "RWX",
    timeAgo: "10 hours ago",
  },
  {
    id: 7,
    title: "A Will Eternal",
    chapter: "Chapter 1314: Heaven Shaking",
    author: "Er Gen",
    translator: "Deathblade",
    timeAgo: "12 hours ago",
  },
  {
    id: 8,
    title: "Renegade Immortal",
    chapter: "Chapter 2089: Final Confrontation",
    author: "Er Gen",
    translator: "Rex",
    timeAgo: "14 hours ago",
  },
];

const RecentUpdatesSection = () => {
  return (
    <section className="section-spacing section-container">
      <SectionHeader 
        title="Most Recently Updated" 
        subtitle="Fresh chapters hot off the press"
        viewAllLink="/updates"
      />
      
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Novel</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground hidden md:table-cell">Latest Chapter</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground hidden lg:table-cell">Author / Translator</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-foreground">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentUpdates.map((update, index) => (
                <tr 
                  key={update.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-4">
                    <div className="font-semibold text-foreground hover:text-primary transition-colors">
                      {update.title}
                    </div>
                    <div className="text-sm text-muted-foreground md:hidden mt-1 line-clamp-1">
                      {update.chapter}
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {update.chapter}
                    </span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="text-sm">
                      <span className="text-foreground">{update.author}</span>
                      <span className="text-muted-foreground"> / {update.translator}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {update.timeAgo}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RecentUpdatesSection;
