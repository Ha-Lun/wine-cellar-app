import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWines, deleteWine, markWineAsDrunk } from "@/lib/wines";
import { WineType } from "@/types/wine";
import { WineCard } from "@/components/WineCard";
import { AddWineDialog } from "@/components/AddWineDialog";
import { WineFilters } from "@/components/WineFilters";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wine, LogOut, Loader2, GlassWater, Archive, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const typeFilters: { value: WineType | "all"; label: string }[] = [
  { value: "all", label: "All Wines" },
  { value: "red", label: "Red" },
  { value: "white", label: "White" },
  { value: "sparkling", label: "Sparkling" },
  { value: "champagne", label: "Champagne" },
];

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [filter, setFilter] = useState<WineType | "all">("all");
  const [customFiltered, setCustomFiltered] = useState<any[] | null>(null);
  const [collapsedCountries, setCollapsedCountries] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: wines = [], isLoading } = useQuery({
    queryKey: ["wines"],
    queryFn: fetchWines,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast.success("Wine removed from cellar");
    },
    onError: () => toast.error("Failed to remove wine"),
  });

  const drunkMutation = useMutation({
    mutationFn: markWineAsDrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast.success("Wine moved to archive – cheers! 🍷");
    },
    onError: () => toast.error("Failed to archive wine"),
  });

  const baseWines = customFiltered ?? wines;
  const filteredWines = filter === "all" ? baseWines : baseWines.filter((w) => w.type === filter);

  // Group wines by country
  const winesByCountry = useMemo(() => {
    const grouped: Record<string, typeof filteredWines> = {};
    const unknownCountry = "Unknown";
    
    filteredWines.forEach((wine) => {
      const country = wine.country || unknownCountry;
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(wine);
    });

    // Sort countries alphabetically, but put "Unknown" at the end
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === unknownCountry) return 1;
      if (b === unknownCountry) return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((country) => ({ country, wines: grouped[country] }));
  }, [filteredWines]);

  const toggleCountry = (country: string) => {
    setCollapsedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const currentYear = new Date().getFullYear();
  
  const drinkNowCount = wines.filter((w) => {
    return w.drink_from && w.drink_until && currentYear >= w.drink_from && currentYear <= w.drink_until;
  }).length;

  const pastPeakCount = wines.filter((w) => {
    return w.drink_until && currentYear > w.drink_until;
  }).length;

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
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Wine className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold leading-tight">Wine Cellar</h1>
              <p className="text-xs text-muted-foreground">
                {wines.length} bottle{wines.length !== 1 ? "s" : ""}
                {drinkNowCount > 0 && (
                  <span> · <span className="text-primary">{drinkNowCount} ready to drink</span></span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddWineDialog onAdded={() => queryClient.invalidateQueries({ queryKey: ["wines"] })} />
            <Button variant="ghost" size="icon" asChild title="Wine Archive">
              <Link to="/archive"><Archive className="w-4 h-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
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
                  {wines.filter((w) => f.value === "all" || w.type === f.value).length}
                </Badge>
              )}
            </Button>
          ))}
          <WineFilters wines={wines} onFilteredWines={(f) => setCustomFiltered(f.length === wines.length ? null : f)} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredWines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <GlassWater className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-heading text-xl text-muted-foreground mb-2">
              {wines.length === 0 ? "Your cellar is empty" : "No wines match this filter"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {wines.length === 0 ? "Add your first wine by scanning a label or entering details manually." : "Try a different filter."}
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
                    <Badge variant="secondary" className="text-xs">
                      {countryWines.length}
                    </Badge>
                  </button>
                  {!isCollapsed && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {countryWines.map((wine, i) => (
                        <WineCard
                          key={wine.id}
                          wine={wine}
                          onDelete={(id) => deleteMutation.mutate(id)}
                          onMarkDrunk={(id) => drunkMutation.mutate(id)}
                          onUpdated={() => queryClient.invalidateQueries({ queryKey: ["wines"] })}
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

export default Index;
