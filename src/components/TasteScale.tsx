import { Slider } from "@/components/ui/slider";

interface TasteScaleProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export function TasteScale({ leftLabel, rightLabel, value, onChange }: TasteScaleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground w-16 text-right shrink-0">
        {leftLabel}
      </span>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="flex-1"
      />
      <span className="text-sm font-medium text-muted-foreground w-16 shrink-0">
        {rightLabel}
      </span>
    </div>
  );
}
