import { useEffect, useState, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, FileText, ArrowUpDown, ArrowUp, ArrowDown, Pin, PinOff } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { useToast } from "@/hooks/use-toast";

interface Novel {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  status: string;
  genres: string[];
  views: number;
  created_at: string;
  is_published: boolean;
  pinned: boolean; 
}

type SortConfig = {
  key: keyof Novel;
  direction: "asc" | "desc";
};

export default function NovelList() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "created_at", direction: "desc" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchNovels();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchQuery, sortConfig]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("novels")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setNovels(novels.filter((n) => n.id !== deleteId));
      toast({
        title: "Berhasil",
        description: "Novel berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting novel:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus novel",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("novels")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setNovels(novels.map(n =>
        n.id === id ? { ...n, is_published: !currentStatus } : n
      ));

      toast({
        title: !currentStatus ? "Novel Dipublikasikan" : "Novel Disembunyikan",
        description: `Novel berhasil ${!currentStatus ? "dipublikasikan" : "disembunyikan dari publik"}.`,
      });
    } catch (error) {
      console.error("Error updating publish status:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status publikasi",
        variant: "destructive",
      });
    }
  };

  const handlePinToggle = async (id: string, currentStatus: boolean, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("novels")
        .update({ pinned: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setNovels(novels.map(n =>
        n.id === id ? { ...n, pinned: !currentStatus } : n
      ));

      toast({
        title: !currentStatus ? "Novel Dipin" : "Pin Dilepas",
        description: `Novel berhasil ${!currentStatus ? "dipin ke atas" : "dilepas pin-nya"}.`,
      });
      // Refresh to update order
      fetchNovels();
    } catch (error) {
      console.error("Error updating pin status:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status pin",
        variant: "destructive",
      });
    }
  };

  const fetchNovels = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("novels")
        .select("*", { count: "exact" })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Search
      if (searchQuery) {
        // Simple search on title for now. can extend to author if needed.
        query = query.ilike("title", `%${searchQuery}%`);
      }

      // Always put pinned items first
      query = query.order("pinned", { ascending: false });

      // Sort
      if (sortConfig.key) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === "asc" });
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setNovels(data || []);
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Error fetching novels:", error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar novel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSort = (key: keyof Novel) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1); // Reset to first page on sort change
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      ongoing: "default",
      completed: "secondary",
      hiatus: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Novel }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />;
    return sortConfig.direction === "asc" ?
      <ArrowUp className="ml-2 h-4 w-4 text-primary" /> :
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Kelola Novel</h2>
          <p className="text-muted-foreground">Daftar semua novel di website</p>
        </div>
        <Button asChild>
          <Link to="/admin/novels/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Novel
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari novel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                onClick={() => handleSort("author")}
              >
                <div className="flex items-center">
                  Author
                  <SortIcon columnKey="author" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon columnKey="status" />
                </div>
              </TableHead>
              <TableHead>Genre</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("views")}
              >
                <div className="flex items-center">
                  Views
                  <SortIcon columnKey="views" />
                </div>
              </TableHead>
              <TableHead>Publikasi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <BarLoader className="justify-center" />
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && novels.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "Tidak ada novel yang cocok" : "Belum ada novel"}
                </TableCell>
              </TableRow>
            )}

            {!loading && novels.length > 0 && novels.map((novel) => (
              <TableRow
                key={novel.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/admin/novels/${novel.id}/edit`)}
              >
                <TableCell className="font-medium">{novel.title}</TableCell>
                <TableCell>{novel.author || "-"}</TableCell>
                <TableCell>{getStatusBadge(novel.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {novel.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {novel.genres.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{novel.genres.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{novel.views.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant={novel.is_published ? "default" : "secondary"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => handlePublishToggle(novel.id, novel.is_published, e)}
                  >
                    {novel.is_published ? "Published" : "Draft"}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handlePinToggle(novel.id, !!novel.pinned, e)}
                      >
                        {novel.pinned ? (
                          <>
                            <PinOff className="mr-2 h-4 w-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-4 w-4" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/series/${novel.slug}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/admin/novels/${novel.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/admin/novels/${novel.id}/chapters`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Chapters
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(novel.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages || loading}
        >
          Next
        </Button>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Novel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Novel dan semua chapter-nya akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
