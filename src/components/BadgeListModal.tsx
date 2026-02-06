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
    const currentTierIndex = BADGE_TIERS.filter(tier => currentCount >= tier.minChapters).length - 1;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" /> 
                        Cultivation Realm
                    </DialogTitle>
                    <DialogDescription>
                        Read chapters to ascend the heavens!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2 shrink-0">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
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

                            // Logic styling container list
                            let containerStyle: React.CSSProperties = {};
                            let containerClass = "relative p-3 rounded-lg border flex items-center gap-4 transition-all ";

                            if (isUnlocked) {
                                containerClass += "opacity-100 ";
                                containerStyle = {
                                    background: isCurrent 
                                        ? "linear-gradient(to right, rgba(255,255,255,0.05), rgba(0,0,0,0.02))" 
                                        : "transparent",
                                    borderColor: isCurrent ? tier.style.border : "transparent",
                                    boxShadow: isCurrent && tier.style.glow 
                                        ? `inset 0 0 20px ${typeof tier.style.glow === 'string' && tier.style.glow !== 'rainbow' ? tier.style.glow + '20' : '#FFD70020'}` 
                                        : "none"
                                };
                                if(isCurrent) containerClass += "bg-accent/10 border-l-4";
                            } else {
                                containerClass += "opacity-50 grayscale bg-muted/30 border-transparent";
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
                                            <div className={`rounded-full p-1 ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
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
                                                {/* BADGE PREVIEW MINIATUR */}
                                                <div
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border shadow-sm"
                                                    style={{
                                                        background: tier.style.background,
                                                        color: tier.style.color,
                                                        borderColor: isGod ? 'transparent' : tier.style.border,
                                                        boxShadow: tier.style.glow && tier.style.glow !== 'rainbow' 
                                                            ? `0 0 5px ${tier.style.glow}60` 
                                                            : 'none',
                                                        textShadow: tier.style.textShadow || 'none'
                                                    }}
                                                >
                                                    {tier.name}
                                                </div>
                                            </div>

                                            <span className="text-xs font-mono font-medium text-muted-foreground">
                                                {tier.minChapters}+
                                            </span>
                                        </div>
                                        
                                        {/* Progress Bar Visual (Optional) */}
                                        {isCurrent && (
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                Current Rank
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