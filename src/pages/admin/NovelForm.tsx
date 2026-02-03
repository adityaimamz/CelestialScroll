import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { Link } from "react-router-dom";

const AVAILABLE_GENRES = [
  "Wuxia", "Xianxia", "Xuanhuan", "Fantasy", "Romance", "Action",
  "Adventure", "Drama", "Comedy", "Martial Arts", "Cultivation",
  "System", "Reincarnation", "Harem", "School Life"
];

interface NovelFormData {
  title: string;
  slug: string;
  description: string;
  author: string;
  status: string;
  genres: string[];
  cover_url: string;
}

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
  });

  useEffect(() => {
    if (isEditing) {
      fetchNovel();
    }
  }, [id]);

  const fetchNovel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        slug: data.slug,
        description: data.description || "",
        author: data.author || "",
        status: data.status,
        genres: data.genres || [],
        cover_url: data.cover_url || "",
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
      const novelData = {
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description.trim() || null,
        author: formData.author.trim() || null,
        status: formData.status,
        genres: formData.genres,
        cover_url: formData.cover_url.trim() || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("novels")
          .update(novelData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Novel berhasil diupdate",
        });
      } else {
        const { error } = await supabase.from("novels").insert(novelData);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Novel berhasil ditambahkan",
        });
      }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
            {isEditing ? "Update informasi novel" : "Isi form untuk menambahkan novel baru"}
          </p>
        </div>
      </div>

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
                  {AVAILABLE_GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.genres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                      {formData.genres.includes(genre) && (
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
                  <Label htmlFor="cover_url">Cover URL</Label>
                  <Input
                    id="cover_url"
                    value={formData.cover_url}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.cover_url && (
                    <div className="mt-2 aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.cover_url}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}
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
