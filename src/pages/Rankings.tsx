import { useState, useEffect } from 'react'
import { Trophy, BookOpen, Star, Eye } from 'lucide-react'

import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

type Novel = Tables<"novels"> & {
    chapters_count?: number;
};

const Rankings = () => {
    const { t } = useLanguage();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("novels")
                .select("*, chapters(count)")
                .order("views", { ascending: false })
                .eq("is_published", true)
                .eq("chapters.language", "id")
                .neq("id", "00000000-0000-0000-0000-000000000000")
                .limit(50); // Fetch top 50

            if (error) throw error;

            if (data) {
                const novelsWithChapterCount = data.map(novel => ({
                    ...novel,
                    chapters_count: novel.chapters?.[0]?.count || 0,
                }));
                setNovels(novelsWithChapterCount);
            }
        } catch (error) {
            console.error("Error fetching rankings:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-background text-foreground flex flex-col'>
            {/* Header */}
            <div className=' pt-16 pb-24 mb-8'>
                <div className='container mx-auto px-4'>
                    <div className="flex flex-col md:flex-row md:items-center justify-center text-center md:text-left gap-4">
                        <div>
                            <h1 className='text-3xl lg:text-4xl font-bold flex items-center justify-center md:justify-start gap-3'>
                                <Trophy className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500" />
                                {t("rankings.title")}
                            </h1>
                            <p className="text-muted-foreground mt-2 flex items-center justify-center text-lg">{t("rankings.subtitle")}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className='container mx-auto px-4 pb-12 flex-1'>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground">{t("rankings.loading")}</p>
                    </div>
                ) : (
                    <>
                        {/* Podium Section - Only if we have at least 1 novel */}
                        {novels.length > 0 && (
                            <div className='mb-16 mt-8'>
                                <div className='flex flex-wrap justify-center items-end gap-4 md:gap-8 max-w-4xl mx-auto'>

                                    {/* 2nd Place */}
                                    {novels[1] && (
                                        <div className='order-1 md:order-1 flex-1 min-w-[140px] max-w-[200px] text-center flex flex-col items-center z-10'>
                                            <div className='relative group w-full'>
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                                                    <div className='h-10 w-10 rounded-full bg-silver text-black font-bold flex items-center justify-center border-2 border-white shadow-lg'>
                                                        2
                                                    </div>
                                                </div>
                                                <Link to={`/series/${novels[1].slug}`}>
                                                    <div className='w-full aspect-[2/3] rounded-lg overflow-hidden border-4 border-silver/50 shadow-2xl relative transition-transform hover:scale-105 duration-300 bg-card'>
                                                        <img
                                                            src={novels[1].cover_url || "/placeholder.jpg"}
                                                            alt={novels[1].title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="mt-4 space-y-1 w-full">
                                                <Link to={`/series/${novels[1].slug}`} className="font-bold text-sm md:text-lg line-clamp-2 hover:text-primary transition-colors block leading-tight min-h-[3rem]">
                                                    {novels[1].title}
                                                </Link>
                                                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {novels[1].views.toLocaleString()}</span>
                                                </div>
                                                <div className="text-silver font-bold text-sm flex items-center justify-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" /> {novels[1].rating?.toFixed(1) || "N/A"}
                                                </div>
                                            </div>

                                            <div className="w-full h-3 bg-silver/20 mt-4 rounded-full"></div>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {novels[0] && (
                                        <div className='order-0 md:order-2 flex-1 min-w-[160px] max-w-[240px] text-center flex flex-col items-center z-20 -mt-8 md:-mt-16'>
                                            <div className='relative group w-full'>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
                                                    <Trophy className='h-14 w-14 text-gold drop-shadow-lg animate-bounce duration-[2000ms]' />
                                                </div>
                                                <Link to={`/series/${novels[0].slug}`}>
                                                    <div className='w-full aspect-[2/3] rounded-lg overflow-hidden border-4 border-gold shadow-[0_0_30px_rgba(255,215,0,0.3)] relative transition-transform hover:scale-105 duration-300 bg-card'>
                                                        <img
                                                            src={novels[0].cover_url || "/placeholder.jpg"}
                                                            alt={novels[0].title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Shine effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="mt-6 space-y-1 w-full">
                                                <Link to={`/series/${novels[0].slug}`} className="font-bold text-lg md:text-xl line-clamp-2 hover:text-primary transition-colors block leading-tight min-h-[3.5rem]">
                                                    {novels[0].title}
                                                </Link>
                                                <div className="flex items-center justify-center gap-2 text-sm text-gold font-mono font-bold">
                                                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {novels[0].views.toLocaleString()}</span>
                                                </div>
                                                <div className="text-gold font-bold text-base flex justify-center items-center gap-1">
                                                    <Star className="w-4 h-4 fill-current" /> {novels[0].rating?.toFixed(1) || "N/A"}
                                                </div>
                                            </div>

                                            <div className="w-full h-4 bg-gold/20 mt-4 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {novels[2] && (
                                        <div className='order-2 md:order-3 flex-1 min-w-[140px] max-w-[200px] text-center flex flex-col items-center z-10'>
                                            <div className='relative group w-full'>
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                                                    <div className='h-10 w-10 rounded-full bg-bronze text-white font-bold flex items-center justify-center border-2 border-white shadow-lg'>
                                                        3
                                                    </div>
                                                </div>
                                                <Link to={`/series/${novels[2].slug}`}>
                                                    <div className='w-full aspect-[2/3] rounded-lg overflow-hidden border-4 border-bronze/50 shadow-2xl relative transition-transform hover:scale-105 duration-300 bg-card'>
                                                        <img
                                                            src={novels[2].cover_url || "/placeholder.jpg"}
                                                            alt={novels[2].title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="mt-4 space-y-1 w-full">
                                                <Link to={`/series/${novels[2].slug}`} className="font-bold text-sm md:text-lg line-clamp-2 hover:text-primary transition-colors block leading-tight min-h-[3rem]">
                                                    {novels[2].title}
                                                </Link>
                                                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {novels[2].views.toLocaleString()}</span>
                                                </div>
                                                <div className="text-bronze font-bold text-sm flex items-center justify-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" /> {novels[2].rating?.toFixed(1) || "N/A"}
                                                </div>
                                            </div>

                                            <div className="w-full h-3 bg-bronze/20 mt-4 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Leaderboard Table */}
                        <div className='max-w-5xl mx-auto'>
                            <h2 className='text-2xl font-bold mb-6 flex items-center gap-2 px-2'>
                                <BookOpen className="w-6 h-6 text-primary" />
                                {t("rankings.leaderboard")}
                            </h2>
                            <div className='overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm'>
                                <table className='w-full text-sm md:text-base'>
                                    <thead>
                                        <tr className='border-b border-border/40 text-muted-foreground bg-muted/40'>
                                            <th className='text-left py-4 px-4 md:px-6 font-medium w-16 md:w-24'>{t("rankings.rank")}</th>
                                            <th className='text-left py-4 px-4 md:px-6 font-medium'>{t("rankings.seriesTitle")}</th>
                                            <th className='hidden sm:table-cell text-center py-4 px-4 md:px-6 font-medium'>{t("rankings.chapters")}</th>
                                            <th className='text-center py-4 px-4 md:px-6 font-medium'>{t("rankings.rating")}</th>
                                            <th className='text-right py-4 px-4 md:px-6 font-medium'>{t("rankings.totalViews")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {novels.slice(3).map((novel, index) => (
                                            <tr
                                                key={novel.id}
                                                className='border-b border-border/20 hover:bg-muted/30 transition-colors last:border-0 group'
                                            >
                                                <td className='py-4 px-4 md:px-6 font-bold font-mono text-muted-foreground/70'>
                                                    #{index + 4}
                                                </td>
                                                <td className='py-4 px-4 md:px-6'>
                                                    <Link to={`/series/${novel.slug}`} className="flex items-center gap-4 group-hover:text-primary transition-colors">
                                                        <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 hidden md:block bg-muted">
                                                            <img src={novel.cover_url || "/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="font-medium line-clamp-1">{novel.title}</span>
                                                    </Link>
                                                </td>
                                                <td className='hidden sm:table-cell py-4 px-4 md:px-6 text-center text-muted-foreground'>
                                                    {novel.chapters_count}
                                                </td>
                                                <td className='py-4 px-4 md:px-6 text-center text-yellow-500 font-bold'>
                                                    {novel.rating?.toFixed(1) || "-"}
                                                </td>
                                                <td className='py-4 px-4 md:px-6 text-right font-mono'>
                                                    {novel.views.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Rankings;
