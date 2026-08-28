import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, List, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { logAdminAction } from "@/services/adminLogger";

export interface ParsedChapter {
  volume?: string;
  originalChapterNumber?: number;
  title: string;
  content: string;
  selected: boolean;
  order: number;
}

interface MarkdownImporterProps {
  novelId: string;
  onImportSuccess: () => void;
}

/**
 * Parser cerdas untuk mengekstrak chapter dari teks Markdown (.md) atau Plain Text (.txt)
 */
export function parseMarkdownOrText(
  text: string,
  includeVolumeInTitle: boolean = true
): ParsedChapter[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  // Regex pola chapter:
  // Mendukung:
  // 1. "# Volume 0 Chapter 1 — Prologue" / "Volume 0 Chapter 1: Prologue"
  // 2. "# Chapter 1 — Prologue" / "Chapter 1: Prologue" / "Chapter 1"
  // 3. "# Bab 1 — Judul" / "Bab 1: Judul"
  // 4. "# Episode 1" / "Episode 1"
  const CHAPTER_REGEX =
    /^(?:#{1,6}\s+)?(?:(volume\s+\d+)\s+)?(?:chapter|bab|babak|episode|eps)\s+(\d+(?:\.\d+)?)(?:\s*[:\-\—\–─=_.]\s*|\s+)?(.*)$/i;

  // Regex divider fallback (misal: "---" atau "***")
  const DIVIDER_REGEX = /^(?:---|\*\*\*|===+)\s*$/;

  const indices: {
    lineIndex: number;
    volume?: string;
    chapterNum?: number;
    rawTitle: string;
    isDivider?: boolean;
  }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Cek pattern chapter utama
    const match = line.match(CHAPTER_REGEX);
    if (match) {
      const vol = match[1] ? match[1].trim() : undefined;
      const num = parseFloat(match[2]);
      let subtitle = match[3] ? match[3].trim() : "";

      // Jika subtitle kosong pada baris ini, cek apakah baris berikutnya adalah judulnya
      if (!subtitle && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (
          nextLine &&
          nextLine.length < 120 &&
          !nextLine.match(CHAPTER_REGEX) &&
          !nextLine.match(DIVIDER_REGEX) &&
          !nextLine.startsWith("#")
        ) {
          subtitle = nextLine;
        }
      }

      indices.push({
        lineIndex: i,
        volume: vol,
        chapterNum: isNaN(num) ? undefined : num,
        rawTitle: subtitle,
      });
      continue;
    }

    // Fallback: Pemisah divider "---" diikuti oleh baris judul
    if (DIVIDER_REGEX.test(line) && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (
        nextLine &&
        nextLine.length < 120 &&
        !DIVIDER_REGEX.test(nextLine)
      ) {
        indices.push({
          lineIndex: i,
          rawTitle: nextLine.replace(/^#+\s*/, "").trim(),
          isDivider: true,
        });
      }
    }
  }

  // Jika tidak ditemukan chapter dengan pattern di atas, perlakukan seluruh file sebagai 1 chapter
  if (indices.length === 0) {
    const firstLine = lines.find((l) => l.trim().length > 0) || "Chapter 1";
    return [
      {
        order: 1,
        title: firstLine.replace(/^#+\s*/, "").trim(),
        content: normalized.trim(),
        selected: true,
      },
    ];
  }

  const results: ParsedChapter[] = [];

  for (let i = 0; i < indices.length; i++) {
    const current = indices[i];
    const next = indices[i + 1];

    let startLine = current.lineIndex + 1;
    if (current.isDivider) {
      startLine = current.lineIndex + 2; // lewati divider dan baris judulnya
    }

    const endLine = next ? next.lineIndex : lines.length;
    let contentLines = lines.slice(startLine, endLine);

    // Jika rawTitle diambil dari baris berikutnya, lewati baris itu agar tidak dobel di konten
    if (
      current.rawTitle &&
      contentLines.length > 0 &&
      contentLines[0].trim() === current.rawTitle
    ) {
      contentLines = contentLines.slice(1);
    }

    const content = contentLines.join("\n").trim();

    // Format judul: bila mengandung Volume, sertakan info Volume pada judul
    let formattedTitle = "";
    if (current.volume && includeVolumeInTitle) {
      const volFormatted = current.volume.replace(/\b\w/g, (l) =>
        l.toUpperCase()
      );
      if (current.chapterNum !== undefined) {
        if (current.rawTitle) {
          formattedTitle = `${volFormatted} Chapter ${current.chapterNum} — ${current.rawTitle}`;
        } else {
          formattedTitle = `${volFormatted} Chapter ${current.chapterNum}`;
        }
      } else {
        formattedTitle = `${volFormatted} — ${current.rawTitle || "Untitled"}`;
      }
    } else {
      if (current.rawTitle) {
        formattedTitle = current.rawTitle;
      } else if (current.chapterNum !== undefined) {
        formattedTitle = `Chapter ${current.chapterNum}`;
      } else {
        formattedTitle = `Chapter ${i + 1}`;
      }
    }

    results.push({
      order: i + 1,
      volume: current.volume,
      originalChapterNumber: current.chapterNum,
      title: formattedTitle,
      content,
      selected: true,
    });
  }

  return results;
}

export function MarkdownImporter({ novelId, onImportSuccess }: MarkdownImporterProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [language, setLanguage] = useState("id");
  const [startChapterNumber, setStartChapterNumber] = useState<number>(1);
  const [includeVolume, setIncludeVolume] = useState<boolean>(true);
  const [rawText, setRawText] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
  }>({ current: 0, total: 0, percent: 0 });

  const { toast } = useToast();

  // Ambil nomor chapter terakhir saat modal dibuka atau bahasa berubah
  useEffect(() => {
    if (open && novelId) {
      fetchNextChapterNumber(language);
    }
  }, [open, novelId, language]);

  const fetchNextChapterNumber = async (lang: string) => {
    try {
      const { data } = await supabase
        .from("chapters")
        .select("chapter_number")
        .eq("novel_id", novelId)
        .eq("language", lang)
        .order("chapter_number", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setStartChapterNumber(data[0].chapter_number + 1);
      } else {
        setStartChapterNumber(1);
      }
    } catch (error) {
      console.error("Gagal mengambil nomor chapter terakhir:", error);
    }
  };

  // Re-parse jika opsi includeVolume berubah
  useEffect(() => {
    if (rawText) {
      const parsed = parseMarkdownOrText(rawText, includeVolume);
      setChapters(parsed);
    }
  }, [includeVolume]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.toLowerCase();
    if (
      !ext.endsWith(".md") &&
      !ext.endsWith(".markdown") &&
      !ext.endsWith(".txt")
    ) {
      toast({
        title: "Format tidak didukung",
        description: "Harap unggah file berformat .md atau .txt",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setChapters([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setRawText(text);
        const parsed = parseMarkdownOrText(text, includeVolume);
        setChapters(parsed);

        if (parsed.length === 0) {
          toast({
            title: "Peringatan",
            description: "Tidak ada chapter yang terdeteksi dalam file ini.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "File berhasil dibaca",
            description: `Ditemukan ${parsed.length} chapter siap diimpor.`,
          });
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        toast({
          title: "Gagal memproses file",
          description:
            err instanceof Error ? err.message : "Terjadi kesalahan membaca file.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      toast({
        title: "Gagal membaca file",
        description: "Gagal membaca file dari disk.",
        variant: "destructive",
      });
    };

    reader.readAsText(selectedFile);
  };

  const toggleChapterSelection = (index: number) => {
    setChapters((prev) => {
      const newChapters = [...prev];
      newChapters[index].selected = !newChapters[index].selected;
      return newChapters;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = chapters.every((c) => c.selected);
    setChapters(chapters.map((c) => ({ ...c, selected: !allSelected })));
  };

  const handleImport = async () => {
    const selectedChapters = chapters.filter((c) => c.selected);

    if (selectedChapters.length === 0) {
      toast({
        title: "Perhatian",
        description: "Pilih setidaknya satu chapter untuk diimpor.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: selectedChapters.length, percent: 0 });

    try {
      const CHUNK_SIZE = 50; // Upload per batch 50 chapter agar tidak timeout
      const total = selectedChapters.length;

      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = selectedChapters.slice(i, i + CHUNK_SIZE);
        const insertData = chunk.map((chapter, index) => ({
          novel_id: novelId,
          chapter_number: startChapterNumber + (i + index),
          title: chapter.title,
          content: chapter.content,
          language,
          published_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from("chapters").insert(insertData);
        if (error) throw error;

        const currentCount = Math.min(i + CHUNK_SIZE, total);
        setUploadProgress({
          current: currentCount,
          total,
          percent: Math.round((currentCount / total) * 100),
        });
      }

      await logAdminAction("CREATE", "CHAPTER", novelId, {
        imported_count: selectedChapters.length,
        format: file?.name?.endsWith(".txt") ? "TXT" : "MARKDOWN",
        start_chapter: startChapterNumber,
        end_chapter: startChapterNumber + selectedChapters.length - 1,
        language,
      });

      toast({
        title: "Impor Berhasil",
        description: `${selectedChapters.length} chapter berhasil disimpan ke database (Bahasa ${
          language === "id" ? "Indonesia" : "Inggris"
        }).`,
      });

      setOpen(false);
      onImportSuccess();
    } catch (error) {
      console.error("Error importing chapters:", error);
      toast({
        title: "Gagal Impor",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan ke database.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedCount = chapters.filter((c) => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Import MD / TXT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Impor Chapter dari Markdown / Text
          </DialogTitle>
          <DialogDescription>
            Unggah file .md atau .txt. Sistem akan mendeteksi chapter, volume, dan
            mengurutkan nomor chapter secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {/* File Input */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="md-file">Pilih File Markdown / TXT</Label>
            <Input
              id="md-file"
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* Konfigurasi Bahasa & Nomor Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="import-lang">Bahasa Chapter</Label>
              <select
                id="import-lang"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isUploading}
              >
                <option value="id">Indonesia</option>
                <option value="en">Inggris</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start-chapter">Nomor Chapter Awal</Label>
              <Input
                id="start-chapter"
                type="number"
                step="any"
                min={1}
                value={startChapterNumber}
                onChange={(e) =>
                  setStartChapterNumber(parseFloat(e.target.value) || 1)
                }
                disabled={isUploading}
                placeholder="1"
              />
            </div>
          </div>

          {/* Opsi Tambahan */}
          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              id="include-volume"
              checked={includeVolume}
              onCheckedChange={(checked) => setIncludeVolume(!!checked)}
              disabled={isUploading}
            />
            <label
              htmlFor="include-volume"
              className="text-xs font-medium leading-none cursor-pointer select-none"
            >
              Sertakan info Volume di judul chapter (contoh:{" "}
              <span className="text-muted-foreground italic">
                Volume 0 Chapter 1 — Prologue
              </span>
              )
            </label>
          </div>

          {/* Loading Indicator saat parsing */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
              <p className="text-sm">Sedang membedah struktur chapter...</p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 py-3 px-4 bg-muted/40 rounded-lg border border-border">
              <div className="flex justify-between text-xs font-medium">
                <span>Mengunggah ke database...</span>
                <span>
                  {uploadProgress.current} / {uploadProgress.total} chapter (
                  {uploadProgress.percent}%)
                </span>
              </div>
              <Progress value={uploadProgress.percent} className="h-2" />
            </div>
          )}

          {/* Chapter List Preview */}
          {!isProcessing && chapters.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <List className="w-4 h-4 text-primary" /> Daftar Chapter
                  Ditemukan ({chapters.length})
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedCount} dipilih
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={toggleSelectAll}
                    disabled={isUploading}
                  >
                    {chapters.every((c) => c.selected)
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[260px] border rounded-md p-3 bg-muted/20">
                <div className="space-y-2.5">
                  {chapters.map((chapter, i) => {
                    const assignedNum = startChapterNumber + i;
                    return (
                      <div
                        key={i}
                        className="flex items-start space-x-3 p-2 rounded hover:bg-muted/60 transition-colors"
                      >
                        <Checkbox
                          id={`ch-md-${i}`}
                          checked={chapter.selected}
                          onCheckedChange={() => toggleChapterSelection(i)}
                          disabled={isUploading}
                          className="mt-0.5"
                        />
                        <div className="grid gap-1 leading-none w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                              Ch. {assignedNum}
                            </span>
                            <label
                              htmlFor={`ch-md-${i}`}
                              className="text-sm font-medium leading-tight cursor-pointer line-clamp-1"
                            >
                              {chapter.title}
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {chapter.content.substring(0, 90) ||
                              "(Tidak ada konten)"}
                            ...
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t pt-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Batal
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              isUploading ||
              isProcessing ||
              chapters.length === 0 ||
              selectedCount === 0
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan {uploadProgress.current}/{uploadProgress.total}...
              </>
            ) : (
              `Simpan ${selectedCount} Chapter`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
