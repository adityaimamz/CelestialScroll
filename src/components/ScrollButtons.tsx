
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp, ArrowDown, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollHideNav } from "@/hooks/useScrollHideNav";

interface ScrollButtonsProps {
    customVisibility?: boolean;
    isAutoScrolling?: boolean;
    onToggleAutoScroll?: () => void;
}

const ScrollButtons = ({ customVisibility, isAutoScrolling, onToggleAutoScroll }: ScrollButtonsProps) => {
    const location = useLocation();
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [showBottomBtn, setShowBottomBtn] = useState(true);
    const scrollHideNav = useScrollHideNav();

    const isReaderPage = location.pathname.includes("/chapter/");
    const isVisible = customVisibility !== undefined ? customVisibility : scrollHideNav;

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show "Scroll to Top" if scrolled down more than 300px
            if (currentScrollY > 300) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }

            // Check if near bottom to hide "Scroll to Bottom"
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (windowHeight + currentScrollY >= documentHeight - 100) {
                setShowBottomBtn(false);
            } else {
                setShowBottomBtn(true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    };

    const isAdminPage = location.pathname.startsWith("/admin");

    if ((isReaderPage && customVisibility === undefined) || isAdminPage) {
        return null;
    }

    return (
        <div className={cn(
            "fixed bottom-20 right-6 flex flex-col gap-2 z-50 transition-transform duration-300",
            isVisible ? "translate-y-0" : "translate-y-[200%]"
        )}>
            <Button
                variant="secondary"
                size="icon"
                className={cn(
                    "rounded-full shadow-md transition-all duration-300 opacity-0 transform translate-y-4 pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90",
                    showTopBtn && "opacity-100 translate-y-0 pointer-events-auto"
                )}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <ArrowUp className="h-5 w-5" />
            </Button>

            {/* Autoscroll Toggle - hidden temporarily 
            {isReaderPage && onToggleAutoScroll && (
                <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                        "rounded-full shadow-md transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto",
                        isAutoScrolling
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    onClick={onToggleAutoScroll}
                    aria-label={isAutoScrolling ? "Pause autoscroll" : "Start autoscroll"}
                >
                    {isAutoScrolling ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
            )} */}

            <Button
                variant="secondary"
                size="icon"
                className={cn(
                    "rounded-full shadow-md transition-all duration-300 opacity-0 transform translate-y-4 pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90",
                    showBottomBtn && "opacity-100 translate-y-0 pointer-events-auto"
                )}
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
            >
                <ArrowDown className="h-5 w-5" />
            </Button>
        </div>
    );
};

export default ScrollButtons;
