
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function SecuritySettings() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function updatePassword() {
        if (password !== confirmPassword) {
            toast.error(t("security.errorMismatch"));
            return;
        }

        if (password.length < 6) {
            toast.error(t("security.errorLength"));
            return;
        }

        if (!currentPassword) {
            toast.error(t("security.errorMissing"));
            return;
        }

        try {
            setLoading(true);

            // Verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: currentPassword,
            });

            if (signInError) {
                toast.error(t("security.errorIncorrect"));
                setLoading(false);
                return;
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;
            toast.success(t("security.success"));
            setCurrentPassword("");
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h3 className="text-lg font-medium">{t("security.title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("security.subtitle")}
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="current-password">{t("security.currentPassword")}</Label>
                    <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t("security.currentPasswordPlaceholder")}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="new-password">{t("security.newPassword")}</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("security.newPasswordPlaceholder")}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="confirm-password">{t("security.confirmPassword")}</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("security.confirmPasswordPlaceholder")}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button onClick={updatePassword} disabled={loading || !password || !currentPassword}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("security.updateBtn")}
                </Button>
            </div>
        </div>
    );
}
