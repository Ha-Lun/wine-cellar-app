import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LabelImageProps {
  src: string;
  alt: string;
}

export function LabelImage({ src, alt }: LabelImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-16 h-20 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        aria-label={`View ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4 bg-background">
          <div className="w-full flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
