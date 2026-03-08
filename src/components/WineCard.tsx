import { useState } from "react";
import { Wine, WineType } from "@/types/wine";
import { motion } from "framer-motion";
import { Wine as WineIcon, Grape, Trash2, Calendar, UtensilsCrossed, GlassWater, Star, Pencil, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WineRatingDialog } from "@/components/WineRatingDialog";
import { EditWineDialog } from "@/components/EditWineDialog";

const typeConfig: Record<WineType, { label: string; className: string; iconColor: string }> = {
  red: { label: "Red", className: "bg-wine-red text-primary-foreground", iconColor: "text-[#722F37]" },
  white: { label: "White", className: "bg-wine-white text-foreground", iconColor: "text-[#F5E6C8]" },
  champagne: { label: "Champagne", className: "bg-wine-champagne text-foreground", iconColor: "text-[#F7E7CE]" },
  sparkling: { label: "Sparkling", className: "bg-wine-champagne text-foreground", iconColor: "text-[#E8D4B8]" },
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

interface WineCardProps {
  wine: Wine;
  onDelete: (id: string) => void;
  onMarkDrunk: (id: string) => void;
  onUpdated: () => void;
  index: number;
}

export function WineCard({ wine, onDelete, onMarkDrunk, onUpdated, index }: WineCardProps) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [drunkAfterRate, setDrunkAfterRate] = useState(false);
  const config = typeConfig[wine.type];
  const currentYear = new Date().getFullYear();
  const isOptimalNow =
    wine.drink_from && wine.drink_until
      ? currentYear >= wine.drink_from && currentYear <= wine.drink_until
      : null;

  const handleMarkDrunk = () => {
    setDrunkAfterRate(true);
    setRatingOpen(true);
  };

  const handleRatingSaved = () => {
    if (drunkAfterRate) {
      setDrunkAfterRate(false);
      onMarkDrunk(wine.id);
    }
    onUpdated();
  };

  const handleRatingClose = (open: boolean) => {
    setRatingOpen(open);
    if (!open) setDrunkAfterRate(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative rounded-lg border border-border bg-card p-5 pb-12"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={config.className}>{config.label}</Badge>
            {wine.vintage && (
              <span className="text-sm text-muted-foreground">{wine.vintage}</span>
            )}
            {wine.quantity > 1 && (
              <Badge variant="outline">×{wine.quantity}</Badge>
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold truncate">{wine.name}</h3>
          {wine.winery && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Grape className="w-3.5 h-3.5" />
              {wine.winery}
            </p>
          )}
          {(wine.region || wine.country) && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {[wine.region, wine.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center text-primary">
          <WineIcon className="w-8 h-8" />
        </div>
      </div>

      {(wine.drink_from || wine.drink_until) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            Best: {wine.drink_from || "?"} – {wine.drink_until || "?"}
          </span>
          {isOptimalNow !== null && (
            <Badge variant={isOptimalNow ? "default" : "secondary"} className="text-xs">
              {isOptimalNow ? "Drink now" : currentYear < (wine.drink_from || 0) ? "Too early" : "Past peak"}
            </Badge>
          )}
        </div>
      )}

      {wine.food_pairings && wine.food_pairings.length > 0 && (
        <div className="mt-2 flex items-start gap-2 text-sm">
          <UtensilsCrossed className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {wine.food_pairings.map((food) => (
              <Badge key={food} variant="outline" className="text-xs font-normal">
                {food}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {wine.rating && (
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < wine.rating! ? "fill-primary text-primary" : "text-muted-foreground/20"
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">{wine.rating}/10</span>
        </div>
      )}

      {wine.notes && (
        <p className="mt-2 text-sm text-muted-foreground italic line-clamp-2">
          "{wine.notes}"
        </p>
      )}

      {/* Action buttons - bottom left */}
      <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => setEditOpen(true)}
          title="Edit wine"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => { setDrunkAfterRate(false); setRatingOpen(true); }}
          title="Rate wine"
        >
          <Star className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={handleMarkDrunk}
          title="Mark as drunk"
        >
          <GlassWater className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(wine.id)}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <WineRatingDialog
        wine={wine}
        open={ratingOpen}
        onOpenChange={handleRatingClose}
        onUpdated={handleRatingSaved}
        markAsDrunk={drunkAfterRate}
      />

      <EditWineDialog
        wine={wine}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onUpdated}
      />
    </motion.div>
  );
}
