import { Link } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const RequestSection = () => {
    const { t } = useLanguage();
    return (
        <section className="section-container py-8">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">

                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 text-center md:text-left z-10">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground">
                        {t("request.title")}
                    </h3>
                    <p className="text-muted-foreground max-w-xl">
                        {t("request.subtitle")}
                    </p>
                </div>

                <div className="z-10">
                    <Button asChild size="lg" className="group shadow-lg shadow-primary/20">
                        <Link to="/request" className="flex items-center gap-2">
                            <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {t("request.button")}
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default RequestSection;
