import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WineFiltersProps {
  wines: any[];
  onFilteredWines: (filtered: any[]) => void;
}

type FilterState = {
  countries: string[];
  grapes: string[];
  years: number[];
  foods: string[];
};

const emptyFilters: FilterState = { countries: [], grapes: [], years: [], foods: [] };

export function WineFilters({ wines, onFilteredWines }: WineFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [open, setOpen] = useState(false);

  // Extract unique values
  const countries = [...new Set(wines.map((w) => w.country).filter(Boolean))].sort();
  const grapes = [...new Set(wines.map((w) => w.grape_variety).filter(Boolean))].sort();
  const years = [...new Set(wines.map((w) => w.vintage).filter(Boolean))].sort((a, b) => b - a);
  const foods = [...new Set(wines.flatMap((w) => w.food_pairings ?? []).filter(Boolean))].sort();

  const activeCount =
    filters.countries.length + filters.grapes.length + filters.years.length + filters.foods.length;

  const apply = (next: FilterState) => {
    setFilters(next);
    let result = wines;
    if (next.countries.length)
      result = result.filter((w) => next.countries.includes(w.country));
    if (next.grapes.length)
      result = result.filter((w) => next.grapes.includes(w.grape_variety));
    if (next.years.length)
      result = result.filter((w) => next.years.includes(w.vintage));
    if (next.foods.length)
      result = result.filter((w) =>
        w.food_pairings?.some((f: string) => next.foods.includes(f))
      );
    onFilteredWines(result);
  };

  const toggle = (key: keyof FilterState, value: string | number) => {
    const arr = filters[key] as any[];
    const next = {
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    };
    apply(next);
  };

  const clear = () => {
    setFilters(emptyFilters);
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
            <ChipList label="Country" items={countries} selected={filters.countries} filterKey="countries" />
            <ChipList label="Grape" items={grapes} selected={filters.grapes} filterKey="grapes" />
            <ChipList label="Year" items={years} selected={filters.years} filterKey="years" />
            <ChipList label="Food pairing" items={foods} selected={filters.foods} filterKey="foods" />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
