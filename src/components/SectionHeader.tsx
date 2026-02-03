import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
}

const SectionHeader = ({ 
  title, 
  subtitle,
  viewAllLink, 
  viewAllText = "View All" 
}: SectionHeaderProps) => {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-muted-foreground text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllLink && (
        <Link 
          to={viewAllLink}
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {viewAllText}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
