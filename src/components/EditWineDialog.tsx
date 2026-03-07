import { useState } from "react";
import { Wine, WineType } from "@/types/wine";
import { updateWine } from "@/lib/wines";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wine as WineIcon } from "lucide-react";
import { toast } from "sonner";

interface EditWineDialogProps {
  wine: Wine | (Record<string, any> & { id: string });
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  table?: "wines" | "drunk_wines";
}

export function EditWineDialog({ wine, open, onOpenChange, onUpdated, table = "wines" }: EditWineDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: wine.name || "",
    winery: wine.winery || "",
    region: wine.region || "",
    country: wine.country || "",
    vintage: wine.vintage?.toString() || "",
    type: (wine.type || "red") as WineType,
    grape_variety: wine.grape_variety || "",
    notes: wine.notes || "",
    drink_from: wine.drink_from?.toString() || "",
    drink_until: wine.drink_until?.toString() || "",
    food_pairings: wine.food_pairings?.join(", ") || "",
    quantity: wine.quantity?.toString() || "1",
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Wine name is required");
      return;
    }
    setLoading(true);
    try {
      const updates = {
        name: form.name,
        winery: form.winery || null,
        region: form.region || null,
        country: form.country || null,
        vintage: form.vintage ? parseInt(form.vintage) : null,
        type: form.type,
        grape_variety: form.grape_variety || null,
        notes: form.notes || null,
        drink_from: form.drink_from ? parseInt(form.drink_from) : null,
        drink_until: form.drink_until ? parseInt(form.drink_until) : null,
        food_pairings: form.food_pairings ? form.food_pairings.split(",").map((s) => s.trim()).filter(Boolean) : null,
        quantity: parseInt(form.quantity) || 1,
      };

      if (table === "drunk_wines") {
        const { error } = await supabase.from("drunk_wines").update(updates).eq("id", wine.id);
        if (error) throw error;
      } else {
        await updateWine(wine.id, updates);
      }

      toast.success("Wine updated!");
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error("Failed to update wine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <WineIcon className="w-5 h-5 text-primary" />
            Edit Wine
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Wine Name *</Label>
              <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-winery">Winery</Label>
              <Input id="edit-winery" value={form.winery} onChange={(e) => setForm({ ...form, winery: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-vintage">Vintage</Label>
              <Input id="edit-vintage" type="number" value={form.vintage} onChange={(e) => setForm({ ...form, vintage: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-region">Region</Label>
              <Input id="edit-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-country">Country</Label>
              <Input id="edit-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as WineType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">Red Wine</SelectItem>
                  <SelectItem value="white">White Wine</SelectItem>
                  <SelectItem value="champagne">Champagne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-grape">Grape Variety</Label>
              <Input id="edit-grape" value={form.grape_variety} onChange={(e) => setForm({ ...form, grape_variety: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-drink-from">Drink From (Year)</Label>
              <Input id="edit-drink-from" type="number" value={form.drink_from} onChange={(e) => setForm({ ...form, drink_from: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-drink-until">Drink Until (Year)</Label>
              <Input id="edit-drink-until" type="number" value={form.drink_until} onChange={(e) => setForm({ ...form, drink_until: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-pairings">Food Pairings (comma separated)</Label>
              <Input id="edit-pairings" value={form.food_pairings} onChange={(e) => setForm({ ...form, food_pairings: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input id="edit-quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
