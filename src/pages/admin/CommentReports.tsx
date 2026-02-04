import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Report {
    id: string;
    reason: string;
    created_at: string;
    user_id: string;
    comment_id: string;
    reporter?: {
        username: string | null;
    };
    comment?: {
        content: string;
        user_id: string;
        author?: {
            username: string | null;
        };
    };
}

const CommentReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Fetch reports
            const { data: reportsData, error: reportsError } = await supabase
                .from("comment_reports" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (reportsError) throw reportsError;

            if (!reportsData || reportsData.length === 0) {
                setReports([]);
                setLoading(false);
                return;
            }

            // Collect IDs for batch fetching
            const commentIds = [...new Set(reportsData.map((r: any) => r.comment_id))];
            const reporterIds = [...new Set(reportsData.map((r: any) => r.user_id))];

            // Fetch Comments
            const { data: commentsData } = await supabase
                .from("comments" as any)
                .select("*")
                .in("id", commentIds);

            const commentsMap: Record<string, any> = {};
            const commentAuthorIds: string[] = [];
            commentsData?.forEach((c: any) => {
                commentsMap[c.id] = c;
                if (c.user_id) commentAuthorIds.push(c.user_id);
            });

            // Fetch Profiles (Reporters + Comment Authors)
            const allUserIds = [...new Set([...reporterIds, ...commentAuthorIds])];
            const { data: profilesData } = await supabase
                .from("profiles" as any)
                .select("id, username")
                .in("id", allUserIds);

            const profilesMap: Record<string, any> = {};
            profilesData?.forEach((p: any) => {
                profilesMap[p.id] = p;
            });

            // Assemble Data
            const fullReports = reportsData.map((r: any) => {
                const comment = commentsMap[r.comment_id];
                const reporter = profilesMap[r.user_id];
                const commentAuthor = comment ? profilesMap[comment.user_id] : null;

                return {
                    ...r,
                    reporter: reporter,
                    comment: comment ? {
                        ...comment,
                        author: commentAuthor
                    } : null // Comment might be deleted
                };
            });

            setReports(fullReports);
        } catch (error: any) {
            console.error("Error fetching reports:", error);
            toast({
                title: "Error",
                description: "Failed to load reports.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!selectedReport?.comment_id) return;
        try {
            const { error } = await supabase
                .from("comments" as any)
                .delete()
                .eq("id", selectedReport.comment_id);

            if (error) throw error;

            toast({ title: "Comment Deleted", description: "The comment has been removed." });

            // Also delete the report (or keep it as resolved? For now, let's remove from view or fetch again)
            // Usually cascading delete on comment delete will remove report if configured, 
            // but let's just refresh. 
            // Actually my migration says: comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE
            // So deleting comment deletes report.

            fetchReports();
            setIsDeleteDialogOpen(false);
            setSelectedReport(null);
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
        }
    };

    const handleDismissReport = async (reportId: string) => {
        try {
            const { error } = await supabase
                .from("comment_reports" as any)
                .delete()
                .eq("id", reportId);

            if (error) throw error;

            toast({ title: "Report Dismissed", description: "The report has been removed." });
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to dismiss report.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Reported Comments</h2>
                <Button onClick={fetchReports} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Reported Author</TableHead>
                            <TableHead className="w-[30%]">Comment Content</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No reports found. Good job!
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">
                                        {report.reporter?.username || "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {report.comment?.author?.username || "Unknown"}
                                    </TableCell>
                                    <TableCell className="whitespace-pre-wrap">
                                        {report.comment ? (
                                            <div className="max-h-20 overflow-y-auto text-sm">
                                                {report.comment.content}
                                            </div>
                                        ) : (
                                            <span className="italic text-muted-foreground">Comment deleted</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{report.reason}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDismissReport(report.id)}
                                                title="Dismiss Report"
                                            >
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            </Button>

                                            {report.comment && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    title="Delete Comment"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Comment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone and will resolve the report.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md text-sm italic">
                        "{selectedReport?.comment?.content}"
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteComment}>
                            Delete Comment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CommentReports;
