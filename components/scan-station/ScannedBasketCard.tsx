"use client";

import { Package, ShoppingCart, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ScannedBasket } from "@/components/shared/types";

interface ScannedBasketCardProps {
    basket: ScannedBasket;
    totalItems: number;
    isAssigning: boolean;
    onClear: () => void;
    onConfirm: () => void;
}

export function ScannedBasketCard({
    basket,
    totalItems,
    isAssigning,
    onClear,
    onConfirm,
}: ScannedBasketCardProps) {
    return (
        <Card className="border-2 border-destructive bg-destructive/5">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="size-5 text-destructive" />
                        <span className="font-semibold text-destructive">
                            Giỏ: {basket.basketId}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {basket.items.map((item, index) => (
                        <div
                            key={`${item.sku}-${index}`}
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border"
                        >
                            <div className="flex items-center gap-2">
                                <Package className="size-4 text-destructive" />
                                <span className="font-mono text-sm">{item.sku}</span>
                            </div>
                            <Badge variant="secondary" className="font-mono bg-destructive/10 text-destructive">
                                x{item.qty}
                            </Badge>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg mb-4">
                    <span className="font-medium text-destructive">Tổng số lượng:</span>
                    <Badge className="bg-transparent text-destructive text-lg font-bold px-3">
                        {totalItems} items
                    </Badge>
                </div>

                {/* Confirm Button */}
                <Button
                    onClick={onConfirm}
                    disabled={isAssigning}
                    className="w-full bg-destructive hover:bg-destructive/90 text-lg p-6"
                >
                    {isAssigning ? (
                        <>
                            <Loader2 className="size-5 mr-2 animate-spin" />
                            Đang gán...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="size-5 mr-2" />
                            Xác nhận
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
