import { useState } from "react";
import { Wine } from "@/types/wine";
import { updateWine } from "@/lib/wines";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TasteScale } from "@/components/TasteScale";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WineRatingDialogProps {
  wine: Wine | { id: string; name: string; rating?: number | null; body?: number | null; tannin?: number | null; sweetness?: number | null; acidity?: number | null; notes?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  markAsDrunk?: boolean;
  table?: "wines" | "drunk_wines";
}

export function WineRatingDialog({ wine, open, onOpenChange, onUpdated, markAsDrunk, table = "wines" }: WineRatingDialogProps) {
  const [rating, setRating] = useState(wine.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState(wine.body ?? 5);
  const [tannin, setTannin] = useState(wine.tannin ?? 5);
  const [sweetness, setSweetness] = useState(wine.sweetness ?? 5);
  const [acidity, setAcidity] = useState(wine.acidity ?? 5);
  const [notes, setNotes] = useState(wine.notes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        rating: rating || null,
        body,
        tannin,
        sweetness,
        acidity,
        notes: notes || null,
      };

      if (table === "drunk_wines") {
        const { supabase } = await import("@/integrations/supabase/client");
        const { error } = await supabase
          .from("drunk_wines")
          .update(updates)
          .eq("id", wine.id);
        if (error) throw error;
      } else {
        await updateWine(wine.id, updates);
      }

      toast.success("Rating saved!");
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error("Failed to save rating");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {markAsDrunk ? "Rate & Archive" : "Rate"}: {wine.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-colors"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-muted-foreground">{rating}/10</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="block">Taste Profile</Label>
            <TasteScale leftLabel="Light" rightLabel="Bold" value={body} onChange={setBody} />
            <TasteScale leftLabel="Smooth" rightLabel="Tannic" value={tannin} onChange={setTannin} />
            <TasteScale leftLabel="Dry" rightLabel="Sweet" value={sweetness} onChange={setSweetness} />
            <TasteScale leftLabel="Soft" rightLabel="Acidic" value={acidity} onChange={setAcidity} />
          </div>

          <div>
            <Label htmlFor="tasting-notes">Tasting Notes</Label>
            <Textarea
              id="tasting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the flavors, aromas, finish..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {markAsDrunk ? "Save & Archive" : "Save Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
