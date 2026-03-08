import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDrunkWines, restoreToCellar } from "@/lib/wines";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Badge } from "@/components/ui/badge";
import { Wine, Loader2, GlassWater, ArrowLeft, Star, Pencil, ArchiveRestore, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WineType } from "@/types/wine";
import { format } from "date-fns";
import { Grape, Calendar } from "lucide-react";
import { WineRatingDialog } from "@/components/WineRatingDialog";
import { EditWineDialog } from "@/components/EditWineDialog";
import { WineFilters } from "@/components/WineFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        <Wine className={`w-8 h-8 ${config.iconColor}`} />
        <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
      </div>
    );
  }
  
  return <Wine className={`w-8 h-8 ${config.iconColor}`} />;
};

const Archive = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [ratingWine, setRatingWine] = useState<any>(null);
  const [editWine, setEditWine] = useState<any>(null);
  const [filteredWines, setFilteredWines] = useState<any[] | null>(null);

  const { data: drunkWines = [], isLoading } = useQuery({
    queryKey: ["drunk-wines"],
    queryFn: fetchDrunkWines,
    enabled: !!user,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreToCellar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drunk-wines"] });
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast.success("Wine restored to cellar!");
    },
    onError: () => toast.error("Failed to restore wine"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drunk_wines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drunk-wines"] });
      toast.success("Wine removed from archive");
    },
    onError: () => toast.error("Failed to delete wine"),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <AuthForm />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="font-heading text-xl font-bold leading-tight">Wine Archive</h1>
              <p className="text-xs text-muted-foreground">
                {drunkWines.length} wine{drunkWines.length !== 1 ? "s" : ""} enjoyed
              </p>
            </div>
          </div>
          <WineFilters
            wines={drunkWines}
            onFilteredWines={(f) => setFilteredWines(f.length === drunkWines.length ? null : f)}
          />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : drunkWines.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <GlassWater className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-heading text-xl text-muted-foreground mb-2">No wines in archive yet</h2>
            <p className="text-sm text-muted-foreground">Mark a wine as drunk from your cellar to see it here.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(filteredWines ?? drunkWines).map((wine, i) => {
              const config = typeConfig[wine.type as WineType];
              return (
                <motion.div
                  key={wine.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="group relative rounded-lg border border-border bg-card p-5 pb-12"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={config.className}>{config.label}</Badge>
                        {wine.vintage && <span className="text-sm text-muted-foreground">{wine.vintage}</span>}
                      </div>
                      <h3 className="font-heading text-lg font-semibold truncate">{wine.name}</h3>
                      {wine.winery && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Grape className="w-3.5 h-3.5" />{wine.winery}
                        </p>
                      )}
                      {(wine.region || wine.country) && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {[wine.region, wine.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Wine className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Enjoyed {format(new Date(wine.drunk_at), "MMM d, yyyy")}</span>
                  </div>
                  {wine.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 10 }, (_, j) => (
                        <Star
                          key={j}
                          className={`w-3 h-3 ${
                            j < wine.rating! ? "fill-primary text-primary" : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">{wine.rating}/10</span>
                    </div>
                  )}
                  {wine.notes && (
                    <p className="mt-2 text-sm text-muted-foreground italic line-clamp-2">"{wine.notes}"</p>
                  )}

                  {/* Action buttons - bottom left */}
                  <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => setEditWine(wine)}
                      title="Edit wine"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => setRatingWine(wine)}
                      title="Rate wine"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => restoreMutation.mutate(wine.id)}
                      title="Restore to cellar"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(wine.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {ratingWine && (
        <WineRatingDialog
          wine={ratingWine}
          open={!!ratingWine}
          onOpenChange={(open) => { if (!open) setRatingWine(null); }}
          onUpdated={() => {
            setRatingWine(null);
            queryClient.invalidateQueries({ queryKey: ["drunk-wines"] });
          }}
          table="drunk_wines"
        />
      )}

      {editWine && (
        <EditWineDialog
          wine={editWine}
          open={!!editWine}
          onOpenChange={(open) => { if (!open) setEditWine(null); }}
          onUpdated={() => {
            setEditWine(null);
            queryClient.invalidateQueries({ queryKey: ["drunk-wines"] });
          }}
          table="drunk_wines"
        />
      )}
    </div>
  );
};

export default Archive;
