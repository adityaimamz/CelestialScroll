import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { ImageUpload } from "@/components/ImageUpload";
import { UploadButton } from "@/utils/uploadthing";
import { logAdminAction } from "@/services/adminLogger";

interface ChapterFormData {
  chapter_number: number;
  title: string;
  content: string;
  published: boolean;
  language: string;
}

export default function ChapterForm() {
  const { novelId, chapterId } = useParams();
  const isEditing = !!chapterId;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [novelTitle, setNovelTitle] = useState("");
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChapterFormData>({
    chapter_number: 1,
    title: "",
    content: "",
    published: true,
    language: "id",
  });

  useEffect(() => {
    fetchNovelInfo();
    if (isEditing) {
      fetchChapter();
    } else {
      fetchNextChapterNumber(formData.language);
    }
  }, [novelId, chapterId]);

  useEffect(() => {
    if (!isEditing && novelId) {
      fetchNextChapterNumber(formData.language);
    }
  }, [formData.language]);

  const fetchNovelInfo = async () => {
    const { data } = await supabase
      .from("novels")
      .select("title")
      .eq("id", novelId)
      .single();

    if (data) {
      setNovelTitle(data.title);
    }
  };

  const fetchNextChapterNumber = async (lang: string) => {
    const { data } = await supabase
      .from("chapters")
      .select("chapter_number")
      .eq("novel_id", novelId)
      .eq("language", lang)
      .order("chapter_number", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        chapter_number: data[0].chapter_number + 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        chapter_number: 1,
      }));
    }
  };

  const fetchChapter = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (error) throw error;

      setFormData({
        chapter_number: data.chapter_number,
        title: data.title,
        content: data.content || "",
        published: !!data.published_at,
        language: data.language || "id",
      });

      fetchAdjacentChapters(data.chapter_number);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data chapter",
        variant: "destructive",
      });
      navigate(`/admin/novels/${novelId}/chapters`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjacentChapters = async (currentNumber: number) => {
    try {
      // Prev
      const { data: prevData } = await supabase
        .from("chapters")
        .select("id")
        .eq("novel_id", novelId)
        .lt("chapter_number", currentNumber)
        .order("chapter_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      setPrevChapterId(prevData?.id || null);

      // Next
      const { data: nextData } = await supabase
        .from("chapters")
        .select("id")
        .eq("novel_id", novelId)
        .gt("chapter_number", currentNumber)
        .order("chapter_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      setNextChapterId(nextData?.id || null);
    } catch (error) {
      console.error("Error fetching adjacent chapters:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Title check removed - it's optional now

    setSaving(true);

    try {
      const chapterData = {
        novel_id: novelId,
        chapter_number: formData.chapter_number,
        title: formData.title.trim(), // Can be empty string now
        content: formData.content.trim() || null,
        published_at: formData.published ? new Date().toISOString() : null,
        language: formData.language,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("chapters")
          .update(chapterData)
          .eq("id", chapterId);

        if (error) throw error;

        await logAdminAction("UPDATE", "CHAPTER", chapterId, {
          title: chapterData.title,
          chapter_number: chapterData.chapter_number,
          novel_id: novelId,
        });

        toast({
          title: "Berhasil",
          description: "Chapter berhasil diupdate",
        });
      } else {
        const { data, error } = await supabase.from("chapters").insert(chapterData).select().single();

        if (error) throw error;

        await logAdminAction("CREATE", "CHAPTER", data.id, {
          title: chapterData.title,
          chapter_number: chapterData.chapter_number,
          novel_id: novelId,
        });

        toast({
          title: "Berhasil",
          description: "Chapter berhasil ditambahkan",
        });
      }

      navigate(`/admin/novels/${novelId}/chapters`);
    } catch (error) {
      console.error("Error saving chapter:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Gagal menyimpan chapter",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BarLoader />      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/admin/novels/${novelId}/chapters`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {isEditing ? "Edit Chapter" : "Tambah Chapter Baru"}
            </h2>
            <p className="text-muted-foreground">Novel: {novelTitle}</p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!prevChapterId}
              onClick={() => navigate(`/admin/novels/${novelId}/chapters/${prevChapterId}/edit`)}
              title="Chapter Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!nextChapterId}
              onClick={() => navigate(`/admin/novels/${novelId}/chapters/${nextChapterId}/edit`)}
              title="Chapter Selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Konten Chapter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter_number">Nomor Chapter *</Label>
                    <Input
                      id="chapter_number"
                      type="number"
                      step="any"
                      min={0}
                      value={formData.chapter_number}
                      onChange={(e) =>
                        setFormData({ ...formData, chapter_number: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Chapter (Opsional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Judul chapter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Bahasa</Label>
                    <select
                      id="language"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="id">Indonesia</option>
                      <option value="en">Inggris</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Isi Chapter</Label>
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="write">
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value) {
                            const lines = value.split('\n');
                            const firstLine = lines[0].trim();
                            const cleanLine = firstLine.replace(/^[\*\#\s]+|[\*\#\s]+$/g, '');

                            const match = cleanLine.match(/^(?:chapter|bab)\s+(\d+(?:\.\d+)?)\s*[:\-\.]\s*(.+)$/i);

                            if (match) {
                              const chapterNum = parseFloat(match[1]);
                              const realTitle = match[2];

                              // Avoid infinite loop / unnecessary updates
                              if (realTitle !== formData.title) {
                                const contentWithoutFirstLine = lines.slice(1).join('\n').trim();

                                setFormData((prev) => ({
                                  ...prev,
                                  chapter_number: isNaN(chapterNum) ? prev.chapter_number : chapterNum,
                                  title: realTitle,
                                  content: contentWithoutFirstLine,
                                }));

                                toast({
                                  title: "Format Terdeteksi",
                                  description: `Judul otomatis diisi: ${realTitle}`,
                                });
                                return;
                              }
                            }
                          }

                          setFormData((prev) => ({ ...prev, content: value }));
                        }}
                        placeholder="Tulis isi chapter di sini (Mendukung Markdown)..."
                        rows={20}
                        className="font-mono"
                      />
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <p className="text-xs text-muted-foreground flex-1">
                          Mendukung format Markdown: **bold**, *italic*, # Heading, dll.
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {formData.content.length} Karakter
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Insert Image:</span>
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                  const imageUrl = res[0].ufsUrl ;
                                  const imageMarkdown = `\n![Image](${imageUrl})\n`;
                                  setFormData(prev => ({
                                    ...prev,
                                    content: prev.content + imageMarkdown
                                  }));
                                  toast({
                                    title: "Image Uploaded",
                                    description: "Image code appended to content",
                                  });
                                }
                              }}
                              onUploadError={(error: Error) => {
                                toast({
                                  title: "Upload Failed",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }}
                              appearance={{
                                button: "bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 text-xs px-2",
                                allowedContent: "hidden"
                              }}
                              content={{
                                button({ ready }) {
                                  if (ready) return <div className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Upload</div>;
                                  return "Loading...";
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="border rounded-md p-4 min-h-[400px] bg-background">
                        <article className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formData.content || "*Belum ada konten*"}
                          </ReactMarkdown>
                        </article>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Pengaturan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="published">Publish</Label>
                    <p className="text-xs text-muted-foreground">
                      Publikasikan chapter ini
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, published: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/admin/novels/${novelId}/chapters`)}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
