import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    user_id: string;
    actor_id: string | null;
    type: "reply" | "like" | "system";
    entity_id: string | null;
    is_read: boolean;
    created_at: string;
    actor?: {
        username: string | null;
        avatar_url: string | null;
    };
}

export function NotificationDropdown() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("notifications")
                .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(username, avatar_url)
        `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) {
                console.error("Error fetching notifications:", error);
                return;
            }

            const typedData = data || [];
            // Manually map if join returns array or object, usually object for single relation
            // The select `actor:profiles(...)` usually returns `actor` as object if 1:1 or N:1

            const mappedNotifications = typedData.map((n: any) => ({
                ...n,
                actor: n.actor ? (Array.isArray(n.actor) ? n.actor[0] : n.actor) : null
            }));

            setNotifications(mappedNotifications);
            setUnreadCount(mappedNotifications.filter((n: any) => !n.is_read).length);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Realtime subscription
        const channel = supabase
            .channel("public:notifications")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                async (payload) => {
                    console.log("New notification:", payload);
                    // Simple refresh
                    await fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);


    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) {
            console.error("Error marking notification as read:", error);
            // Revert if needed, but low priority for now
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .in("id", unreadIds);

        if (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Logic to navigate based on type
        if (notification.type === "reply" && notification.entity_id) {
            try {
                // Fetch comment to get novel_id/chapter_id
                const { data: comment } = await supabase
                    .from("comments")
                    .select("novel_id, chapter_id")
                    .eq("id", notification.entity_id)
                    .single();

                if (comment) {
                    // We need slug for novel
                    const { data: novel } = await supabase
                        .from("novels")
                        .select("slug")
                        .eq("id", comment.novel_id)
                        .single();

                    if (novel) {
                        // For now redirect to series page. 
                        // If chapter_id exists, we could redirect to chapter reader if we had chapter number or slug.
                        navigate(`/series/${novel.slug}`);
                    }
                }
            } catch (err) {
                console.error("Nav error", err);
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" className="h-auto p-1 text-xs text-primary hover:text-primary/80" onClick={markAllAsRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.is_read ? "bg-muted/40" : ""
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <Avatar className="w-8 h-8 mt-0.5 border border-border">
                                        <AvatarImage src={notification.actor?.avatar_url || ""} />
                                        <AvatarFallback className="text-xs">
                                            {notification.actor?.username?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm leading-snug">
                                            <span className="font-semibold text-foreground">
                                                {notification.actor?.username || "Someone"}
                                            </span>{" "}
                                            <span className="text-muted-foreground">
                                                {notification.type === "reply" && "replied to your comment"}
                                                {notification.type === "like" && "liked your comment"}
                                                {notification.type === "system" && "sent a system message"}
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 mt-1.5 bg-primary rounded-full shrink-0" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
