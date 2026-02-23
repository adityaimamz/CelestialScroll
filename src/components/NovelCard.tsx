import { Star, BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface NovelCardProps {
  title: string;
  cover: string;
  rating?: number;
  status?: "ongoing" | "completed";
  chapters?: number;
  genre?: string;
  size?: "small" | "medium" | "large" | "auto";
  id?: string | number;
  slug?: string;
  lastUpdate?: string;
}

const NovelCard = ({
  title,
  cover,
  rating,
  status,
  chapters,
  genre,
  size = "medium",
  id,
  slug,
  lastUpdate
}: NovelCardProps) => {
  // ... (previous helper objects)

  const formattedTime = lastUpdate
    ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })
    : "Recently";

  // ...

  <div className="p-2 space-y-1">
    {chapters ? (
      <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
        Chapter {chapters}
      </h3>
    ) : (
      <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
    )}

    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {chapters && (
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{title}</span>
        </div>
      )}

      {lastUpdate && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{formattedTime}</span>
        </div>
      )}
    </div>
  </div>
  // ...
  const sizeClasses = {
    small: "w-32",
    medium: "w-40",
    large: "w-48",
    auto: "w-full",
  };

  const imageHeights = {
    small: "h-44",
    medium: "h-56",
    large: "h-64",
    auto: "aspect-[2/3]",
  };

  const Content = () => (
    <>
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

      </div>

      <div className="p-2 space-y-1">
        {chapters ? (
          <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
        ) : (
          <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        )}

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {chapters && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-1 font-bold">Chapter {chapters}</span>
            </div>
          )}

          {lastUpdate && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{lastUpdate ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: true }) : "Recently"}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const containerClasses = `novel-card group cursor-pointer flex-shrink-0 ${sizeClasses[size]}`;

  if (id || slug) {
    const linkTo = slug ? `/series/${slug}` : `/series/${id}`;
    return (
      <Link to={linkTo} className={containerClasses}>
        <Content />
      </Link>
    );
  }

  return (
    <div className={containerClasses}>
      <Content />
    </div>
  );
};

export default NovelCard;
