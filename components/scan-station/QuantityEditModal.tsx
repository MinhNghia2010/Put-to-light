"use client";

import { useState } from "react";
import { Edit3, Trash2, CheckCircle2 } from "lucide-react";
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
import type { ScannedItem } from "@/components/shared/types";

interface QuantityEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    crateId: string | null;
    items: ScannedItem[];
    onItemQtyChange: (index: number, newQty: number) => void;
    onRemoveItem: (index: number) => void;
    onSave: () => void;
}

export function QuantityEditModal({
    isOpen,
    onOpenChange,
    crateId,
    items,
    onItemQtyChange,
    onRemoveItem,
    onSave,
}: QuantityEditModalProps) {
    const totalItems = items.reduce((sum, item) => sum + (item.qty || 0), 0);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[80vw] min-w-[600px] max-w-[1200px] h-[80vh] xl:h-[60vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-4 xl:text-xl text-destructive">
                        <Edit3 className="size-7" />
                        Chỉnh sửa Crate {crateId}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium mb-2">Danh sách sản phẩm trong Crate:</p>
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center p-4 bg-muted rounded-lg">
                                Không có sản phẩm nào
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-[calc(100%-2rem)] h-full overflow-y-auto pr-2">
                                {items.map((item, index) => (
                                    <div
                                        key={`crate-item-${index}`}
                                        className="flex flex-col p-3 rounded-lg bg-muted space-y-3"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-xl font-bold truncate">
                                                    {item.sku}
                                                </p>
                                                {item.name && (
                                                    <p className="text-base text-muted-foreground truncate">{item.name}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
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
                                                    className="w-10 text-center font-mono h-10 text-lg"
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
                                                    className="size-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                    onClick={() => onRemoveItem(index)}
                                                >
                                                    <Trash2 className="size-6" />
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
                        )}
                    </div>

                    <div className="shrink-0 space-y-4 pt-2 border-t mt-auto">
                        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                            <span className="text-destructive text-xl font-medium">Tổng số lượng:</span>
                            <Badge className="bg-transparent text-destructive font-bold text-2xl px-6 py-2">
                                {totalItems} items
                            </Badge>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 px-6 text-lg h-auto"
                                onClick={() => onOpenChange(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1 bg-destructive hover:bg-destructive/90 p-6 text-lg h-auto"
                                onClick={onSave}
                            >
                                <CheckCircle2 className="size-6 mr-2" />
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
