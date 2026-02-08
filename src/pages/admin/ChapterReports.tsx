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
import { Trash2, CheckCircle, ExternalLink } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Report {
    id: string;
    report_text: string;
    status: 'pending' | 'resolved' | 'ignored';
    created_at: string;
    user_id: string;
    chapter_id: string;
    reporter?: {
        username: string | null;
        email?: string | null;
    };
    chapter?: {
        title: string;
        chapter_number: number;
        novel_id: string;
        novel?: {
            title: string;
            slug: string;
        };
    };
}

const ChapterReports = () => {
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
                .from("chapter_reports" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (reportsError) throw reportsError;

            if (!reportsData || reportsData.length === 0) {
                setReports([]);
                setLoading(false);
                return;
            }

            // Collect IDs for batch fetching
            const chapterIds = [...new Set(reportsData.map((r: any) => r.chapter_id))];
            const reporterIds = [...new Set(reportsData.map((r: any) => r.user_id))];

            // Fetch Chapters with Novels
            const { data: chaptersData } = await supabase
                .from("chapters")
                .select(`
                    id, 
                    title, 
                    chapter_number, 
                    novel_id,
                    novels (
                        title,
                        slug
                    )
                `)
                .in("id", chapterIds);

            const chaptersMap: Record<string, any> = {};
            chaptersData?.forEach((c: any) => {
                chaptersMap[c.id] = {
                    ...c,
                    novel: c.novels // Flatten structure a bit if needed
                };
            });

            // Fetch Profiles (Reporters)
            const { data: profilesData } = await supabase
                .from("profiles" as any)
                .select("id, username")
                .in("id", reporterIds);

            const profilesMap: Record<string, any> = {};
            profilesData?.forEach((p: any) => {
                profilesMap[p.id] = p;
            });

            // Assemble Data
            const fullReports = reportsData.map((r: any) => {
                const chapter = chaptersMap[r.chapter_id];
                const reporter = profilesMap[r.user_id];

                return {
                    ...r,
                    reporter: reporter,
                    chapter: chapter
                };
            });

            setReports(fullReports);
        } catch (error) {
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

    const handleDeleteReport = async () => {
        if (!selectedReport) return;
        try {
            const { error } = await supabase
                .from("chapter_reports" as any)
                .delete()
                .eq("id", selectedReport.id);

            if (error) throw error;

            toast({ title: "Report Deleted", description: "The report has been removed." });
            setReports(prev => prev.filter(r => r.id !== selectedReport.id));
            setIsDeleteDialogOpen(false);
            setSelectedReport(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete report.", variant: "destructive" });
        }
    };

    const handleUpdateStatus = async (reportId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("chapter_reports" as any)
                .update({ status: newStatus })
                .eq("id", reportId);

            if (error) throw error;

            toast({ title: "Status Updated", description: `Report marked as ${newStatus}.` });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus as any } : r));
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolved':
                return <Badge className="bg-green-500">Resolved</Badge>;
            case 'ignored':
                return <Badge variant="secondary">Ignored</Badge>;
            default:
                return <Badge variant="destructive">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Chapter Translation Reports</h2>
                <Button onClick={fetchReports} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="w-[30%]">Report Detail</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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

                        {!loading && reports.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No reports found. Great work!
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && reports.length > 0 && (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        {getStatusBadge(report.status)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {report.reporter?.username || "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {report.chapter ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{report.chapter.novel?.title}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Chapter {report.chapter.chapter_number}
                                                </span>
                                                <Link
                                                    to={`/series/${report.chapter.novel?.slug}/chapter/${report.chapter.chapter_number}`}
                                                    target="_blank"
                                                    className="inline-flex items-center text-xs text-primary hover:underline mt-1"
                                                >
                                                    View Chapter <ExternalLink className="h-3 w-3 ml-1" />
                                                </Link>
                                            </div>
                                        ) : (
                                            <span className="italic text-muted-foreground">Chapter deleted</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="whitespace-pre-wrap text-sm">
                                        {report.report_text}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {report.status !== 'resolved' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                                    title="Mark as Resolved"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                title="Delete Report"
                                                className="text-destructive hover:text-destructive"
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

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Report</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this report? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md text-sm italic">
                        "{selectedReport?.report_text}"
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteReport}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChapterReports;
