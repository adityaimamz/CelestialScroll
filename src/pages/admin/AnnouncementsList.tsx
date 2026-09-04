import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Bold, Italic, Link as LinkIcon, Eye, Edit3, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Announcement = {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
};

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Link dialog states
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");

  const insertFormatting = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleOpenLinkDialog = () => {
    const textarea = textareaRef.current;
    let selected = "";
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      selected = content.substring(start, end);
    }
    setLinkText(selected || "");
    setLinkUrl("https://");
    setIsLinkDialogOpen(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;
    const displayText = linkText.trim() || linkUrl.trim();
    const markdownLink = `[${displayText}](${linkUrl.trim()})`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + markdownLink + content.substring(end);
      setContent(newContent);
    } else {
      setContent((prev) => (prev ? `${prev} ${markdownLink}` : markdownLink));
    }
    setIsLinkDialogOpen(false);
  };

  const handleInsertQuickLink = (label: string, defaultUrl: string) => {
    const markdownLink = `[${label}](${defaultUrl})`;
    setContent((prev) => (prev ? `${prev} ${markdownLink}` : markdownLink));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      toast({
        title: "Error fetching announcements",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    setActiveTab("write");
    if (announcement) {
      setEditingAnnouncement(announcement);
      setTitle(announcement.title);
      setContent(announcement.content);
      setIsActive(announcement.is_active);
    } else {
      setEditingAnnouncement(null);
      setTitle("");
      setContent("");
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update({ title, content, is_active: isActive })
          .eq("id", editingAnnouncement.id);
        if (error) throw error;
        toast({ title: "Announcement updated successfully" });
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert([{ title, content, is_active: isActive }]);
        if (error) throw error;
        toast({ title: "Announcement created successfully" });
      }
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: "Error saving announcement",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Announcement deleted successfully" });
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: "Error deleting announcement",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !announcement.is_active })
        .eq("id", announcement.id);

      if (error) throw error;

      // Optimistic update
      setAnnouncements(announcements.map(a =>
        a.id === announcement.id ? { ...a, is_active: !a.is_active } : a
      ));

      toast({ title: `Announcement ${!announcement.is_active ? 'activated' : 'deactivated'}` });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Announcement
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="content" className="text-sm font-semibold">Content (Rich Text / Link)</Label>
                  <TabsList className="grid grid-cols-2 h-8 w-44">
                    <TabsTrigger value="write" className="text-xs gap-1">
                      <Edit3 className="w-3.5 h-3.5" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="write" className="space-y-2 mt-0">
                  {/* Rich Text Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-lg border border-border bg-muted/40">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-bold gap-1 bg-background hover:bg-muted"
                        onClick={() => insertFormatting("**", "**", "teks tebal")}
                        title="Teks Tebal"
                      >
                        <Bold className="w-3.5 h-3.5" />
                        Tebal
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs italic gap-1 bg-background hover:bg-muted"
                        onClick={() => insertFormatting("*", "*", "teks miring")}
                        title="Teks Miring"
                      >
                        <Italic className="w-3.5 h-3.5" />
                        Miring
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-semibold gap-1 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        onClick={handleOpenLinkDialog}
                        title="Sisipkan Tautan (Tab Baru)"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        + Tautan Link
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">Template Cepat:</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 px-2 text-[11px] gap-1 text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                        onClick={() => handleInsertQuickLink("Saweria", "https://saweria.co/celestialscroll")}
                        title="Tambah Link Saweria"
                      >
                        + Saweria
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    ref={textareaRef}
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis pengumuman... Klik '+ Tautan Link' untuk menyisipkan tautan yang otomatis terbuka di tab baru."
                    rows={5}
                    className="font-sans text-sm resize-y leading-relaxed"
                    required
                  />

                  <div className="p-2 rounded-md bg-muted/30 border border-border/60 text-[11px] text-muted-foreground space-y-0.5">
                    <p>
                      🌐 <strong>Dukungan Link:</strong> Semua URL (misal: <code>https://saweria.co/...</code>) atau format <code>[Nama Link](https://...)</code> otomatis menjadi link yang dapat diklik dan terbuka di <strong>tab baru browser</strong>.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[160px] max-h-[260px] overflow-y-auto p-3.5 rounded-lg border border-border bg-card/60 text-sm">
                    {content.trim() ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline font-semibold inline-flex items-center gap-1 transition-colors break-all"
                            >
                              {props.children}
                              <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
                            </a>
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed text-foreground/90" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold text-foreground" {...props} />
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum ada konten untuk dipratinjau. Ketik sesuatu di tab Editor.</span>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Active Status</Label>
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

      {/* Dialog Sisip Link Interaktif */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="w-4 h-4 text-primary" />
              Sisipkan Tautan (Buka di Tab Baru)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="link-text" className="text-xs font-semibold">Teks Tautan (Teks yang Dilihat Pembaca)</Label>
              <Input
                id="link-text"
                placeholder="Contoh: Dukung Kami / Saweria / Discord"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-url" className="text-xs font-semibold">URL Tujuan Link</Label>
              <Input
                id="link-url"
                placeholder="https://saweria.co/celestialscroll"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border">
              ✓ Tautan otomatis dipasangi <code>target="_blank"</code> sehingga akan terbuka di <strong>tab baru</strong> saat diklik oleh pembaca.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLinkDialogOpen(false)}>
              Batal
            </Button>
            <Button type="button" size="sm" onClick={handleApplyLink} disabled={!linkUrl.trim() || linkUrl === "https://"}>
              Sisipkan Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
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
            ) : null}

            {!loading && announcements.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No announcements found
                </TableCell>
              </TableRow>
            )}

            {!loading && announcements.length > 0 && announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>
                  <button
                    onClick={() => toggleActive(announcement)}
                    className="focus:outline-none"
                  >
                    {announcement.is_active ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="font-medium">{announcement.title}</TableCell>
                <TableCell className="max-w-md truncate">{announcement.content}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnnouncementsList;
