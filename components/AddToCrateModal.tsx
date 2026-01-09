import { useState } from "react";
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
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface AddToCrateModalProps {
  open: boolean;
  onClose: () => void;
  crateId: string;
}

export function AddToCrateModal({ open, onClose, crateId }: AddToCrateModalProps) {
  const [quantity, setQuantity] = useState("1");

  const handleAddItems = () => {
    // Handle adding items logic here
    onClose();
  };

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

        <div className="flex justify-end gap-4">
          <Button variant="outline" className="text-xl p-6" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddItems}
            className="bg-destructive text-xl p-6 hover:bg-destructive/90"
          >
            Add Items
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
