import React, { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileUp, List, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface ImportedChapter {
    title: string;
    content: string;
    selected: boolean;
    order: number;
}

interface EpubImporterProps {
    novelId: string;
    onImportSuccess: () => void;
}

export function EpubImporter({ novelId, onImportSuccess }: EpubImporterProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [chapters, setChapters] = useState<ImportedChapter[]>([]);
    const [language, setLanguage] = useState("id");
    const { toast } = useToast();

    const parseEpub = async (file: File) => {
        setIsProcessing(true);
        setChapters([]);

        try {
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(file);

            // 1. Find container.xml to locate the .opf file
            const containerFile = loadedZip.file("META-INF/container.xml");
            if (!containerFile) {
                throw new Error("File EPUB tidak valid (META-INF/container.xml tidak ditemukan).");
            }

            const containerXml = await containerFile.async("string");
            const parser = new DOMParser();
            const containerDoc = parser.parseFromString(containerXml, "text/xml");
            const rootfile = containerDoc.querySelector("rootfile");

            if (!rootfile) {
                throw new Error("Format EPUB tidak didukung (rootfile tidak ditemukan).");
            }

            const opfPath = rootfile.getAttribute("full-path");
            if (!opfPath) {
                throw new Error("Format EPUB tidak didukung (full-path tidak ditemukan).");
            }

            const opfFile = loadedZip.file(opfPath);
            if (!opfFile) {
                throw new Error("File OPF tidak ditemukan.");
            }

            const opfXml = await opfFile.async("string");
            const opfDoc = parser.parseFromString(opfXml, "text/xml");

            // Extract basePath from opfPath
            const basePathMatch = opfPath.match(/(.*\/)/);
            const basePath = basePathMatch ? basePathMatch[1] : "";

            // 2. Read manifest (mapping of id to file path)
            const manifest = opfDoc.querySelectorAll("manifest > item");
            const itemMap: Record<string, string> = {};
            manifest.forEach((item) => {
                const id = item.getAttribute("id");
                const href = item.getAttribute("href");
                if (id && href) {
                    itemMap[id] = href;
                }
            });

            // 3. Read spine (order of reading)
            const spine = opfDoc.querySelectorAll("spine > itemref");
            const spineItems: string[] = [];
            spine.forEach((itemref) => {
                const idref = itemref.getAttribute("idref");
                if (idref && itemMap[idref]) {
                    spineItems.push(itemMap[idref]);
                }
            });

            // 4. Extract content
            const extractedChapters: ImportedChapter[] = [];

            let order = 1;
            for (const href of spineItems) {
                const fullPath = basePath + href;
                const decodePath = decodeURIComponent(fullPath);
                const chapterFile = loadedZip.file(decodePath);

                if (chapterFile) {
                    const htmlContent = await chapterFile.async("string");
                    const htmlDoc = parser.parseFromString(htmlContent, "text/html");

                    // Get Title
                    let title = `Chapter ${order}`;
                    const h1 = htmlDoc.querySelector("h1, h2");
                    if (h1 && h1.textContent?.trim()) {
                        title = h1.textContent.trim();
                    } else {
                        const titleTag = htmlDoc.querySelector("title");
                        if (titleTag && titleTag.textContent?.trim()) {
                            title = titleTag.textContent.trim();
                        }
                    }

                    // Get Content - just text paragraphs to markdown or simple text
                    let content = "";
                    const pTags = htmlDoc.querySelectorAll("p");
                    if (pTags.length > 0) {
                        pTags.forEach(p => {
                            const ptext = p.textContent?.trim();
                            if (ptext) {
                                content += `${ptext}\n\n`;
                            }
                        });
                    } else {
                        const body = htmlDoc.querySelector("body");
                        if (body) {
                            content = body.textContent?.trim() || "Tidak ada konten";
                        }
                    }

                    if (content.trim()) {
                        extractedChapters.push({
                            title,
                            content: content.trim(),
                            selected: true,
                            order
                        });
                        order++;
                    }
                }
            }

            setChapters(extractedChapters);
            if (extractedChapters.length === 0) {
                toast({
                    title: "Peringatan",
                    description: "Tidak ada chapter yang dapat diekstrak dari file tersebut.",
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error("Error parsing EPUB:", error);
            toast({
                title: "Gagal Ekstrak",
                description: error instanceof Error ? error.message : "Terjadi kesalahan saat membaca file EPUB.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.epub')) {
                toast({
                    title: "Format tidak valid",
                    description: "Harap unggah file berformat .epub",
                    variant: "destructive"
                });
                return;
            }
            setFile(selectedFile);
            parseEpub(selectedFile);
        }
    };

    const toggleChapterSelection = (index: number) => {
        setChapters(prev => {
            const newChapters = [...prev];
            newChapters[index].selected = !newChapters[index].selected;
            return newChapters;
        });
    };

    const handleImport = async () => {
        const selectedChapters = chapters.filter(c => c.selected);

        if (selectedChapters.length === 0) {
            toast({
                title: "Perhatian",
                description: "Pilih setidaknya satu chapter untuk diimpor.",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);

        try {
            // Get the next chapter number logic
            const { data: lastChapter } = await supabase
                .from("chapters")
                .select("chapter_number")
                .eq("novel_id", novelId)
                .eq("language", language)
                .order("chapter_number", { ascending: false })
                .limit(1);

            let startChapterNumber = 1;
            if (lastChapter && lastChapter.length > 0) {
                startChapterNumber = lastChapter[0].chapter_number + 1;
            }

            const insertData = selectedChapters.map((chapter, index) => ({
                novel_id: novelId,
                chapter_number: startChapterNumber + index,
                title: chapter.title,
                content: chapter.content,
                language,
                published_at: new Date().toISOString() // auto publish for now
            }));

            const { error } = await supabase
                .from('chapters')
                .insert(insertData);

            if (error) throw error;

            toast({
                title: "Impor Berhasil",
                description: `${selectedChapters.length} chapter berhasil diimpor ke bahasa ${language === 'id' ? 'Indonesia' : 'Inggris'}.`,
            });

            setOpen(false);
            onImportSuccess();

        } catch (error) {
            console.error("Error importing chapters:", error);
            toast({
                title: "Gagal Impor",
                description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan ke database.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileUp className="w-4 h-4" />
                    Import EPUB
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Impor Chapter dari EPUB</DialogTitle>
                    <DialogDescription>
                        Unggah file .epub dan sistem akan mengekstrak isinya menjadi beberapa chapter otomatis.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="epub-file">File EPUB</Label>
                        <Input id="epub-file" type="file" accept=".epub" onChange={handleFileChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="import-language">Bahasa Chapter</Label>
                        <select
                            id="import-language"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="id">Indonesia</option>
                            <option value="en">Inggris</option>
                        </select>
                    </div>

                    {isProcessing && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Sedang mengekstrak file EPUB...</p>
                        </div>
                    )}

                    {!isProcessing && chapters.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <List className="w-4 h-4" /> Daftar Chapter Ditemukan ({chapters.length})
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const allSelected = chapters.every(c => c.selected);
                                        setChapters(chapters.map(c => ({ ...c, selected: !allSelected })));
                                    }}
                                >
                                    {chapters.every(c => c.selected) ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <ScrollArea className="h-[250px] border rounded-md p-4">
                                <div className="space-y-4">
                                    {chapters.map((chapter, i) => (
                                        <div key={i} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`ch-${i}`}
                                                checked={chapter.selected}
                                                onCheckedChange={() => toggleChapterSelection(i)}
                                            />
                                            <div className="grid gap-1.5 leading-none w-full">
                                                <label
                                                    htmlFor={`ch-${i}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {chapter.title}
                                                </label>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {chapter.content.substring(0, 100)}...
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 border-t pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isUploading || isProcessing || chapters.length === 0 || chapters.every(c => !c.selected)}
                    >
                        {isUploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                        ) : (
                            'Simpan ke Database'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
