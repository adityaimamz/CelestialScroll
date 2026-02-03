import { useState } from "react";
import { Filter, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NovelCard from "@/components/NovelCard";
import SectionHeader from "@/components/SectionHeader";

// Mock Data
const allNovels = [
  {
    id: 1,
    title: "Immortal Sovereign's Path",
    cover: "https://images.unsplash.com/photo-1614726365723-49cfaeb5d8c7?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    status: "ongoing" as const,
    chapters: 1847,
    genre: "Xianxia",
  },
  {
    id: 2,
    title: "The Alchemist's God",
    cover: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=300&auto=format&fit=crop",
    rating: 4.7,
    status: "ongoing" as const,
    chapters: 890,
    genre: "Fantasy",
  },
  {
    id: 3,
    title: "Martial Peak Ascension",
    cover: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=300&auto=format&fit=crop",
    rating: 4.5,
    status: "completed" as const,
    chapters: 3500,
    genre: "Martial Arts",
  },
  {
    id: 4,
    title: "Sword of the Void",
    cover: "https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=300&auto=format&fit=crop",
    rating: 4.8,
    status: "ongoing" as const,
    chapters: 420,
    genre: "Wuxia",
  },
  {
    id: 5,
    title: "Dragon King's Son-in-Law",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop",
    rating: 4.6,
    status: "ongoing" as const,
    chapters: 120,
    genre: "Urban",
  },
  {
    id: 6,
    title: "Reincarnated as a Slime",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    status: "ongoing" as const,
    chapters: 600,
    genre: "Isekai",
  },
];

const genres = ["All", "Xianxia", "Wuxia", "Fantasy", "Martial Arts", "Urban", "Isekai"];
const sortOptions = ["Popular", "Newest", "Rating", "Alphabetical"];

const Catalog = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNovels = allNovels.filter((novel) => {
    const matchesGenre = selectedGenre === "All" || novel.genre === selectedGenre;
    const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-border py-8">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-4">Browse Series</h1>
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
                    <DropdownMenuItem key={genre} onClick={() => setSelectedGenre(genre)}>
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
        <SectionHeader title={`All Series (${filteredNovels.length})`} />
        
        {filteredNovels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6">
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} {...novel} size="medium" />
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
