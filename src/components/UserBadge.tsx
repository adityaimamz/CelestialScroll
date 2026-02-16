import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getBadgeInfo, getBadgeStageInfo } from "@/lib/badgeSystem";
import { Circle, Star, Sparkles } from "lucide-react";
import BadgeListModal from "./BadgeListModal";

interface UserBadgeProps {
    chapterCount: number;
    size?: "sm" | "md";
    className?: string;
}

const UserBadge = ({ chapterCount, size = "sm", className = "" }: UserBadgeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const badgeInfo = getBadgeStageInfo(chapterCount);
    const { style, currentStage, stageLabel } = badgeInfo;

    // Style khusus untuk Tier Tertinggi (Rainbow/God)
    const isGodTier = style.glow === "rainbow";
    const godEffect = badgeInfo.godStageEffect as any; // Cast to access new props

    const badgeStyle: React.CSSProperties = {
        background: style.background,
        color: style.color,
        borderColor: isGodTier && godEffect?.borderColor ? godEffect.borderColor : (isGodTier ? "#FFFFFF" : style.border),
        borderWidth: "1px",
        borderStyle: "solid",
        boxShadow: isGodTier && godEffect
            ? godEffect.boxShadow
            : (style.glow ? `0 0 5px ${style.glow}60` : 'none'),
        textShadow: style.textShadow || "none",
        backgroundClip: isGodTier ? "padding-box" : "border-box",
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
        // CSS variable untuk mengatur kecepatan & warna animasi glow per God stage
        ...(isGodTier && godEffect ? {
            ['--god-glow-speed' as string]: godEffect.animationSpeed,
            ['--god-glow-color' as string]: godEffect.glowColor,
        } : {}),
    };

    return (
        <>
            <Badge
                variant="outline" // Base variant
                className={`
                    hover:scale-105 transition-all active:scale-95 select-none font-bold
                    ${isGodTier ? 'animate-god-glow' : ''}
                    ${className} 
                    ${size === "sm"
                        ? "text-[8px] px-1.5 h-4 rounded md:text-[10px] md:px-3 md:h-5"
                        : "text-[9px] px-2 py-0.5 rounded md:text-xs md:px-3 md:py-1"
                    }
                `}
                style={badgeStyle}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
            >
                <span className="flex items-center gap-0.5">
                    {badgeInfo.name}
                    <span className="font-bold flex items-center gap-0.5 ml-0.5">
                        {badgeInfo.isGodTier
                            ? <><Sparkles className="w-2.5 h-2.5 fill-current" /> {currentStage}</>
                            : <>{currentStage} {stageLabel === 'Chakra' ? <Circle className="w-2 h-2 fill-current -translate-y-[-0.3px]" /> : <Star className="w-2.5 h-2.5 fill-current" />}</>
                        }
                    </span>
                </span>
            </Badge>

            <BadgeListModal
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                currentCount={chapterCount}
            />
        </>
    );
};

export default UserBadge;