import { useState, useEffect } from "react";
import { Filter, ChevronDown, Search } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "react-router-dom";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

type Novel = Pick<Tables<"novels">, "id" | "title" | "cover_url" | "rating" | "status" | "slug"> & {
  chapters_count?: number;
};

const genres = ["All", "Wuxia", "Xianxia", "Xuanhuan", "Fantasy", "Martial Arts", "Romance", "Action", "Adventure"];
const sortOptions = ["Popular", "Newest", "Rating", "Alphabetical"];

const Catalog = () => {
  const { t, languageFilter } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get("genre");

  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (genreParam) {
      const normalizedGenre = genreParam.replace(/-/g, " ");
      const matchedGenre = genres.find(g => g.toLowerCase() === normalizedGenre.toLowerCase()) ||
        normalizedGenre.charAt(0).toUpperCase() + normalizedGenre.slice(1);
      setSelectedGenre(matchedGenre);
    } else {
      setSelectedGenre("All");
    }
  }, [genreParam]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const NOVELS_PER_PAGE = 12;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filter variables change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
  }, [selectedGenre, sortBy, debouncedSearchQuery, languageFilter]);

  const { data: queryData, isLoading, isFetching, error } = useQuery({
    queryKey: ["catalog", selectedGenre, sortBy, debouncedSearchQuery, languageFilter, page],
    queryFn: async () => {
      // Split query to avoid LATERAL join timeout
      // Query 1: Get novels with filters and pagination
      let query = supabase
        .from("novels")
        .select("id, title, cover_url, rating, status, slug")
        .eq("is_published", true)
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (debouncedSearchQuery) {
        query = query.ilike("title", `%${debouncedSearchQuery}%`);
      }

      if (selectedGenre !== "All") {
        query = query.contains("genres", [selectedGenre]);
      }

      switch (sortBy) {
        case "Popular":
          query = query.order("views", { ascending: false });
          break;
        case "Newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "Rating":
          query = query.order("rating", { ascending: false });
          break;
        case "Alphabetical":
          query = query.order("title", { ascending: true });
          break;
        default:
          query = query.order("views", { ascending: false });
      }

      query = query.range(page * NOVELS_PER_PAGE, (page + 1) * NOVELS_PER_PAGE - 1);

      const { data: novelsData, error: novelsError } = await query;
      if (novelsError) throw novelsError;
      if (!novelsData || novelsData.length === 0) return [];

      // Query 2: Get chapter counts for the novels on this page
      const novelIds = novelsData.map(n => n.id);
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("novel_id")
        .in("novel_id", novelIds)
        .eq("language", "id");

      if (chaptersError) throw chaptersError;

      // Count chapters per novel
      const chapterCounts = new Map<string, number>();
      chaptersData?.forEach(ch => {
        chapterCounts.set(ch.novel_id, (chapterCounts.get(ch.novel_id) || 0) + 1);
      });

      // Combine results
      return novelsData.map(novel => ({
        ...novel,
        chapters_count: chapterCounts.get(novel.id) || 0,
      }));
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // Cache 2 minutes - catalog updates moderately
    gcTime: 10 * 60 * 1000, // Keep in memory 10 minutes
  });

  // Sync queryData to novels state for load-more functionality
  useEffect(() => {
    if (queryData) {
      if (queryData.length < NOVELS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Data already has chapters_count from query
      setNovels(prev => {
        if (page === 0) {
          return queryData;
        } else {
          const existingIds = new Set(prev.map(n => n.id));
          const filteredNew = queryData.filter(n => !existingIds.has(n.id));
          return [...prev, ...filteredNew];
        }
      });
    }
  }, [queryData, page]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching novels:", error);
      toast({
        title: "Error",
        description: "Failed to load novels",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ genre: genre.toLowerCase() });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-border py-8">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-4">
            {selectedGenre !== "All" ? `${t("catalog.archive")} ${selectedGenre}` : t("catalog.browse")}
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("catalog.search")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40 justify-between">
                    <span className="truncate">{t("catalog.genre")}: {selectedGenre}</span>
                    <Filter className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {genres.map((genre) => (
                    <DropdownMenuItem key={genre} onClick={() => handleGenreSelect(genre)}>
                      {genre}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40 justify-between">
                    <span className="truncate">{t("catalog.sort")}: {t(`sort.${sortBy.toLowerCase()}`) !== `sort.${sortBy.toLowerCase()}` ? t(`sort.${sortBy.toLowerCase()}`) : sortBy}</span>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {sortOptions.map((option) => (
                    <DropdownMenuItem key={option} onClick={() => setSortBy(option)}>
                      {t(`sort.${option.toLowerCase()}`) !== `sort.${option.toLowerCase()}` ? t(`sort.${option.toLowerCase()}`) : option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="section-container py-8">
        <SectionHeader title={`${t("catalog.allSeries")} (${novels.length})`} />

        {isLoading && page === 0 ? (
          <div className="flex justify-center py-20">
            <BarLoader />
          </div>
        ) : novels.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 mt-6">
              {novels.map((novel) => (
                <NovelCard
                  key={novel.id}
                  title={novel.title}
                  cover={novel.cover_url || ""}
                  rating={novel.rating || 0}
                  status={novel.status as any}
                  chapters={novel.chapters_count || 0}
                  size="auto"
                  id={novel.id}
                  slug={novel.slug}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setPage(prev => prev + 1);
                  }}
                  disabled={isFetching}
                >
                  {isFetching ? <BarLoader /> : t("catalog.loadMore")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>{t("catalog.noNovels")}</p>
            <Button
              variant="link"
              onClick={() => {
                setSelectedGenre("All");
                setSearchQuery("");
              }}
            >
              {t("catalog.clearFilters")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
