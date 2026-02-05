import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { BADGE_TIERS } from "@/lib/badgeSystem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Check } from "lucide-react";

interface BadgeListModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentCount: number;
}

const BadgeListModal = ({ isOpen, onOpenChange, currentCount }: BadgeListModalProps) => {
    const currentTierIndex = BADGE_TIERS.findIndex(
        (tier, index) =>
            currentCount >= tier.minChapters &&
            (index === BADGE_TIERS.length - 1 || currentCount < BADGE_TIERS[index + 1].minChapters)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Cultivation Rank</DialogTitle>
                    <DialogDescription>
                        Read chapters to advance your cultivation realm!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2 shrink-0">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Chapters Read</span>
                        <span className="font-bold font-mono">{currentCount}</span>
                    </div>
                </div>

                <ScrollArea className="h-[60vh] pr-4 -mr-4">
                    <div className="space-y-4 pb-4 px-1">
                        {BADGE_TIERS.map((tier, index) => {
                            const isUnlocked = currentCount >= tier.minChapters;
                            const isCurrent = index === currentTierIndex;

                            let tierClass = "bg-muted/20 border-border/30 opacity-40 grayscale";
                            if (isCurrent) {
                                tierClass = "bg-accent/20 border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]";
                            } else if (isUnlocked) {
                                tierClass = "bg-card/50 border-border/50 opacity-70";
                            }

                            return (
                                <div
                                    key={tier.name}
                                    className={`relative p-3 rounded-lg border flex items-center gap-4 transition-all ${tierClass}`}
                                >
                                    {/* Status Icon */}
                                    <div className="shrink-0">
                                        {isUnlocked ? (
                                            <Check className={`w-5 h-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                                        ) : (
                                            <Lock className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>

                                    {/* Badge Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex flex-col gap-1.5">
                                                <span
                                                    className="font-bold text-sm"
                                                    style={{ color: isUnlocked ? tier.color : undefined }}
                                                >
                                                    {tier.name}
                                                </span>
                                                {/* Badge Preview */}
                                                <div
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit"
                                                    style={{
                                                        backgroundColor: `${tier.color}20`,
                                                        borderColor: `${tier.color}20`,
                                                        color: tier.color,
                                                        boxShadow: tier.glow ? `0 0 6px ${tier.color}40` : "none",
                                                        textShadow: tier.glow ? `0 0 4px ${tier.color}40` : "none",
                                                    }}
                                                >
                                                    {tier.name}
                                                </div>
                                            </div>

                                            <span className="text-xs text-muted-foreground font-mono">
                                                {tier.minChapters}+ Ch
                                            </span>
                                        </div>

                                        {/* Glow effect for high tiers card background */}
                                        {tier.glow && isUnlocked && (
                                            <div className="absolute inset-0 rounded-lg pointer-events-none"
                                                style={{ boxShadow: `inset 0 0 15px ${tier.color}10` }}
                                            />
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
