import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { BADGE_TIERS } from "@/lib/badgeSystem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Check, Crown } from "lucide-react";

interface BadgeListModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentCount: number;
}

const BadgeListModal = ({ isOpen, onOpenChange, currentCount }: BadgeListModalProps) => {
    // Logic untuk menentukan tier user saat ini
    const currentTierIndex = BADGE_TIERS.filter(tier => currentCount >= tier.minChapters).length - 1;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <DialogHeader className="mb-2">
                    <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-xl">
                        <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Cultivation Realm
                    </DialogTitle>
                    <DialogDescription>
                        Read chapters to ascend the heavens!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2 shrink-0">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                        <span className="text-muted-foreground text-sm">User Achievement</span>
                        <span className="font-bold font-mono text-lg text-primary">{currentCount} Chapters</span>
                    </div>
                </div>

                <ScrollArea className="h-[60vh] pr-4 -mr-4">
                    <div className="space-y-3 pb-4 px-1">
                        {BADGE_TIERS.map((tier, index) => {
                            const isUnlocked = index <= currentTierIndex;
                            const isCurrent = index === currentTierIndex;
                            const isGod = tier.style.glow === "rainbow";

                            // Base styles
                            let containerClass = "relative p-3 rounded-lg border flex items-center gap-4 transition-all duration-300 ";
                            let containerStyle: React.CSSProperties = {};

                            if (isUnlocked) {
                                containerClass += "opacity-100 ";

                                // Handling Style Container
                                if (isCurrent) {
                                    containerClass += "bg-accent/10 ";
                                    // Efek Glow Khusus Container jika Current Rank
                                    if (isGod) {
                                        containerStyle.boxShadow = "inset 0 0 20px rgba(255, 215, 0, 0.15)";
                                        containerStyle.border = "1px solid rgba(255, 215, 0, 0.5)";
                                    } else {
                                        containerStyle.borderColor = tier.style.border;
                                        containerStyle.borderLeftWidth = "4px"; // Penanda visual rank aktif
                                    }
                                } else {
                                    // Rank yang sudah lewat
                                    containerStyle.borderColor = "transparent";
                                    containerStyle.background = "transparent";
                                }
                            } else {
                                // Rank Terkunci
                                containerClass += "opacity-40 grayscale bg-muted/20 border-transparent";
                            }

                            return (
                                <div
                                    key={tier.name}
                                    className={containerClass}
                                    style={containerStyle}
                                >
                                    {/* Icon Status */}
                                    <div className="shrink-0">
                                        {isUnlocked ? (
                                            <div className={`rounded-full p-1 shadow-sm ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <Lock className="w-4 h-4 text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Badge Preview Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex flex-col items-start gap-2">
                                                {/* BADGE PREVIEW (Render Visual Badge) */}
                                                <div
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border select-none"
                                                    style={{
                                                        background: tier.style.background,
                                                        color: tier.style.color,
                                                        borderColor: tier.style.border,
                                                        boxShadow: isGod
                                                            ? "0 0 10px rgba(255,255,255,0.5), 0 0 5px rgba(255,0,255,0.3)"
                                                            : (tier.style.glow ? `0 0 5px ${tier.style.glow}60` : 'none'),
                                                        textShadow: tier.style.textShadow || 'none',
                                                        backgroundClip: isGod ? "padding-box" : "border-box"
                                                    }}
                                                >
                                                    {tier.name}
                                                </div>
                                            </div>

                                            <span className="text-xs font-mono font-medium text-muted-foreground">
                                                {tier.minChapters}+
                                            </span>
                                        </div>

                                        {isCurrent && (
                                            <p className="text-[10px] text-primary/80 font-medium mt-1 animate-pulse">
                                                Current Realm
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default BadgeListModal;