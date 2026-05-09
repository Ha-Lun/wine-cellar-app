import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlist, deleteWishlistWine, moveWishlistToCellar } from "@/lib/wishlist";
import { WineType } from "@/types/wine";
import { WishlistCard } from "@/components/WishlistCard";
import { AddWishlistDialog } from "@/components/AddWishlistDialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, LogOut, Loader2, Wine, Archive, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const typeFilters: { value: WineType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "red", label: "Red" },
  { value: "white", label: "White" },
  { value: "sparkling", label: "Sparkling" },
  { value: "champagne", label: "Champagne" },
];

const Wishlist = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [filter, setFilter] = useState<WineType | "all">("all");
  const [collapsedCountries, setCollapsedCountries] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: wines = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWishlistWine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const moveMutation = useMutation({
    mutationFn: moveWishlistToCellar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast.success("Moved to your cellar 🍷");
    },
    onError: () => toast.error("Failed to move wine"),
  });

  const filteredWines = filter === "all" ? wines : wines.filter((w) => w.type === filter);

  const winesByCountry = useMemo(() => {
    const grouped: Record<string, typeof filteredWines> = {};
    const unknown = "Unknown";
    filteredWines.forEach((wine) => {
      const country = wine.country || unknown;
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(wine);
    });
    const sorted = Object.keys(grouped).sort((a, b) => {
      if (a === unknown) return 1;
      if (b === unknown) return -1;
      return a.localeCompare(b);
    });
    return sorted.map((country) => ({ country, wines: grouped[country] }));
  }, [filteredWines]);

  const toggleCountry = (country: string) => {
    setCollapsedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

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
      <header
        className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
            <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-bold leading-tight truncate">Wishlist</h1>
              <p className="text-xs text-muted-foreground leading-snug">
                {wines.length} wine{wines.length !== 1 ? "s" : ""} to buy
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild title="Cellar">
                <Link to="/"><Wine className="w-4 h-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild title="Archive">
                <Link to="/archive"><Archive className="w-4 h-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            <AddWishlistDialog onAdded={() => queryClient.invalidateQueries({ queryKey: ["wishlist"] })} />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          {typeFilters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value !== "all" && (
                <Badge variant="secondary" className="ml-1.5 text-xs border-0">
                  {wines.filter((w) => w.type === f.value).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredWines.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-heading text-xl text-muted-foreground mb-2">
              {wines.length === 0 ? "Your wishlist is empty" : "No wines match this filter"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {wines.length === 0
                ? "Scan a label or add a wine you'd like to buy one day."
                : "Try a different filter."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {winesByCountry.map(({ country, wines: countryWines }) => {
              const isCollapsed = collapsedCountries.includes(country);
              return (
                <div key={country}>
                  <button
                    onClick={() => toggleCountry(country)}
                    className="flex items-center gap-2 mb-3 group"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                    <h2 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {country}
                    </h2>
                    <Badge variant="secondary" className="text-xs">{countryWines.length}</Badge>
                  </button>
                  {!isCollapsed && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {countryWines.map((wine, i) => (
                        <WishlistCard
                          key={wine.id}
                          wine={wine}
                          onDelete={(id) => deleteMutation.mutate(id)}
                          onMoveToCellar={(id) => moveMutation.mutate(id)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
