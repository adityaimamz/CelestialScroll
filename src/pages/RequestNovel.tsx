import { MessageCircle, AlertTriangle, BookOpen } from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/contexts/LanguageContext";

const RequestNovel = () => {
    const { t } = useLanguage();

    const REQUEST_NOVEL_ID = "00000000-0000-0000-0000-000000000000";

    return (
        <div className="min-h-screen pb-20 pt-24">
            <main className="section-container space-y-8">

                {/* Header Section */}
                <div className="space-y-6 text-center flex flex-col items-center max-w-3xl mx-auto">
                    <SectionHeader
                        title={t("requestPage.title")}
                        subtitle={t("requestPage.subtitle")}
                    />

                    <div className="bg-card/50 border border-border rounded-xl p-6 space-y-4 text-left shadow-sm">
                        {/* <div className="flex gap-4 items-start">
                            <BookOpen className="w-6 h-6 text-primary shrink-0 mt-1" />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">Sumber Terjemahan</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Disini cuman menerjemahkan novel yang udah ada terjemahannya di
                                    <span className="text-primary font-medium"> NovelUpdates</span> atau
                                    <span className="text-primary font-medium"> J-Novel </span>
                                    untuk LN Jepang.
                                </p>
                            </div>
                        </div> */}

                        {/* <div className="h-px bg-border/50" /> */}

                        <div className="flex gap-4 items-start">
                            <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">{t("requestPage.dmcaTitle")}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t("requestPage.dmcaDesc1")} <span className="text-destructive font-medium">Novelpia</span>{t("requestPage.dmcaDesc2")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="max-w-4xl mx-auto pt-8">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {t("requestPage.comments")}
                        </h3>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
                        <CommentsSection novelId={REQUEST_NOVEL_ID} />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default RequestNovel;
