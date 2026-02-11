
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export function ProfileSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("username, bio, avatar_url")
                .eq("id", user!.id)
                .single();

            if (error) {
                console.warn(error);
            }

            if (data) {
                setUsername(data.username || "");
                setBio(data.bio || "");
                setAvatarUrl(data.avatar_url || "");
            }
        } catch (error) {
            console.error("Error loading user data!", error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setLoading(true);

            const updates = {
                id: user!.id,
                username,
                bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("profiles").upsert(updates);

            if (error) throw error;
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    // Placeholder for future file upload implementation
    // const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => { ... }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                </p>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Avatar className="w-24 h-24 border-2 border-border">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="text-2xl">{username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        {/* Visual cue that avatar is editable (even if just via URL for now) */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-not-allowed" title="Avatar upload coming soon">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <Label className="text-sm font-medium ml-5">Avatar Image</Label>
                        <div className="flex items-center gap-4">
                            <ImageUpload
                                value={avatarUrl}
                                onChange={(url) => setAvatarUrl(url || "")}
                                endpoint="imageUploader"
                            />
                            <div className="text-xs text-muted-foreground">
                                <p>Upload a new avatar image.</p>
                                <p>Max size 4MB.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email} disabled className="bg-muted text-muted-foreground" />
                    <p className="text-[0.8rem] text-muted-foreground">
                        This is your e-mail and cannot be changed.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                        This is your public display name.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none h-24"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button onClick={updateProfile} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update profile
                </Button>
            </div>
        </div>
    );
}
