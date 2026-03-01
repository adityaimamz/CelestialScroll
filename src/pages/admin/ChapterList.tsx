import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Search, Pencil, Trash2, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";
import { logAdminAction } from "@/services/adminLogger";
import { EpubImporter } from "@/components/EpubImporter";

interface Novel {
  id: string;
  title: string;
  slug: string;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  published_at: string | null;
  created_at: string;
  language?: string;
}

type SortConfig = {
  key: keyof Chapter;
  direction: "asc" | "desc";
};

export default function ChapterList() {
  const { novelId } = useParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "chapter_number", direction: "desc" });
  const [activeTab, setActiveTab] = useState<string>("id");

  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersPerPage, setChaptersPerPage] = useState(20);
  const [totalChapterCount, setTotalChapterCount] = useState(0);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    if (novelId) {
      fetchNovelInfo();
    }
  }, [novelId]);

  const fetchNovelInfo = async () => {
    try {
      const { data: novelData, error: novelError } = await supabase
        .from("novels")
        .select("id, title, slug")
        .eq("id", novelId)
        .single();

      if (novelError) throw novelError;
      setNovel(novelData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data novel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchChapters = useCallback(async () => {
    if (!novelId) return;
    setChaptersLoading(true);
    try {
      const from = (currentPage - 1) * chaptersPerPage;
      const to = from + chaptersPerPage - 1;

      let query = supabase
        .from("chapters")
        .select("*", { count: "exact" })
        .eq("novel_id", novelId)
        .eq("language", activeTab);

      if (debouncedSearch.trim()) {
        const searchTerm = debouncedSearch.trim();
        const isNumber = /^\d+$/.test(searchTerm);
        if (isNumber) {
          query = query.eq("chapter_number", parseFloat(searchTerm));
        } else {
          query = query.ilike("title", `%${searchTerm}%`);
        }
      }

      query = query
        .order(sortConfig.key as string, { ascending: sortConfig.direction === "asc" })
        .range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setChapters(data || []);
      setTotalChapterCount(count || 0);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setChaptersLoading(false);
    }
  }, [novelId, currentPage, chaptersPerPage, sortConfig, debouncedSearch, activeTab]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedChapters([]);
  }, [debouncedSearch, sortConfig, activeTab, chaptersPerPage]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("chapters")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setChapters(chapters.filter((c) => c.id !== deleteId));
      setTotalChapterCount((prev) => prev - 1);
      setSelectedChapters(prev => prev.filter(id => id !== deleteId));

      await logAdminAction("DELETE", "CHAPTER", deleteId, {
        novel_id: novelId,
      });

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
      setDeleteId(null);
    }
  };

  const handleSelectAll = async (checked: boolean) => {
    if (checked) {
      // Set a temporary loading state or just indicate we are fetching
      setChaptersLoading(true);
      try {
        let query = supabase
          .from("chapters")
          .select("id")
          .eq("novel_id", novelId)
          .eq("language", activeTab);

        if (debouncedSearch.trim()) {
          const searchTerm = debouncedSearch.trim();
          const isNumber = /^\d+$/.test(searchTerm);
          if (isNumber) {
            query = query.eq("chapter_number", parseFloat(searchTerm));
          } else {
            query = query.ilike("title", `%${searchTerm}%`);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setSelectedChapters(data.map((c) => c.id));
      } catch (error) {
        console.error("Error fetching all chapter ids for selection:", error);
        toast({
          title: "Error",
          description: "Gagal memilih semua chapter",
          variant: "destructive",
        });
      } finally {
        setChaptersLoading(false);
      }
    } else {
      setSelectedChapters([]);
    }
  };

  const handleSelectChapter = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedChapters((prev) => [...prev, id]);
    } else {
      setSelectedChapters((prev) => prev.filter((cId) => cId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChapters.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const { error } = await supabase
        .from("chapters")
        .delete()
        .in("id", selectedChapters);

      if (error) throw error;

      setChapters(chapters.filter((c) => !selectedChapters.includes(c.id)));
      setTotalChapterCount((prev) => prev - selectedChapters.length);

      // Since we might have deleted items not on the current page, it's safer to re-fetch
      fetchChapters();

      for (const id of selectedChapters) {
        await logAdminAction("DELETE", "CHAPTER", id, { novel_id: novelId });
      }

      toast({
        title: "Berhasil",
        description: `${selectedChapters.length} chapter berhasil dihapus`,
      });
      setSelectedChapters([]);
    } catch (error) {
      console.error("Error bulk deleting chapters:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus chapter yang dipilih",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteConfirmOpen(false);
    }
  };

  const handleSort = (key: keyof Chapter) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Chapter }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />;
    return sortConfig.direction === "asc" ?
      <ArrowUp className="ml-2 h-4 w-4 text-primary" /> :
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const totalPages = Math.ceil(totalChapterCount / chaptersPerPage);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BarLoader />
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
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground">Chapters</h2>
          <p className="text-muted-foreground">Novel: {novel?.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedChapters.length > 0 && userRole === "admin" && (
            <Button variant="destructive" onClick={() => setBulkDeleteConfirmOpen(true)}>
              Hapus yang Dipilih ({selectedChapters.length})
            </Button>
          )}
          {novelId && <EpubImporter novelId={novelId} onImportSuccess={fetchChapters} />}
          <Button asChild>
            <Link to={`/admin/novels/${novelId}/chapters/new?lang=${activeTab}`}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Chapter
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs defaultValue="id" value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="id">Indonesia</TabsTrigger>
            <TabsTrigger value="en">Inggris</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border max-h-[600px] overflow-y-auto relative">
        {chaptersLoading && (
          <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={totalChapterCount > 0 && selectedChapters.length === totalChapterCount}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
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
            {chapters.length === 0 && !chaptersLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "Tidak ada chapter yang cocok" : "Belum ada chapter"}
                </TableCell>
              </TableRow>
            ) : (
              chapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedChapters.includes(chapter.id)}
                      onCheckedChange={(checked) => handleSelectChapter(chapter.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{chapter.chapter_number}</TableCell>
                  <TableCell>{chapter.title}</TableCell>
                  <TableCell>
                    {chapter.published_at
                      ? format(new Date(chapter.published_at), "dd MMM yyyy")
                      : "Draft"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/novels/${novelId}/chapters/${chapter.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {userRole === "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(chapter.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 w-full mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Tampilkan</span>
              <Select
                value={chaptersPerPage.toString()}
                onValueChange={(val) => setChaptersPerPage(Number(val))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>chapter</span>
            </div>

            <div className="flex items-center gap-4">
              <span>
                Halaman <span className="font-medium text-foreground">{currentPage}</span> dari <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <span>Ke</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages || 1}
                  className="h-8 w-[60px] text-center"
                  placeholder={currentPage.toString()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(e.currentTarget.value);
                      if (!isNaN(val) && val >= 1 && val <= totalPages) {
                        setCurrentPage(val);
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page as number)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Chapter akan dihapus permanen.
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedChapters.length} Chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua chapter yang dipilih akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkDeleting} className="bg-destructive text-destructive-foreground">
              {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus Semua"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
