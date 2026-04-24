import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Filter, X, ChevronDown, ChevronRight, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WineFiltersProps {
  wines: any[];
  onFilteredWines: (filtered: any[]) => void;
}

type FilterState = {
  countries: string[];
  regions: string[];
  grapes: string[];
  years: number[];
  foods: string[];
  minVivinoRating: number;
};

const emptyFilters: FilterState = { countries: [], regions: [], grapes: [], years: [], foods: [], minVivinoRating: 0 };

export function WineFilters({ wines, onFilteredWines }: WineFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [open, setOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);

  // Extract unique values
  const countries = [...new Set(wines.map((w) => w.country).filter(Boolean))].sort();
  const grapes = [...new Set(wines.map((w) => w.grape_variety).filter(Boolean))].sort();
  const years = [...new Set(wines.map((w) => w.vintage).filter(Boolean))].sort((a, b) => b - a);
  const foods = [...new Set(wines.flatMap((w) => w.food_pairings ?? []).filter(Boolean))].sort();

  // Build country -> regions mapping
  const regionsByCountry: Record<string, string[]> = {};
  wines.forEach((w) => {
    if (w.country && w.region) {
      if (!regionsByCountry[w.country]) regionsByCountry[w.country] = [];
      if (!regionsByCountry[w.country].includes(w.region)) {
        regionsByCountry[w.country].push(w.region);
      }
    }
  });
  Object.keys(regionsByCountry).forEach((c) => regionsByCountry[c].sort());

  const activeCount =
    filters.countries.length + filters.regions.length + filters.grapes.length + filters.years.length + filters.foods.length + (filters.minVivinoRating > 0 ? 1 : 0);

  const apply = (next: FilterState) => {
    setFilters(next);
    let result = wines;
    if (next.countries.length)
      result = result.filter((w) => next.countries.includes(w.country));
    if (next.regions.length)
      result = result.filter((w) => next.regions.includes(w.region));
    if (next.grapes.length)
      result = result.filter((w) => next.grapes.includes(w.grape_variety));
    if (next.years.length)
      result = result.filter((w) => next.years.includes(w.vintage));
    if (next.foods.length)
      result = result.filter((w) =>
        w.food_pairings?.some((f: string) => next.foods.includes(f))
      );
    if (next.minVivinoRating > 0)
      result = result.filter((w) => (w.vivino_rating || 0) >= next.minVivinoRating);
    onFilteredWines(result);
  };

  const setMinRating = (val: number) => {
    const next = { ...filters, minVivinoRating: val };
    apply(next);
  };

  const toggle = (key: keyof FilterState, value: string | number) => {
    const arr = filters[key] as any[];
    const next = {
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    };
    apply(next);
  };

  const toggleCountryExpand = (country: string) => {
    setExpandedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const clear = () => {
    setFilters(emptyFilters);
    setExpandedCountries([]);
    onFilteredWines(wines);
  };

  const ChipList = ({
    label,
    items,
    selected,
    filterKey,
  }: {
    label: string;
    items: (string | number)[];
    selected: (string | number)[];
    filterKey: keyof FilterState;
  }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <button
              key={String(item)}
              onClick={() => toggle(filterKey, item)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                selected.includes(item)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Filter wines</span>
          {activeCount > 0 && (
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-4 space-y-4">
            {/* Vivino Rating Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#AA1E3A]" />
                  Vivino Rating
                </p>
                <span className="text-xs font-bold text-primary">{filters.minVivinoRating > 0 ? `${filters.minVivinoRating.toFixed(1)}+` : "Any"}</span>
              </div>
              <Slider
                max={5}
                step={0.1}
                value={[filters.minVivinoRating]}
                onValueChange={(vals) => setMinRating(vals[0])}
                className="my-3 px-1"
              />
            </div>

            {/* Country with nested regions */}
            {countries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Country / Region</p>
                <div className="space-y-1">
                  {countries.map((country) => {
                    const regions = regionsByCountry[country] || [];
                    const hasRegions = regions.length > 0;
                    const isExpanded = expandedCountries.includes(country);
                    const isCountrySelected = filters.countries.includes(country);

                    return (
                      <div key={country}>
                        <div className="flex items-center gap-1">
                          {hasRegions && (
                            <button
                              onClick={() => toggleCountryExpand(country)}
                              className="p-0.5 hover:bg-muted rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => toggle("countries", country)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                              isCountrySelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {country}
                          </button>
                        </div>
                        {hasRegions && isExpanded && (
                          <div className="ml-6 mt-1 flex flex-wrap gap-1.5">
                            {regions.map((region) => (
                              <button
                                key={region}
                                onClick={() => toggle("regions", region)}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors border ${
                                  filters.regions.includes(region)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
                                }`}
                              >
                                {region}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <ChipList label="Grape" items={grapes} selected={filters.grapes} filterKey="grapes" />
            <ChipList label="Year" items={years} selected={filters.years} filterKey="years" />
            <ChipList label="Food pairing" items={foods} selected={filters.foods} filterKey="foods" />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
