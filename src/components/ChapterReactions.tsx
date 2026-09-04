import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export type ReactionType = "mantap" | "suka" | "apasih" | "ngakak" | "nyesek" | "gantung";
  
interface ReactionDef {
  type: ReactionType;
  labelKey: string;
  badgeBorder: string;
}

const REACTIONS: ReactionDef[] = [
  { type: "mantap", labelKey: "reactions.mantap", badgeBorder: "#3b82f6" },
  { type: "suka", labelKey: "reactions.suka", badgeBorder: "#ec4899" },
  { type: "apasih", labelKey: "reactions.apasih", badgeBorder: "#a855f7" },
  { type: "ngakak", labelKey: "reactions.ngakak", badgeBorder: "#eab308" },
  { type: "nyesek", labelKey: "reactions.nyesek", badgeBorder: "#06b6d4" },
  { type: "gantung", labelKey: "reactions.gantung", badgeBorder: "#f97316" },
];

const getZeroCounts = (): Record<ReactionType, number> => ({
  mantap: 0,
  suka: 0,
  apasih: 0,
  ngakak: 0,
  nyesek: 0,
  gantung: 0,
});

interface ChapterReactionsProps {
  chapterId: string;
  novelId?: string;
}

export default function ChapterReactions({ chapterId }: ChapterReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Persistent Client ID untuk voting anonim/tamu
  const [clientId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("celestial_client_id");
      if (stored) return stored;
      const newId = "client_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("celestial_client_id", newId);
      return newId;
    } catch {
      return "client_guest";
    }
  });

  // State reaksi user yang terpilih pada chapter ini
  const [userReaction, setUserReaction] = useState<ReactionType | null>(() => {
    try {
      const saved = localStorage.getItem(`celestial_my_reaction_${chapterId}`);
      return (saved as ReactionType) || null;
    } catch {
      return null;
    }
  });

  // State jumlah vote per reaksi pada chapter ini (dimulai murni dari 0)
  const [counts, setCounts] = useState<Record<ReactionType, number>>(() => {
    try {
      const saved = localStorage.getItem(`celestial_reaction_counts_${chapterId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return getZeroCounts();
  });

  const [loading, setLoading] = useState(false);
  const [activeBounce, setActiveBounce] = useState<ReactionType | null>(null);

  // Ambil data reaksi dari Supabase atau fallback LocalStorage untuk chapterId ini
  const fetchReactions = useCallback(async () => {
    if (!chapterId) return;

    // Load data lokal spesifik bab ini
    try {
      const savedCounts = localStorage.getItem(`celestial_reaction_counts_${chapterId}`);
      if (savedCounts) {
        setCounts(JSON.parse(savedCounts));
      } else {
        setCounts(getZeroCounts());
      }
      const savedReaction = localStorage.getItem(`celestial_my_reaction_${chapterId}`);
      setUserReaction((savedReaction as ReactionType) || null);
    } catch {
      setCounts(getZeroCounts());
      setUserReaction(null);
    }

    try {
      const { data, error } = await supabase
        .from("chapter_reactions" as any)
        .select("reaction_type, user_id, client_id")
        .eq("chapter_id", chapterId);

      if (error) {
        // Jika tabel belum dibuat di Supabase, gunakan state fallback lokal bab ini
        return;
      }

      if (data && Array.isArray(data)) {
        const nextCounts = getZeroCounts();
        let myCurrentVote: ReactionType | null = null;

        data.forEach((row: any) => {
          const type = row.reaction_type as ReactionType;
          if (nextCounts[type] !== undefined) {
            nextCounts[type] += 1;
          }
          if ((user && row.user_id === user.id) || row.client_id === clientId) {
            myCurrentVote = type;
          }
        });

        setCounts(nextCounts);
        setUserReaction(myCurrentVote);
        try {
          localStorage.setItem(`celestial_reaction_counts_${chapterId}`, JSON.stringify(nextCounts));
          if (myCurrentVote) {
            localStorage.setItem(`celestial_my_reaction_${chapterId}`, myCurrentVote);
          } else {
            localStorage.removeItem(`celestial_my_reaction_${chapterId}`);
          }
        } catch {}
      }
    } catch (err) {
      // Graceful fallback
    }
  }, [chapterId, user, clientId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Total reactions
  const totalReactions = useMemo(() => {
    return Object.values(counts).reduce((acc, curr) => acc + curr, 0);
  }, [counts]);

  // Handler saat stiker diklik
  const handleVote = async (type: ReactionType) => {
    if (loading) return;

    setActiveBounce(type);
    setTimeout(() => setActiveBounce(null), 600);

    const prevReaction = userReaction;
    const isTogglingOff = prevReaction === type;
    const newReaction = isTogglingOff ? null : type;

    // Optimistic UI Update
    setUserReaction(newReaction);
    setCounts((prev) => {
      const updated = { ...prev };
      if (prevReaction && updated[prevReaction] > 0) {
        updated[prevReaction] = Math.max(0, updated[prevReaction] - 1);
      }
      if (newReaction) {
        updated[newReaction] = (updated[newReaction] || 0) + 1;
      }
      try {
        localStorage.setItem(`celestial_reaction_counts_${chapterId}`, JSON.stringify(updated));
        if (newReaction) {
          localStorage.setItem(`celestial_my_reaction_${chapterId}`, newReaction);
        } else {
          localStorage.removeItem(`celestial_my_reaction_${chapterId}`);
        }
      } catch {}
      return updated;
    });

    setLoading(true);

    try {
      // Simpan ke Supabase (berfungsi 100% baik untuk pengguna login maupun tamu anonim)
      if (isTogglingOff) {
        let query = supabase
          .from("chapter_reactions" as any)
          .delete()
          .eq("chapter_id", chapterId);

        if (user?.id) {
          query = query.or(`client_id.eq.${clientId},user_id.eq.${user.id}`);
        } else {
          query = query.eq("client_id", clientId);
        }

        await query;
      } else {
        await supabase
          .from("chapter_reactions" as any)
          .upsert(
            {
              chapter_id: chapterId,
              client_id: clientId,
              user_id: user?.id || null,
              reaction_type: type,
            },
            { onConflict: "chapter_id,client_id" }
          );
      }
    } catch {
      // Fallback lokal di LocalStorage tetap berjalan 100% lancar tanpa mengganggu pembaca
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-12 text-center select-none">
      {/* Header */}
      <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-wider uppercase">
        {t("reactions.upvote")}
      </h3>
      <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1 mb-6">
        {totalReactions.toLocaleString()} {t("reactions.count")}
      </p>

      {/* Grid / Row Stiker Chibi: 3x2 di Mobile, 1 Baris di Desktop */}
      <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-y-7 gap-x-2 sm:gap-4 md:gap-5 max-w-[340px] sm:max-w-none mx-auto pt-6 pb-3 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {REACTIONS.map((item) => {
          const isSelected = userReaction === item.type;
          const count = counts[item.type] || 0;
          const isBouncing = activeBounce === item.type;

          return (
            <div
              key={item.type}
              onClick={() => handleVote(item.type)}
              className="flex flex-col items-center cursor-pointer group select-none flex-shrink-0"
            >
              {/* Box Stiker dengan Badge Angka */}
              <div className="relative">
                {/* Badge Jumlah Vote di Pojok Kanan Atas */}
                <span
                  style={{ borderColor: item.badgeBorder }}
                  className="absolute -top-3 -right-2 z-10 min-w-[22px] h-[19px] px-1.5 rounded-full bg-[#0c101d] text-[10px] sm:text-[11px] font-bold text-white border-2 shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                >
                  {count}
                </span>

                {/* Stiker Chibi dengan Animasi Bounce */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  animate={isBouncing ? { y: [-6, 0, -4, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 p-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/15 shadow-lg shadow-primary/10"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  {/* Gambar Stiker Reaksi */}
                  <img
                    src={`/reactions/${item.type}.png`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                    alt={t(item.labelKey)}
                    className="w-full h-full object-contain filter drop-shadow-md pointer-events-none"
                    loading="lazy"
                  />
                </motion.div>
              </div>

              {/* Label Nama Reaksi */}
              <span
                className={`text-xs sm:text-sm mt-2 transition-colors duration-150 ${
                  isSelected
                    ? "font-bold text-primary"
                    : "font-semibold text-foreground/80 group-hover:text-primary"
                }`}
              >
                {t(item.labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
