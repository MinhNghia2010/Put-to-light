"use client";

import { CheckCircle2, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "../ui/button-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ScannedItem, ValidationError } from "@/components/shared/types";

interface ConfirmationModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    basketId: string;
    editableItems: ScannedItem[];
    validationErrors: ValidationError[];
    totalItems: number;
    onItemQtyChange: (index: number, newQty: number) => void;
    onRemoveItem: (index: number) => void;
    onConfirm: () => void;
}

export function ConfirmationModal({
    isOpen,
    onOpenChange,
    basketId,
    editableItems,
    validationErrors,
    totalItems,
    onItemQtyChange,
    onRemoveItem,
    onConfirm,
}: ConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[80vw] min-w-[600px] max-w-[1200px] h-[80vh] xl:h-[60vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-4 xl:text-xl text-destructive">
                        <ShoppingCart className="size-7" />
                        Xác nhận gán vào Crate
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="p-3 bg-destructive/10 rounded-lg mb-4 shrink-0">
                            <p className="text-sm text-muted-foreground">Mã giỏ hàng:</p>
                            <p className="font-mono font-semibold text-lg text-destructive">{basketId}</p>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg mb-4 shrink-0">
                                <p className="text-sm font-medium text-yellow-800 mb-1">⚠️ Cảnh báo:</p>
                                <ul className="text-xs text-yellow-700 space-y-1">
                                    {validationErrors.map((err, i) => (
                                        <li key={i}>• {err.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto min-h-0 h-full">
                            <p className="text-sm font-medium mb-2">Chỉnh sửa số lượng:</p>
                            <div className="space-y-3 pr-2">
                                {editableItems.map((item, index) => (
                                    <div
                                        key={`modal-${item.sku}-${index}`}
                                        className={`flex flex-col p-3 rounded-lg space-y-3 ${validationErrors.some(e => e.itemIndex === index)
                                            ? 'bg-red-50 border border-red-300'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full h-full">
                                            <div className="flex-1 min-w-0 h-full">
                                                <p className="font-mono text-sm font-medium truncate">
                                                    {item.sku || <span className="text-red-500">Thiếu SKU</span>}
                                                </p>
                                                {item.name && (
                                                    <p className="text-muted-foreground truncate">{item.name}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="size-8 p-0"
                                                    onClick={() => onItemQtyChange(index, Math.max(0, item.qty - 1))}
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) => onItemQtyChange(index, parseInt(e.target.value) || 0)}
                                                    className="w-14 text-center font-mono"
                                                    min="0"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="size-8 p-0"
                                                    onClick={() => onItemQtyChange(index, item.qty + 1)}
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-lg"
                                                    className="size-8 p-0 text-destructive hover:text-destructive/80"
                                                    onClick={() => onRemoveItem(index)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Quick Quantity Grid */}
                                        <ButtonGroup className="w-full grow">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                <Button
                                                    key={num}
                                                    variant="outline"
                                                    className={`h-12 flex-1 text-lg px-0 ${item.qty === num ? "bg-destructive text-white border-destructive hover:bg-destructive hover:text-white" : ""}`}
                                                    onClick={() => onItemQtyChange(index, num)}
                                                >
                                                    {num}
                                                </Button>
                                            ))}
                                        </ButtonGroup>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 space-y-4 pt-2 border-t mt-auto">
                        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                            <span className="font-medium text-destructive">Tổng số lượng:</span>
                            <Badge className="bg-transparent text-destructive font-bold text-lg p-4">
                                {totalItems} items
                            </Badge>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 px-6 py-4 text-lg h-auto"
                                onClick={() => onOpenChange(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1 bg-destructive hover:bg-destructive/90 px-6 py-4 text-lg h-auto"
                                onClick={onConfirm}
                                disabled={totalItems === 0}
                            >
                                <CheckCircle2 className="size-6 mr-2" />
                                Xác nhận ({totalItems})
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
