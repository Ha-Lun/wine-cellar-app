import { AddWineDialog } from "@/components/AddWineDialog";

interface AddWishlistDialogProps {
  onAdded: () => void;
}

export function AddWishlistDialog({ onAdded }: AddWishlistDialogProps) {
  return <AddWineDialog onAdded={onAdded} defaultDestination="wishlist" />;
}
