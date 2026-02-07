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
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BarLoader } from "@/components/ui/BarLoader";

interface ChapterFormData {
  chapter_number: number;
  title: string;
  content: string;
  published: boolean;
}

export default function ChapterForm() {
  const { novelId, chapterId } = useParams();
  const isEditing = !!chapterId;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [novelTitle, setNovelTitle] = useState("");
  const [formData, setFormData] = useState<ChapterFormData>({
    chapter_number: 1,
    title: "",
    content: "",
    published: true,
  });

  useEffect(() => {
    fetchNovelInfo();
    if (isEditing) {
      fetchChapter();
    } else {
      fetchNextChapterNumber();
    }
  }, [novelId, chapterId]);

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

  const fetchNextChapterNumber = async () => {
    const { data } = await supabase
      .from("chapters")
      .select("chapter_number")
      .eq("novel_id", novelId)
      .order("chapter_number", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        chapter_number: data[0].chapter_number + 1,
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
      });
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
      };

      if (isEditing) {
        const { error } = await supabase
          .from("chapters")
          .update(chapterData)
          .eq("id", chapterId);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Chapter berhasil diupdate",
        });
      } else {
        const { error } = await supabase.from("chapters").insert(chapterData);

        if (error) throw error;

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
                      min={1}
                      value={formData.chapter_number}
                      onChange={(e) =>
                        setFormData({ ...formData, chapter_number: parseInt(e.target.value) || 1 })
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
                          setFormData((prev) => ({ ...prev, content: value }));

                          if (value) {
                            const firstLine = value.split('\n')[0].trim();
                            const cleanLine = firstLine.replace(/^[\*\#\s]+|[\*\#\s]+$/g, '');

                            const match = cleanLine.match(/^(?:chapter|bab)\s+(\d+)\s*[:\-\.]\s*(.+)$/i);

                            if (match) {
                              const chapterNum = parseInt(match[1]);
                              const realTitle = match[2];

                              // Avoid infinite loop / unnecessary updates
                              if (realTitle !== formData.title) {
                                setFormData((prev) => ({
                                  ...prev,
                                  chapter_number: isNaN(chapterNum) ? prev.chapter_number : chapterNum,
                                  title: realTitle,
                                }));

                                toast({
                                  title: "Format Terdeteksi",
                                  description: `Judul otomatis diisi: ${realTitle}`,
                                });
                              }
                            }
                          }
                        }}
                        placeholder="Tulis isi chapter di sini (Mendukung Markdown)..."
                        rows={20}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Mendukung format Markdown: **bold**, *italic*, # Heading, dll.
                      </p>
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
                {saving && <BarLoader />}
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
