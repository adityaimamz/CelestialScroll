
import { User, Shield, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SettingsLayoutProps {
    children: React.ReactNode;
    activeTab: "profile" | "security";
    onTabChange: (tab: "profile" | "security") => void;
}

export function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
    const sidebarItems = [
        {
            id: "profile" as const,
            label: "Profile",
            icon: User,
            description: "Manage your public profile",
        },
        {
            id: "security" as const,
            label: "Security",
            icon: Shield,
            description: "Manage your password and account security",
        },
    ];

    return (
        <div className="container max-w-6xl py-10 animate-fade-in">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-64 flex-shrink-0">
                    <nav className="flex flex-col gap-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={item.id}
                                    variant={activeTab === item.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "justify-start gap-3 h-auto py-3",
                                        activeTab === item.id && "bg-secondary"
                                    )}
                                    onClick={() => onTabChange(item.id)}
                                >
                                    <Icon className="w-4 h-4" />
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 min-w-0">
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
