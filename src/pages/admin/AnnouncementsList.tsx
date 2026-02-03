import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Megaphone, CheckCircle, XCircle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

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
    } catch (error: any) {
      toast({
        title: "Error fetching announcements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement?: Announcement) => {
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
    } catch (error: any) {
      toast({
        title: "Error saving announcement",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Error deleting announcement",
        description: error.message,
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
      <div className="flex justify-between items-center">
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
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
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

      <div className="rounded-md border">
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
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnnouncementsList;
