import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            toast({
                title: "Email terkirim!",
                description: "Silakan cek email untuk link reset password Anda.",
            });

            // Optional: Navigate back to login after some time or let them stay
        } catch (error) {
            toast({
                title: "Gagal mengirim email",
                description: (error as Error).message || "Terjadi kesalahan.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-bold text-foreground hidden sm:block">
                                Celestial<span className="text-primary">Scrolls</span>
                            </span>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl">Lupa Password?</CardTitle>
                    <CardDescription>
                        Masukkan email Anda, kami akan mengirimkan link reset password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kirim Link Reset
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link to="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
