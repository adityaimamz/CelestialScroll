
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import UserBadge from "./UserBadge";
import { BarLoader } from "./ui/BarLoader";

interface UserProfileModalProps {
    userId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface UserProfileData {
    id: string;
    username: string | null;
    avatar_url: string | null;
    created_at: string;
    bio: string | null;
    role: "admin" | "moderator" | "user";
    read_count?: number;
}

const UserProfileModal = ({ userId, isOpen, onOpenChange }: UserProfileModalProps) => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<UserProfileData | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserProfile(userId);
        } else if (!isOpen) {
            // Clear profile when closed to prevent flashing old data
            setProfile(null);
        }
    }, [isOpen, userId]);

    const fetchUserProfile = async (id: string) => {
        setLoading(true);
        try {
            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id, username, avatar_url, bio, created_at")
                .eq("id", id)
                .single();

            if (profileError) throw profileError;

            // Fetch role
            const { data: roleData, error: roleError } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", id)
                .maybeSingle();

            if (roleError && roleError.code !== "PGRST116") throw roleError;

            // Fetch reading count
            const { data: readingData, error: readingError } = await (supabase
                .rpc("get_users_reading_counts" as any, { user_ids: [id] }) as any)
                .maybeSingle();

            setProfile({
                ...profileData,
                role: roleData?.role || "user",
                read_count: readingData?.count || 0,
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const config: Record<
            string,
            {
                label: string;
                variant: "default" | "secondary" | "outline";
            }
        > = {
            admin: {
                label: "Immortal King",
                variant: "default",
            },
            moderator: {
                label: "Immortal",
                variant: "secondary",
            },
            user: {
                label: "Mortal",
                variant: "outline",
            },
        };

        const current = config[role] || config.user;

        return (
            <Badge variant={current.variant}>
                {current.label}
            </Badge>
        );
    };


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>
                        Public information about this user.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <BarLoader />                        <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
                    </div>
                ) : null}

                {!loading && profile && (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <Avatar className="h-24 w-24 border-2 border-border">
                            <AvatarImage src={profile.avatar_url || ""} />
                            <AvatarFallback className="text-2xl">
                                {profile.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold">{profile.username || "Anonymous User"}</h2>
                            <div className="flex justify-center gap-2">
                                {getRoleBadge(profile.role)}
                                <UserBadge chapterCount={profile.read_count || 0} size="md" />
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="text-center max-w-[80%]">
                                <p className="text-sm text-muted-foreground italic">
                                    "{profile.bio}"
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-4 py-2 rounded-full">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {format(new Date(profile.created_at), "MMMM d, yyyy")}</span>
                        </div>
                    </div>
                )}

                {!loading && !profile && (
                    <div className="py-8 text-center text-muted-foreground">
                        User not found.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserProfileModal;
