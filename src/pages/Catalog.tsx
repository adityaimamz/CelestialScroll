import { useState, useEffect } from "react";
import { Filter, ChevronDown, Search, Loader2 } from "lucide-react";
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

type Novel = Tables<"novels"> & {
  chapters_count?: number;
};

const genres = ["All", "Wuxia", "Xianxia", "Xuanhuan", "Fantasy", "Martial Arts", "Romance", "Action", "Adventure"];
const sortOptions = ["Popular", "Newest", "Rating", "Alphabetical"];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get("genre");

  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (genreParam) {
      // Find matching genre case-insensitive or just use capitalize
      // Handle slugs with hyphens (e.g., martial-arts -> martial arts)
      const normalizedGenre = genreParam.replace(/-/g, " ");
      const matchedGenre = genres.find(g => g.toLowerCase() === normalizedGenre.toLowerCase()) ||
        normalizedGenre.charAt(0).toUpperCase() + normalizedGenre.slice(1);
      setSelectedGenre(matchedGenre);
    } else {
      setSelectedGenre("All");
    }
  }, [genreParam]);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      fetchNovels();
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedGenre, sortBy, searchQuery]);

  const fetchNovels = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("novels")
        .select("*, chapters(count)");

      // Search
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      // Filter
      if (selectedGenre !== "All") {
        query = query.contains("genres", [selectedGenre]);
      }

      // Sort
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

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const novelsWithChapterCount = data.map(novel => ({
          ...novel,
          chapters_count: novel.chapters?.[0]?.count || 0,
        }));
        setNovels(novelsWithChapterCount);
      }
    } catch (error) {
      console.error("Error fetching novels:", error);
      toast({
        title: "Error",
        description: "Failed to load novels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            {selectedGenre !== "All" ? `Archive for ${selectedGenre}` : "Browse Series"}
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search series..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40 justify-between">
                    <span className="truncate">Genre: {selectedGenre}</span>
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
                    <span className="truncate">Sort: {sortBy}</span>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {sortOptions.map((option) => (
                    <DropdownMenuItem key={option} onClick={() => setSortBy(option)}>
                      {option}
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
        <SectionHeader title={`All Series (${novels.length})`} />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : novels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 mt-6">
            {novels.map((novel) => (
              <NovelCard
                key={novel.id}
                title={novel.title}
                cover={novel.cover_url || ""}
                rating={novel.rating || 0}
                status={novel.status as any}
                chapters={novel.chapters_count || 0}
                genre={novel.genres?.[0] || "Unknown"}
                size="medium"
                id={novel.id}
                slug={novel.slug}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>No novels found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSelectedGenre("All");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
