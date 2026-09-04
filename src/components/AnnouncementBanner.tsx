import { useState, useEffect, useMemo, useCallback } from "react";
import { Megaphone, X, ChevronLeft, ChevronRight, Info, Calendar, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { id as localeId, enUS } from "date-fns/locale";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const STORAGE_KEY = "celestial_dismissed_announcements_v2";
const AUTO_SLIDE_INTERVAL = 4000; // 4 detik per pengumuman

export default function AnnouncementBanner() {
  const { t, languageFilter } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = slide down/next, -1 = slide up/prev
  const [isPaused, setIsPaused] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Ambil data pengumuman aktif dari Supabase
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["active-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Announcement[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Ambil daftar id pengumuman yang sudah ditutup user di sesi ini
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      // Hapus data dismiss lama di localStorage agar semua pengumuman aktif tampil
      localStorage.removeItem("celestial_dismissed_announcements");
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter pengumuman yang belum di-dismiss
  const visibleAnnouncements = useMemo(() => {
    return announcements.filter((item) => !dismissedIds.includes(item.id));
  }, [announcements, dismissedIds]);

  // Sesuaikan currentIndex jika jumlah pengumuman berubah
  useEffect(() => {
    if (currentIndex >= visibleAnnouncements.length) {
      setCurrentIndex(0);
    }
  }, [visibleAnnouncements.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (visibleAnnouncements.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
  }, [visibleAnnouncements.length]);

  const handlePrev = useCallback(() => {
    if (visibleAnnouncements.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length);
  }, [visibleAnnouncements.length]);

  // Auto-slide loop dengan interval teratur
  useEffect(() => {
    if (visibleAnnouncements.length <= 1 || isPaused || detailModalOpen) return;

    const timer = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [visibleAnnouncements.length, isPaused, detailModalOpen, handleNext]);

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Gagal menyimpan riwayat dismiss:", err);
    }
  };

  const handleOpenDetail = (announcement: Announcement, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedAnnouncement(announcement);
    setDetailModalOpen(true);
  };

  if (isLoading || visibleAnnouncements.length === 0) {
    return null;
  }

  const current = visibleAnnouncements[currentIndex] || visibleAnnouncements[0];

  const formatAnnouncementDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return "";
      const locale = languageFilter === "en" ? enUS : localeId;
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch {
      return "";
    }
  };

  const formatBannerSnippet = (text: string) => {
    if (!text) return "";
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  };

  return (
    <>
      <div
        id="announcements"
        className="w-full bg-slate-950/95 dark:bg-[#0b0f19]/98 border-b-2 border-primary/60 shadow-lg backdrop-blur-xl text-white transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label={t("announcements.title")}
      >
        <div className="section-container flex items-center justify-between py-2 px-3 sm:px-6 gap-2 sm:gap-4 text-xs sm:text-sm min-h-[40px]">
          {/* Sisi Kiri / Isi Pengumuman */}
          <div
            className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={() => handleOpenDetail(current)}
          >
            {/* Badge Ikon */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary text-white font-bold text-[11px] sm:text-xs shadow-sm flex-shrink-0 select-none">
              <Megaphone className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden xs:inline">{t("announcements.badge") || t("announcements.title")}</span>
            </div>

            {/* Teks Pengumuman dengan Animasi Auto-Slide */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden relative h-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: direction > 0 ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: direction > 0 ? -10 : 10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center gap-2 w-full truncate"
                >
                  <span className="font-bold text-white tracking-wide truncate group-hover:text-primary-foreground/90 transition-colors flex-shrink-0 max-w-[140px] sm:max-w-[240px]">
                    {current.title}
                  </span>
                  <span className="hidden sm:inline text-primary font-semibold">—</span>
                  <span className="text-slate-200 font-medium truncate hidden md:inline group-hover:text-white transition-colors">
                    {formatBannerSnippet(current.content)}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Tombol Detail Cepat */}
            <button
              type="button"
              onClick={(e) => handleOpenDetail(current, e)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-200 bg-primary/25 hover:bg-primary/40 border border-primary/50 px-2 py-0.5 rounded-md transition-all flex-shrink-0 ml-1 select-none"
              title={t("announcements.viewDetail")}
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t("announcements.viewDetail")}</span>
            </button>
          </div>

          {/* Sisi Kanan: Navigasi Slider & Tombol Tutup */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Navigasi multi-pengumuman jika ada lebih dari 1 */}
            {visibleAnnouncements.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-800/90 rounded-full px-2 py-0.5 border border-slate-700 text-[11px] text-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="p-0.5 hover:text-white rounded-full transition-colors"
                  aria-label={t("announcements.previous")}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] px-1 select-none font-semibold text-white">
                  {currentIndex + 1}/{visibleAnnouncements.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="p-0.5 hover:text-white rounded-full transition-colors"
                  aria-label={t("announcements.next")}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tombol Dismiss / Tutup */}
            <button
              type="button"
              onClick={(e) => handleDismiss(current.id, e)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
              title={t("announcements.dismiss")}
              aria-label={t("announcements.dismiss")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog Detail Pengumuman */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg bg-surface border-border">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {t("announcements.dialogTitle")}
                    </span>
                    {selectedAnnouncement.created_at && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatAnnouncementDate(selectedAnnouncement.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground text-left">
                  {selectedAnnouncement.title}
                </DialogTitle>
              </DialogHeader>

              <div className="py-3">
                <DialogDescription asChild>
                  <div className="text-sm text-foreground/90 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline font-semibold inline-flex items-center gap-1 transition-colors break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {props.children}
                            <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
                          </a>
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-foreground" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
                        ),
                      }}
                    >
                      {selectedAnnouncement.content}
                    </ReactMarkdown>
                  </div>
                </DialogDescription>
              </div>

              <DialogFooter className="flex flex-row justify-between items-center sm:justify-between gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    handleDismiss(selectedAnnouncement.id);
                    setDetailModalOpen(false);
                  }}
                >
                  {t("announcements.dismiss")}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setDetailModalOpen(false)}
                >
                  {t("announcements.close")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
