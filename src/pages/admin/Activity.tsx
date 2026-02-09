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
import { ExternalLink } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Activity {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    novel_id: string;
    chapter_id: string | null;
    author?: {
        username: string | null;
        avatar_url?: string | null;
    };
    novel?: {
        title: string;
        slug: string;
    };
    chapter?: {
        title: string;
        chapter_number: number;
    } | null;
}

const Activity = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            // Fetch latest comments
            const { data: commentsData, error: commentsError } = await supabase
                .from("comments" as any)
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50); // Limit to last 50 activities for performance

            if (commentsError) throw commentsError;

            if (!commentsData || commentsData.length === 0) {
                setActivities([]);
                setLoading(false);
                return;
            }

            // Collect IDs for batch fetching
            const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
            const novelIds = [...new Set(commentsData.map((c: any) => c.novel_id))];
            const chapterIds = [...new Set(commentsData.map((c: any) => c.chapter_id).filter(Boolean))];

            // 1. Fetch Profiles
            const { data: profilesData } = await supabase
                .from("profiles" as any)
                .select("id, username, avatar_url")
                .in("id", userIds);

            const profilesMap: Record<string, any> = {};
            profilesData?.forEach((p: any) => {
                profilesMap[p.id] = p;
            });

            // 2. Fetch Novels
            const { data: novelsData } = await supabase
                .from("novels")
                .select("id, title, slug")
                .in("id", novelIds);

            const novelsMap: Record<string, any> = {};
            novelsData?.forEach((n: any) => {
                novelsMap[n.id] = n;
            });

            // 3. Fetch Chapters (if any)
            let chaptersMap: Record<string, any> = {};
            if (chapterIds.length > 0) {
                const { data: chaptersData } = await supabase
                    .from("chapters")
                    .select("id, title, chapter_number")
                    .in("id", chapterIds);

                chaptersData?.forEach((c: any) => {
                    chaptersMap[c.id] = c;
                });
            }

            // Assemble Data
            const fullActivities = commentsData.map((c: any) => {
                const author = profilesMap[c.user_id];
                const novel = novelsMap[c.novel_id];
                const chapter = c.chapter_id ? chaptersMap[c.chapter_id] : null;

                return {
                    ...c,
                    author,
                    novel,
                    chapter,
                };
            });

            setActivities(fullActivities);
        } catch (error) {
            console.error("Error fetching activity:", error);
            toast({
                title: "Error",
                description: "Failed to load recent activity.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Recent Activity (Comments)</h2>
                <Button onClick={fetchActivities} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="w-[40%]">Comment</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <BarLoader className="justify-center" />
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!loading && activities.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No recent activity found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && activities.length > 0 && (
                            activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {/* Avatar could go here if available */}
                                            <span>{activity.author?.username || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-pre-wrap text-sm">
                                        <div className="line-clamp-2" title={activity.content}>
                                            {activity.content}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="font-medium">{activity.novel?.title || "Unknown Novel"}</span>
                                            {activity.chapter && (
                                                <span className="text-muted-foreground text-xs">
                                                    Chapter {activity.chapter.chapter_number}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {activity.novel && (
                                            <Button variant="ghost" size="icon" asChild title="View Context">
                                                <Link
                                                    to={
                                                        activity.chapter
                                                            ? `/series/${activity.novel.slug}/chapter/${activity.chapter.chapter_number}`
                                                            : `/series/${activity.novel.slug}`
                                                    }
                                                    target="_blank"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
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

export default Activity;
