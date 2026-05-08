import { WishlistWine, WineType } from "@/types/wine";
import { motion } from "framer-motion";
import { Wine as WineIcon, Grape, Trash2, Calendar, UtensilsCrossed, Star, Sparkles, ShoppingBasket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeConfig: Record<WineType, { label: string; className: string; iconColor: string }> = {
  red: { label: "Red", className: "bg-wine-red text-primary-foreground", iconColor: "text-[#722F37]" },
  white: { label: "White", className: "bg-wine-white text-foreground", iconColor: "text-[#F5E6C8]" },
  champagne: { label: "Champagne", className: "bg-wine-champagne text-foreground", iconColor: "text-[#F7E7CE]" },
  sparkling: { label: "Sparkling", className: "bg-wine-champagne text-foreground", iconColor: "text-[#E8D4B8]" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High priority", className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-primary/10 text-primary border-primary/20" },
  low: { label: "Someday", className: "bg-muted text-muted-foreground border-border" },
};

const WineTypeIcon = ({ type }: { type: WineType }) => {
  const config = typeConfig[type];
  if (type === "sparkling" || type === "champagne") {
    return (
      <div className="relative">
        <WineIcon className={`w-8 h-8 ${config.iconColor}`} />
        <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
      </div>
    );
  }
  return <WineIcon className={`w-8 h-8 ${config.iconColor}`} />;
};

interface WishlistCardProps {
  wine: WishlistWine;
  onDelete: (id: string) => void;
  onMoveToCellar: (id: string) => void;
  index: number;
}

export function WishlistCard({ wine, onDelete, onMoveToCellar, index }: WishlistCardProps) {
  const config = typeConfig[wine.type];
  const priority = priorityConfig[wine.priority] || priorityConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative flex flex-col rounded-lg border border-border bg-card p-5 h-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className={config.className}>{config.label}</Badge>
            {wine.vintage && <span className="text-sm text-muted-foreground">{wine.vintage}</span>}
            <Badge variant="outline" className={priority.className}>{priority.label}</Badge>
          </div>
          <h3 className="font-heading text-lg font-semibold break-words line-clamp-3">{wine.name}</h3>
          {wine.winery && (
            <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
              <Grape className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="break-words line-clamp-2">{wine.winery}</span>
            </p>
          )}
          {(wine.region || wine.country) && (
            <p className="text-sm text-muted-foreground mt-0.5 break-words line-clamp-2">
              {[wine.region, wine.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <WineTypeIcon type={wine.type} />
        </div>
      </div>

      {(wine.drink_from || wine.drink_until) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            Best: {wine.drink_from || "?"} – {wine.drink_until || "?"}
          </span>
        </div>
      )}

      {wine.food_pairings && wine.food_pairings.length > 0 && (
        <div className="mt-2 flex items-start gap-2 text-sm">
          <UtensilsCrossed className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {wine.food_pairings.map((food) => (
              <Badge key={food} variant="outline" className="text-xs font-normal">{food}</Badge>
            ))}
          </div>
        </div>
      )}

      {wine.vivino_rating && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs bg-[#AA1E3A]/10 text-[#AA1E3A] border-[#AA1E3A]/20 font-medium">
            <Star className="w-3 h-3 fill-current mr-1" />
            Vivino {wine.vivino_rating}
          </Badge>
        </div>
      )}

      {wine.notes && (
        <p className="mt-2 text-sm text-muted-foreground italic line-clamp-2">"{wine.notes}"</p>
      )}

      <div className="mt-auto pt-4 border-t flex items-center justify-end gap-1">
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => onMoveToCellar(wine.id)}
          title="I bought this — move to cellar"
        >
          <ShoppingBasket className="w-3.5 h-3.5" />
          Got it
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(wine.id)}
          title="Remove from wishlist"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
