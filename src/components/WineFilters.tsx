import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";

export interface FilterableWine {
  country?: string | null;
  region?: string | null;
  grape_variety?: string | null;
  vintage?: number | null;
  drink_from?: number | null;
  drink_until?: number | null;
  food_pairings?: string[] | null;
}

interface WineFiltersProps<T extends FilterableWine = FilterableWine> {
  wines: T[];
  onFilteredWines: (filtered: T[]) => void;
}

type FilterState = {
  countries: string[];
  regions: string[];
  grapes: string[];
  years: number[];
  drinkTimes: string[];
  foods: string[];
};

const emptyFilters: FilterState = { countries: [], regions: [], grapes: [], years: [], drinkTimes: [], foods: [] };

const foodCategoryMapping: Record<string, string[]> = {
  "Red Meat": ["beef", "lamb", "veal", "venison", "game", "steak", "red meat"],
  "Poultry": ["chicken", "poultry", "duck", "turkey"],
  "Pork": ["pork", "bacon", "ham"],
  "Seafood": ["fish", "salmon", "tuna", "shellfish", "seafood", "shrimp", "crab"],
  "Pasta": ["pasta", "spaghetti", "lasagna", "noodles"],
  "Cheese": ["cheese", "cheddar", "brie", "blue cheese", "parmesan"],
  "Vegetables": ["vegetarian", "vegetables", "salad", "mushroom", "tomato"],
  "Spicy": ["spicy", "curry", "chili"],
  "Dessert": ["dessert", "sweet", "chocolate", "cake", "fruit"],
  "Cured Meat": ["cured meat", "charcuterie", "salami", "prosciutto"]
};

function getFoodCategories(foodPairings: string[] | undefined | null): string[] {
  if (!foodPairings || foodPairings.length === 0) return [];
  const categories = new Set<string>();
  for (const food of foodPairings) {
    const lowerFood = food.toLowerCase();
    let matched = false;
    for (const [category, keywords] of Object.entries(foodCategoryMapping)) {
      if (keywords.some(kw => lowerFood.includes(kw))) {
        categories.add(category);
        matched = true;
      }
    }
    if (!matched) {
      categories.add("Other");
    }
  }
  return Array.from(categories);
}

export function WineFilters<T extends FilterableWine>({ wines, onFilteredWines }: WineFiltersProps<T>) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [open, setOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);

  const getDrinkTime = (w: FilterableWine) => {
    const currentYear = new Date().getFullYear();
    if (!w.drink_from && !w.drink_until) return "Unknown";
    if (w.drink_until && w.drink_until < currentYear) return "Past peak";
    if (w.drink_from && w.drink_from > currentYear) return "Wait";
    return "Drink now";
  };

  // Extract unique values
  const countries = [...new Set(wines.map((w) => w.country).filter((c): c is string => Boolean(c)))].sort();
  const grapes = [...new Set(wines.map((w) => w.grape_variety).filter((g): g is string => Boolean(g)))].sort();
  const years = [...new Set(wines.map((w) => w.vintage).filter((y): y is number => Boolean(y)))].sort((a, b) => b - a);
  const allDrinkTimes: string[] = [...new Set(wines.map(getDrinkTime))];
  const drinkTimes = ["Drink now", "Wait", "Past peak", "Unknown"].filter(t => allDrinkTimes.includes(t));
  
  const allFoods = wines.flatMap((w) => getFoodCategories(w.food_pairings));
  const foods = [...new Set(allFoods)].sort();

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
    filters.countries.length + filters.regions.length + filters.grapes.length + filters.years.length + filters.drinkTimes.length + filters.foods.length;

  const apply = (next: FilterState) => {
    setFilters(next);
    let result = wines;
    if (next.countries.length)
      result = result.filter((w) => w.country && next.countries.includes(w.country));
    if (next.regions.length)
      result = result.filter((w) => w.region && next.regions.includes(w.region));
    if (next.grapes.length)
      result = result.filter((w) => w.grape_variety && next.grapes.includes(w.grape_variety));
    if (next.years.length)
      result = result.filter((w) => w.vintage && next.years.includes(w.vintage));
    if (next.drinkTimes.length)
      result = result.filter((w) => next.drinkTimes.includes(getDrinkTime(w)));
    if (next.foods.length)
      result = result.filter((w) => {
        const cats = getFoodCategories(w.food_pairings);
        return cats.some((c) => next.foods.includes(c));
      });
    onFilteredWines(result);
  };


  const toggle = (key: keyof FilterState, value: string | number) => {
    const arr = filters[key] as Array<string | number>;
    const next: FilterState = {
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    } as FilterState;
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
        <Button variant="outline" size="sm" className="gap-1.5 relative w-[105px] justify-start pl-3">
          <Filter className="w-3.5 h-3.5 shrink-0" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge className="absolute right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
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
        <div className="max-h-80 overflow-y-auto">
          <div className="p-4 space-y-4">

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
            <ChipList label="Time to drink" items={drinkTimes} selected={filters.drinkTimes} filterKey="drinkTimes" />
            <ChipList label="Food pairing" items={foods} selected={filters.foods} filterKey="foods" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

