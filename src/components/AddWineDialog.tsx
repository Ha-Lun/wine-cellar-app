import { useState, useRef } from "react";
import { WineType, WineInsert, WineScanResult } from "@/types/wine";
import { addWine, scanWineLabel, getVivinoRating } from "@/lib/wines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera as CameraIcon, Plus, Loader2, Wine, Search, Star, Upload } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddWineDialogProps {
  onAdded: () => void;
}

export function AddWineDialog({ onAdded }: AddWineDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fetchingRating, setFetchingRating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    winery: "",
    region: "",
    country: "",
    vintage: "",
    type: "red" as WineType,
    grape_variety: "",
    notes: "",
    drink_from: "",
    drink_until: "",
    food_pairings: "",
    quantity: "1",
    vivino_rating: null as number | null,
  });

  const resetForm = () => {
    setForm({
      name: "", winery: "", region: "", country: "", vintage: "",
      type: "red", grape_variety: "", notes: "", drink_from: "",
      drink_until: "", food_pairings: "", quantity: "1", vivino_rating: null,
    });
  };

  const processImageBase64 = async (base64String: string) => {
    setScanning(true);
    try {
      // Capacitor returns raw base64 string, we need to append the data URL prefix if it's missing
      const base64DataUrl = base64String.startsWith('data:') 
        ? base64String 
        : `data:image/jpeg;base64,${base64String}`;

      const result: WineScanResult = await scanWineLabel(base64DataUrl);
      setForm({
        name: result.name || "",
        winery: result.winery || "",
        region: result.region || "",
        country: result.country || "",
        vintage: result.vintage?.toString() || "",
        type: result.type || "red",
        grape_variety: result.grape_variety || "",
        notes: "",
        drink_from: result.drink_from?.toString() || "",
        drink_until: result.drink_until?.toString() || "",
        food_pairings: result.food_pairings?.join(", ") || "",
        quantity: "1",
      });
      toast.success("Label scanned! Review the details and save.");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to scan: ${err?.message || "Unknown error"}`);
    } finally {
      setScanning(false);
    }
  };

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        width: 1024,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      if (image.base64String) {
        await processImageBase64(image.base64String);
      }
    } catch (error: any) {
      if (error.message !== "User cancelled photos app" && error.message !== "User cancelled") {
        console.error(error);
        toast.error("Failed to open camera");
      }
    }
  };

  const uploadPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        width: 1024,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (image.base64String) {
        await processImageBase64(image.base64String);
      }
    } catch (error: any) {
      if (error.message !== "User cancelled photos app" && error.message !== "User cancelled") {
        console.error(error);
        toast.error("Failed to open gallery");
      }
    }
  };

  const handleFetchRating = async () => {
    if (!form.name) {
      toast.error("Please enter a wine name first");
      return;
    }
    const query = `${form.name} ${form.vintage || ""}`.trim();
    setFetchingRating(true);
    try {
      const rating = await getVivinoRating(query);
      if (rating) {
        setForm({ ...form, vivino_rating: rating });
        toast.success(`Found Vivino rating: ${rating}`);
      } else {
        toast.error("Could not find a Vivino rating for this wine");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Vivino rating");
    } finally {
      setFetchingRating(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Wine name is required");
      return;
    }
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      const wine: WineInsert = {
        user_id: user.id,
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
        vivino_rating: form.vivino_rating,
      };
      await addWine(wine);
      toast.success("Wine added to your cellar!");
      resetForm();
      setOpen(false);
      onAdded();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add wine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Wine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Wine className="w-5 h-5 text-primary" />
            Add to Cellar
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan" className="gap-2">
              <CameraIcon className="w-4 h-4" />
              Scan Label
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {scanning ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing label with AI...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-4">
                    <CameraIcon className="w-10 h-10 text-muted-foreground" />
                    <Upload className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Take a live photo or upload an existing image
                  </p>
                  <div className="flex gap-3 mt-2">
                    <Button variant="default" onClick={takePhoto}>
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="secondary" onClick={uploadPhoto}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            {/* form renders below for both tabs */}
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name">Wine Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Château Margaux" />
            </div>
            <div>
              <Label htmlFor="winery">Winery</Label>
              <Input id="winery" value={form.winery} onChange={(e) => setForm({ ...form, winery: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="vintage">Vintage</Label>
              <Input id="vintage" type="number" value={form.vintage} onChange={(e) => setForm({ ...form, vintage: e.target.value })} placeholder="2020" />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Input id="region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Bordeaux" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="France" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as WineType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">Red Wine</SelectItem>
                  <SelectItem value="white">White Wine</SelectItem>
                  <SelectItem value="sparkling">Sparkling</SelectItem>
                  <SelectItem value="champagne">Champagne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grape">Grape Variety</Label>
              <Input id="grape" value={form.grape_variety} onChange={(e) => setForm({ ...form, grape_variety: e.target.value })} placeholder="Cabernet Sauvignon" />
            </div>
            <div>
              <Label htmlFor="drink_from">Drink From (Year)</Label>
              <Input id="drink_from" type="number" value={form.drink_from} onChange={(e) => setForm({ ...form, drink_from: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="drink_until">Drink Until (Year)</Label>
              <Input id="drink_until" type="number" value={form.drink_until} onChange={(e) => setForm({ ...form, drink_until: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="pairings">Food Pairings (comma separated)</Label>
              <Input id="pairings" value={form.food_pairings} onChange={(e) => setForm({ ...form, food_pairings: e.target.value })} placeholder="Steak, Lamb, Aged cheese" />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="col-span-2 flex items-center justify-between p-3 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Vivino Rating</span>
                {form.vivino_rating ? (
                  <Badge variant="secondary" className="ml-2 font-bold">{form.vivino_rating}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground ml-2">Not checked</span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFetchRating}
                disabled={fetchingRating || !form.name}
              >
                {fetchingRating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Search className="w-3 h-3 mr-2" />}
                Check Rating
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Tasting notes, occasion..." rows={2} />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add to Cellar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
