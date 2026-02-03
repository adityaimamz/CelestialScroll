import { Megaphone } from "lucide-react";

const announcements = [
  {
    id: 1,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    text: "New translation team joining! Welcome the Phoenix Gate Sect translators.",
  },
  {
    id: 2,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    text: "Server maintenance scheduled for this weekend. Expect brief downtime.",
  },
  {
    id: 3,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    text: "Weekly reading challenge: Complete 50 chapters to earn special badges!",
  },
];

const AnnouncementsSection = () => {
  return (
    <section className="section-container py-6">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">Announcements</h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-center gap-3 min-w-[300px] p-4 bg-surface rounded-xl border border-border hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <img
              src={announcement.avatar}
              alt="Announcer"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {announcement.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnnouncementsSection;
