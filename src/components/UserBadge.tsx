import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getBadgeInfo } from "@/lib/badgeSystem";
import BadgeListModal from "./BadgeListModal";

interface UserBadgeProps {
    chapterCount: number;
    size?: "sm" | "md";
    className?: string;
}

const UserBadge = ({ chapterCount, size = "sm", className = "" }: UserBadgeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const tier = getBadgeInfo(chapterCount);
    const { style } = tier;

    // Style khusus untuk Tier Tertinggi (Rainbow/God)
    const isGodTier = style.glow === "rainbow";

    const badgeStyle: React.CSSProperties = {
        background: style.background,
        color: style.color,
        borderColor: style.border,
        borderWidth: "1px",
        borderStyle: "solid",
        boxShadow: isGodTier
            ? "0 0 10px rgba(255,255,255,0.5), 0 0 5px rgba(255,0,255,0.3)"
            : (style.glow ? `0 0 5px ${style.glow}60` : 'none'),
        textShadow: style.textShadow || "none",
        backgroundClip: isGodTier ? "padding-box" : "border-box",
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
    };

    return (
        <>
            <Badge
                variant="outline" // Base variant
                className={`
                    hover:scale-105 transition-all active:scale-95 select-none font-bold
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
                {tier.name}
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