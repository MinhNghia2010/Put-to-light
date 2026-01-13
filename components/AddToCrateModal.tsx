import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ButtonGroup } from "./ui/button-group";
import { Loader2 } from "lucide-react";
import * as api from "@/lib/api";

interface AddToCrateModalProps {
  open: boolean;
  onClose: () => void;
  crateId: string;
  sku?: string;
  itemName?: string;
  basketId?: string;
  onSuccess?: () => void;
}

export function AddToCrateModal({ 
  open, 
  onClose, 
  crateId, 
  sku = "ITEM-001",
  itemName = "Product",
  basketId = "BASKET-001",
  onSuccess 
}: AddToCrateModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItems = useCallback(async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Gọi API để thêm sản phẩm vào máng
      const result = await api.updateSlotQuantity(crateId, {
        slotId: crateId,
        sku,
        quantity: parseInt(quantity),
        action: "add",
      });

      if (result.success) {
        // Ghi lịch sử
        await api.addHistory({
          basketId,
          sku,
          itemName,
          slotId: crateId,
          quantity: parseInt(quantity),
          action: "put",
        });

        // Reset và đóng modal
        setQuantity("1");
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Không thể thêm sản phẩm");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [quantity, crateId, sku, itemName, basketId, onClose, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4 sm:max-w-200 sm:max-h-200 h-[clamp(300px,60%,800px)] w-[clamp(300px,90%,800px)] flex flex-col gap-4 p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl xl:text-3xl">Add to Crate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xl text-muted-foreground">
            Enter quantity of items to assign to <span className="font-medium text-primary">Crate {crateId}</span>
          </p>

          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-lg">QUANTITY</Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="pr-16 bg-input-background border-0 h-16 text-lg"
                min="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                PCS
              </span>
            </div>
          </div>
        </div>

        {/* quantity selection */}
          <ButtonGroup className="w-full grow">
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("1")}>
              1
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("2")}>
              2
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("3")}>
              3
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("4")}>
              4
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("5")}>
              5
            </Button> 
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("6")}>
              6
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("7")}>
              7
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("8")}>
              8
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("9")}>
              9
            </Button>
            <Button variant="outline" className="h-18 w-18 text-xl" onClick={() => setQuantity("10")}>
              10
            </Button>
          </ButtonGroup>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" className="text-xl p-6" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddItems}
            disabled={isLoading}
            className="bg-destructive text-xl p-6 hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Items"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
