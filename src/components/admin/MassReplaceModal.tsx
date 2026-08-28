import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { logAdminAction } from "@/services/adminLogger";
import { Replace, Search, ArrowRight, Loader2, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

interface MassReplaceModalProps {
  novelId: string;
  defaultLanguage?: string;
  onSuccess?: () => void;
}

interface MatchSnippet {
  before: string;
  match: string;
  after: string;
  replaced: string;
}

interface MatchedChapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  titleMatches: number;
  contentMatches: number;
  totalMatches: number;
  newTitle: string;
  newContent: string;
  snippets: MatchSnippet[];
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegex(term: string, caseSensitive: boolean, wholeWord: boolean) {
  const escaped = escapeRegExp(term);
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  return new RegExp(pattern, caseSensitive ? "g" : "gi");
}

export function MassReplaceModal({
  novelId,
  defaultLanguage = "id",
  onSuccess,
}: MassReplaceModalProps) {
  const [open, setOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [targetContent, setTargetContent] = useState(true);
  const [targetTitle, setTargetTitle] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedChapters, setMatchedChapters] = useState<MatchedChapter[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (defaultLanguage) {
      setLanguage(defaultLanguage);
    }
  }, [defaultLanguage]);

  // Reset search results when search criteria change
  const handleCriteriaChange = () => {
    if (hasSearched) {
      setHasSearched(false);
      setMatchedChapters([]);
      setSelectedIds(new Set());
    }
  };

  const handleSearch = async () => {
    if (!findText.trim()) {
      toast({
        title: "Kata pencarian kosong",
        description: "Masukkan kata atau frasa yang ingin dicari.",
        variant: "destructive",
      });
      return;
    }

    if (!targetContent && !targetTitle) {
      toast({
        title: "Target belum dipilih",
        description: "Pilih minimal satu target (Isi Konten atau Judul).",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    setMatchedChapters([]);

    try {
      const cleanTerm = findText.trim();
      const safeFilterTerm = cleanTerm.replace(/[,()]/g, "");

      // Query chapters for this novel & language
      let query = supabase
        .from("chapters")
        .select("id, chapter_number, title, content")
        .eq("novel_id", novelId)
        .eq("language", language)
        .order("chapter_number", { ascending: true });

      // If safeFilterTerm is valid, filter DB level with ilike for efficiency
      if (safeFilterTerm) {
        if (targetContent && targetTitle) {
          query = query.or(`title.ilike.%${safeFilterTerm}%,content.ilike.%${safeFilterTerm}%`);
        } else if (targetContent) {
          query = query.ilike("content", `%${safeFilterTerm}%`);
        } else if (targetTitle) {
          query = query.ilike("title", `%${safeFilterTerm}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        setMatchedChapters([]);
        setSelectedIds(new Set());
        setHasSearched(true);
        return;
      }

      // Precise client-side matching with regex
      const regex = buildRegex(cleanTerm, caseSensitive, wholeWord);
      const results: MatchedChapter[] = [];

      for (const row of data) {
        const title = row.title || "";
        const content = row.content || "";

        let titleMatches = 0;
        let contentMatches = 0;

        if (targetTitle) {
          const m = title.match(regex);
          titleMatches = m ? m.length : 0;
        }

        if (targetContent) {
          const m = content.match(regex);
          contentMatches = m ? m.length : 0;
        }

        const total = titleMatches + contentMatches;
        if (total > 0) {
          // Extract up to 2 snippets for preview
          const snippets: MatchSnippet[] = [];
          if (targetContent && content) {
            const snippetRegex = buildRegex(cleanTerm, caseSensitive, wholeWord);
            let matchRes;
            let count = 0;
            while ((matchRes = snippetRegex.exec(content)) !== null && count < 2) {
              const idx = matchRes.index;
              const matchStr = matchRes[0];
              const start = Math.max(0, idx - 45);
              const end = Math.min(content.length, idx + matchStr.length + 45);
              const before = (start > 0 ? "..." : "") + content.slice(start, idx).replace(/\s+/g, " ");
              const after = content.slice(idx + matchStr.length, end).replace(/\s+/g, " ") + (end < content.length ? "..." : "");
              snippets.push({
                before,
                match: matchStr,
                after,
                replaced: replaceText,
              });
              count++;
            }
          }

          const newTitle = targetTitle
            ? title.replace(buildRegex(cleanTerm, caseSensitive, wholeWord), replaceText)
            : title;
          const newContent = targetContent
            ? content.replace(buildRegex(cleanTerm, caseSensitive, wholeWord), replaceText)
            : content;

          results.push({
            id: row.id,
            chapter_number: row.chapter_number,
            title,
            content,
            titleMatches,
            contentMatches,
            totalMatches: total,
            newTitle,
            newContent,
            snippets,
          });
        }
      }

      setMatchedChapters(results);
      setSelectedIds(new Set(results.map((r) => r.id)));
      setHasSearched(true);
    } catch (err: any) {
      console.error("Error searching chapters for mass replace:", err);
      toast({
        title: "Gagal melakukan pencarian",
        description: err.message || "Terjadi kesalahan saat memeriksa chapter.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectChapter = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === matchedChapters.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matchedChapters.map((c) => c.id)));
    }
  };

  const handleExecuteReplace = async () => {
    setConfirmOpen(false);

    const chaptersToUpdate = matchedChapters.filter((c) => selectedIds.has(c.id));
    if (chaptersToUpdate.length === 0) {
      toast({
        title: "Tidak ada chapter yang dipilih",
        description: "Pilih minimal satu chapter untuk diterapkan perubahannya.",
        variant: "destructive",
      });
      return;
    }

    setIsReplacing(true);
    const total = chaptersToUpdate.length;
    setReplaceProgress({ current: 0, total, percent: 0 });

    const CHUNK_SIZE = 10;
    let completed = 0;

    try {
      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = chaptersToUpdate.slice(i, i + CHUNK_SIZE);

        await Promise.all(
          chunk.map((ch) =>
            supabase
              .from("chapters")
              .update({
                title: ch.newTitle,
                content: ch.newContent,
              })
              .eq("id", ch.id)
          )
        );

        completed += chunk.length;
        setReplaceProgress({
          current: completed,
          total,
          percent: Math.round((completed / total) * 100),
        });
      }

      await logAdminAction("UPDATE", "CHAPTER", novelId, {
        action: "MASS_REPLACE",
        findText,
        replaceText,
        language,
        updatedChaptersCount: total,
      });

      toast({
        title: "Penggantian Berhasil",
        description: `Berhasil mengganti kata pada ${total} chapter.`,
      });

      onSuccess?.();
      setOpen(false);
      // Reset
      setFindText("");
      setReplaceText("");
      setMatchedChapters([]);
      setHasSearched(false);
    } catch (err: any) {
      console.error("Error executing mass replace:", err);
      toast({
        title: "Gagal mengganti teks",
        description: err.message || "Terjadi kesalahan saat menyimpan perubahan.",
        variant: "destructive",
      });
    } finally {
      setIsReplacing(false);
    }
  };

  const totalMatchCount = matchedChapters.reduce((acc, curr) => acc + curr.totalMatches, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !isReplacing && setOpen(val)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 hover:border-primary/60">
            <Replace className="h-4 w-4 text-primary" />
            <span>Ganti Kata Massal</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Replace className="h-5 w-5 text-primary" />
              Cari & Ganti Kata Massal (Across Chapters)
            </DialogTitle>
            <DialogDescription>
              Ganti istilah atau kata tertentu di seluruh chapter novel ini sekaligus secara aman.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
            {/* Input Find and Replace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5">
                <Label htmlFor="find-input" className="text-xs font-semibold">
                  Kata yang Dicari <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="find-input"
                  placeholder="Contoh: faksi lurus"
                  value={findText}
                  onChange={(e) => {
                    setFindText(e.target.value);
                    handleCriteriaChange();
                  }}
                  disabled={isSearching || isReplacing}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="replace-input" className="text-xs font-semibold">
                  Ganti Menjadi
                </Label>
                <Input
                  id="replace-input"
                  placeholder="Contoh: orthodox"
                  value={replaceText}
                  onChange={(e) => {
                    setReplaceText(e.target.value);
                    handleCriteriaChange();
                  }}
                  disabled={isSearching || isReplacing}
                />
              </div>
            </div>

            {/* Target and Options */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Target:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={targetContent}
                      onCheckedChange={(c) => {
                        setTargetContent(!!c);
                        handleCriteriaChange();
                      }}
                      disabled={isSearching || isReplacing}
                    />
                    <span>Isi Konten</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={targetTitle}
                      onCheckedChange={(c) => {
                        setTargetTitle(!!c);
                        handleCriteriaChange();
                      }}
                      disabled={isSearching || isReplacing}
                    />
                    <span>Judul Chapter</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">Bahasa:</span>
                  <div className="flex bg-background rounded-md p-0.5 border border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("id");
                        handleCriteriaChange();
                      }}
                      className={`px-2 py-0.5 text-xs rounded transition-colors ${
                        language === "id" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                      disabled={isSearching || isReplacing}
                    >
                      Indonesia
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        handleCriteriaChange();
                      }}
                      className={`px-2 py-0.5 text-xs rounded transition-colors ${
                        language === "en" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                      disabled={isSearching || isReplacing}
                    >
                      Inggris
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50 text-xs">
                <span className="font-semibold text-muted-foreground">Opsi:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={caseSensitive}
                    onCheckedChange={(c) => {
                      setCaseSensitive(!!c);
                      handleCriteriaChange();
                    }}
                    disabled={isSearching || isReplacing}
                  />
                  <span>Cocokkan Besar/Kecil (Case Sensitive)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={wholeWord}
                    onCheckedChange={(c) => {
                      setWholeWord(!!c);
                      handleCriteriaChange();
                    }}
                    disabled={isSearching || isReplacing}
                  />
                  <span>Hanya Kata Utuh (Whole Word)</span>
                </label>
              </div>
            </div>

            {/* Action Search Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || isReplacing || !findText.trim()}
                className="gap-2"
                size="sm"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memeriksa Chapter...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Cek Kemunculan & Pratinjau</span>
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar when replacing */}
            {isReplacing && (
              <div className="space-y-2 py-3 px-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex justify-between text-xs font-semibold text-primary">
                  <span>Sedang mengganti kata di database...</span>
                  <span>
                    {replaceProgress.current} / {replaceProgress.total} chapter ({replaceProgress.percent}%)
                  </span>
                </div>
                <Progress value={replaceProgress.percent} className="h-2" />
              </div>
            )}

            {/* Preview Results Section */}
            {hasSearched && !isSearching && (
              <div className="space-y-3 pt-2 border-t border-border">
                {matchedChapters.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <p className="font-medium text-foreground">Tidak ditemukan kecocokan</p>
                    <p className="text-xs mt-1">
                      Kata <span className="font-semibold text-primary">"{findText}"</span> tidak ditemukan pada chapter dengan opsi yang dipilih.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 px-2.5 py-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span>
                            Ditemukan <strong className="text-primary">{totalMatchCount}</strong> kemunculan di <strong className="text-primary">{matchedChapters.length}</strong> chapter
                          </span>
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={toggleSelectAll}
                        disabled={isReplacing}
                      >
                        {selectedIds.size === matchedChapters.length ? "Batal Pilih Semua" : "Pilih Semua"}
                      </Button>
                    </div>

                    <ScrollArea className="h-[230px] rounded-md border p-2 bg-muted/20">
                      <div className="space-y-2.5">
                        {matchedChapters.map((ch) => {
                          const isSelected = selectedIds.has(ch.id);
                          return (
                            <div
                              key={ch.id}
                              className={`p-2.5 rounded-lg border transition-colors ${
                                isSelected ? "bg-card border-primary/40 shadow-xs" : "bg-muted/40 border-border opacity-70"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <Checkbox
                                  id={`match-${ch.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelectChapter(ch.id)}
                                  disabled={isReplacing}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <label
                                      htmlFor={`match-${ch.id}`}
                                      className="text-xs font-semibold leading-none cursor-pointer flex items-center gap-2 truncate"
                                    >
                                      <span className="text-primary font-mono shrink-0">Ch. {ch.chapter_number}</span>
                                      <span className="truncate">{ch.title}</span>
                                    </label>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                      {ch.totalMatches} match
                                    </Badge>
                                  </div>

                                  {/* Snippet Preview */}
                                  {ch.snippets.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {ch.snippets.map((snip, sIdx) => (
                                        <div key={sIdx} className="text-[11px] text-muted-foreground leading-relaxed font-mono bg-muted/60 p-1.5 rounded">
                                          <span>{snip.before}</span>
                                          <span className="bg-destructive/20 text-destructive line-through px-1 py-0.5 rounded font-semibold mx-0.5">
                                            {snip.match}
                                          </span>
                                          <ArrowRight className="inline w-3 h-3 text-muted-foreground mx-1" />
                                          <span className="bg-primary/20 text-primary font-semibold px-1 py-0.5 rounded">
                                            {snip.replaced || "(dihapus)"}
                                          </span>
                                          <span>{snip.after}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {ch.titleMatches > 0 && targetTitle && (
                                    <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                                      Judul baru: <span className="text-primary font-medium">{ch.newTitle}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isReplacing}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={isReplacing || !hasSearched || selectedIds.size === 0}
              className="gap-2"
            >
              {isReplacing && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                Terapkan Perubahan ({selectedIds.size} Chapter)
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Ganti Kata Massal
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <p>
                Tindakan ini akan mengganti kata <strong className="text-foreground">"{findText}"</strong> menjadi{" "}
                <strong className="text-primary">"{replaceText || "(kosong/dihapus)"}"</strong> pada{" "}
                <strong>{selectedIds.size} chapter</strong> yang dipilih.
              </p>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded border">
                ⚠️ Perubahan teks akan langsung disimpan secara permanen ke database Supabase.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteReplace}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Ya, Ganti Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
