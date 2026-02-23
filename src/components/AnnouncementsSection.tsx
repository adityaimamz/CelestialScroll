import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Announcement = Tables<"announcements">;

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) setAnnouncements(data);
    };

    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <section className="section-container py-6" id="announcements">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">{t("announcements.title")}</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-center gap-3 min-w-[300px] flex-1 p-4 bg-surface rounded-xl border border-border hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {/* <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="Announcer"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            /> */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
              !
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground line-clamp-1">{announcement.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {announcement.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnnouncementsSection;
