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
        borderColor: isGodTier ? "transparent" : style.border,
        borderWidth: "1px",
        borderStyle: "solid",
        // Logic Glow:
        boxShadow: isGodTier
            ? "0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255,255,255,0.8)"
            : style.glow
                ? `0 0 8px ${style.glow}80, inset 0 0 4px rgba(255,255,255,0.2)`
                : "none",
        textShadow: style.textShadow || "none",
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
    };

    // Class tambahan untuk teks gradient pada tier God
    const godTierTextClass = isGodTier
        ? "bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 font-extrabold animate-pulse"
        : "";

    // Class tambahan untuk border pelangi pada tier God
    const godTierContainerClass = isGodTier
        ? "before:absolute before:inset-0 before:-z-10 before:p-[1px] before:bg-gradient-to-r before:from-red-500 before:via-green-500 before:to-blue-500 before:rounded-md before:content-[''] before:m-[-1px]"
        : "";

    return (
        <>
            <Badge
                variant="outline" // Base variant
                className={`
                    hover:scale-105 transition-all active:scale-95 select-none 
                    ${className} 
                    ${size === "sm"
                        ? "text-[8px] px-1.5 h-4 rounded-sm md:text-[10px] md:px-3 md:h-5 md:rounded-md"
                        : "text-[9px] px-2 py-0.5 rounded-sm md:text-xs md:px-3 md:py-1 md:rounded-md"
                    }
                    ${godTierContainerClass}
                `}
                style={badgeStyle}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
            >
                <span className={godTierTextClass}>
                    {tier.name}
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