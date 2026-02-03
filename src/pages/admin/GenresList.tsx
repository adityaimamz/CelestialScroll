import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

const GenresList = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setGenres(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching genres",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (genre?: Genre) => {
    if (genre) {
      setEditingGenre(genre);
      setName(genre.name);
      setSlug(genre.slug);
      setDescription(genre.description || "");
    } else {
      setEditingGenre(null);
      setName("");
      setSlug("");
      setDescription("");
    }
    setIsDialogOpen(true);
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (!editingGenre) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGenre) {
        const { error } = await supabase
          .from("genres")
          .update({ name, slug, description })
          .eq("id", editingGenre.id);
        if (error) throw error;
        toast({ title: "Genre updated successfully" });
      } else {
        const { error } = await supabase
          .from("genres")
          .insert([{ name, slug, description }]);
        if (error) throw error;
        toast({ title: "Genre created successfully" });
      }
      setIsDialogOpen(false);
      fetchGenres();
    } catch (error: any) {
      toast({
        title: "Error saving genre",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;
    try {
      const { error } = await supabase.from("genres").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Genre deleted successfully" });
      fetchGenres();
    } catch (error: any) {
      toast({
        title: "Error deleting genre",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Genres</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Genre
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGenre ? "Edit Genre" : "Add New Genre"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : genres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No genres found
                </TableCell>
              </TableRow>
            ) : (
              genres.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell className="font-medium">{genre.name}</TableCell>
                  <TableCell>{genre.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{genre.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(genre)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(genre.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GenresList;
