import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, X, Plus, Pencil, Trash2, FileText, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { format } from "date-fns";
import { BarLoader } from "@/components/ui/BarLoader";
import { ImageUpload } from "@/components/ImageUpload";


interface Genre {
  id: string;
  name: string;
}

interface NovelFormData {
  title: string;
  slug: string;
  description: string;
  author: string;
  status: string;
  genres: string[]; // Stores genre IDs
  cover_url: string;
  is_published: boolean;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  published_at: string | null;
  created_at: string;
}

type SortConfig = {
  key: keyof Chapter;
  direction: "asc" | "desc";
};

export default function NovelForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<NovelFormData>({
    title: "",
    slug: "",
    description: "",
    author: "",
    status: "ongoing",
    genres: [],
    cover_url: "",
    is_published: false,
  });

  // Chapter Management State
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "chapter_number", direction: "asc" });

  useEffect(() => {
    fetchGenres();
    if (isEditing) {
      fetchNovel();
      fetchChapters();
    }
  }, [id]);

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase.from("genres").select("id, name").order("name");
      if (error) throw error;
      setAvailableGenres(data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchNovel = async () => {
    setLoading(true);
    try {
      // Fetch novel basic data
      const { data: novelData, error: novelError } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      if (novelError) throw novelError;
      if (!novelData) throw new Error("Novel not found");

      // Fetch linked genres
      const { data: genreData, error: genreError } = await supabase
        .from("novel_genres")
        .select("genre_id")
        .eq("novel_id", id);

      if (genreError) throw genreError;

      const linkedGenreIds = genreData ? genreData.map((g) => g.genre_id) : [];

      setFormData({
        title: novelData.title,
        slug: novelData.slug,
        description: novelData.description || "",
        author: novelData.author || "",
        status: novelData.status,
        genres: linkedGenreIds,
        cover_url: novelData.cover_url || "",
        is_published: novelData.is_published || false,
      });
    } catch (error) {
      console.error("Error fetching novel:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data novel",
        variant: "destructive",
      });
      navigate("/admin/novels");
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", id)
        .order("chapter_number", { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar chapter",
        variant: "destructive",
      });
    } finally {
      setLoadingChapters(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
  };

  const handleGenreToggle = (genre: string) => {
    if (formData.genres.includes(genre)) {
      setFormData({
        ...formData,
        genres: formData.genres.filter((g) => g !== genre),
      });
    } else {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Judul novel harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Get genre names for the array column
      const genreNames = availableGenres
        .filter((g) => formData.genres.includes(g.id))
        .map((g) => g.name);

      const novelData = {
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description.trim() || null,
        author: formData.author.trim() || null,
        status: formData.status,
        genres: genreNames, // Save names cache
        cover_url: formData.cover_url.trim() || null,
        is_published: formData.is_published,
      };

      let novelId = id;

      if (isEditing) {
        const { error } = await supabase
          .from("novels")
          .update(novelData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("novels")
          .insert(novelData)
          .select()
          .single();

        if (error) throw error;
        novelId = data.id;
      }

      // Update novel_genres relationships
      if (novelId) {
        // First delete existing
        const { error: deleteError } = await supabase
          .from("novel_genres")
          .delete()
          .eq("novel_id", novelId);

        if (deleteError) throw deleteError;

        // Then insert new
        if (formData.genres.length > 0) {
          const novelGenres = formData.genres.map(genreId => ({
            novel_id: novelId,
            genre_id: genreId
          }));

          const { error: insertError } = await supabase
            .from("novel_genres")
            .insert(novelGenres);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Berhasil",
        description: "Novel berhasil disimpan",
      });

      navigate("/admin/novels");
    } catch (error: any) {
      console.error("Error saving novel:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan novel",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;

    try {
      const { error } = await supabase
        .from("chapters")
        .delete()
        .eq("id", deleteChapterId);

      if (error) throw error;

      setChapters(chapters.filter((c) => c.id !== deleteChapterId));
      toast({
        title: "Berhasil",
        description: "Chapter berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus chapter",
        variant: "destructive",
      });
    } finally {
      setDeleteChapterId(null);
    }
  };

  const handleSort = (key: keyof Chapter) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedChapters = [...chapters].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;

    // Handle null values
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    const compareResult = aValue < bValue ? -1 : 1;
    return sortConfig.direction === "asc" ? compareResult : -compareResult;
  });

  const SortIcon = ({ columnKey }: { columnKey: keyof Chapter }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />;
    return sortConfig.direction === "asc" ?
      <ArrowUp className="ml-2 h-4 w-4 text-primary" /> :
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
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
          <Link to="/admin/novels">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isEditing ? "Edit Novel" : "Tambah Novel Baru"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Kelola informasi dan chapter novel" : "Isi form untuk menambahkan novel baru"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detail Novel</TabsTrigger>
          {isEditing && (
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload Chapter
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Informasi Novel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Novel *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Masukkan judul novel"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="judul-novel"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL: /series/{formData.slug || "judul-novel"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">Penulis</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Nama penulis"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Sinopsis</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tulis sinopsis novel..."
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Genre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map((genre) => (
                        <Badge
                          key={genre.id}
                          variant={formData.genres.includes(genre.id) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => handleGenreToggle(genre.id)}
                        >
                          {genre.name}
                          {formData.genres.includes(genre.id) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Status & Cover</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="hiatus">Hiatus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_url" className="ml-5">Cover Image</Label>
                      <ImageUpload
                        value={formData.cover_url}
                        onChange={(url) => setFormData({ ...formData, cover_url: url || "" })}
                        endpoint="imageUploader"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload cover novel. Max 4MB.
                      </p>
                    </div>

                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-4 bg-muted/20">
                      <Label htmlFor="is_published" className="flex flex-col space-y-1 cursor-pointer">
                        <span>Publikasikan</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Tampil di web
                        </span>
                      </Label>
                      <Switch
                        id="is_published"
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/admin/novels")}
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
        </TabsContent>

        <TabsContent value="chapters">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Chapter</CardTitle>
              <Button asChild>
                <Link to={`/admin/novels/${id}/chapters/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Chapter
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-20 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort("chapter_number")}
                      >
                        <div className="flex items-center">
                          No.
                          <SortIcon columnKey="chapter_number" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center">
                          Judul
                          <SortIcon columnKey="title" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort("published_at")}
                      >
                        <div className="flex items-center">
                          Tanggal Publish
                          <SortIcon columnKey="published_at" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingChapters ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <BarLoader />
                        </TableCell>
                      </TableRow>
                    ) : chapters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Belum ada chapter. Silakan tambah chapter baru.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedChapters.map((chapter) => (
                        <TableRow key={chapter.id}>
                          <TableCell className="font-medium">{chapter.chapter_number}</TableCell>
                          <TableCell>{chapter.title}</TableCell>
                          <TableCell>
                            {chapter.published_at
                              ? format(new Date(chapter.published_at), "dd MMM yyyy")
                              : <Badge variant="secondary">Draft</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/admin/novels/${id}/chapters/${chapter.id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteChapterId(chapter.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteChapterId} onOpenChange={() => setDeleteChapterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Chapter akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChapter} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
