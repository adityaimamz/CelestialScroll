import { Star } from "lucide-react";

interface NovelCardProps {
  title: string;
  cover: string;
  rating?: number;
  status?: "ongoing" | "completed";
  chapters?: number;
  genre?: string;
  size?: "small" | "medium" | "large";
}

const NovelCard = ({ 
  title, 
  cover, 
  rating, 
  status,
  chapters,
  genre,
  size = "medium" 
}: NovelCardProps) => {
  const sizeClasses = {
    small: "w-32",
    medium: "w-40",
    large: "w-48",
  };

  const imageHeights = {
    small: "h-44",
    medium: "h-56",
    large: "h-64",
  };

  return (
    <div className={`novel-card group cursor-pointer flex-shrink-0 ${sizeClasses[size]}`}>
      <div className={`relative overflow-hidden rounded-xl ${imageHeights[size]}`}>
        <img
          src={cover}
          alt={title}
          className="novel-card-image w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Status Badge */}
        {status && (
          <div className="absolute top-2 left-2">
            <span className={`status-badge ${status === "ongoing" ? "status-badge-ongoing" : "status-badge-completed"}`}>
              {status}
            </span>
          </div>
        )}

        {/* Genre Tag */}
        {genre && (
          <div className="absolute top-2 right-2">
            <span className="genre-pill text-[10px]">{genre}</span>
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Chapters */}
        {chapters && (
          <div className="absolute bottom-2 right-2">
            <span className="text-xs text-muted-foreground">{chapters} Ch</span>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </div>
  );
};

export default NovelCard;
