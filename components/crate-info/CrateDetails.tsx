"use client";

import { Package, Hash } from "lucide-react";
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Crate } from "@/types";

type CrateData = Crate & { availableCapacity: number };

interface CrateDetailsProps {
    crate: CrateData;
    recentBaskets: {
        basketId: string;
        assignedCrateId: string;
        totalItems: number;
    }[];
}

// Get status badge
function getStatusBadge(status: string, lightStatus: string) {
    if (lightStatus === "on") {
        return (
            <Badge className="bg-green-500/20 text-green-700 border-green-500">
                🔆 SÁNG
            </Badge>
        );
    }
    switch (status) {
        case "available":
            return (
                <Badge className="bg-blue-500/10 text-blue-700 border-0">
                    SẴN SÀNG
                </Badge>
            );
        case "assigned":
            return (
                <Badge className="bg-yellow-500/10 text-yellow-700 border-0">
                    ĐÃ GÁN
                </Badge>
            );
        case "full":
            return (
                <Badge className="bg-red-500/10 text-red-700 border-0">
                    ĐẦY
                </Badge>
            );
        case "maintenance":
            return (
                <Badge className="bg-gray-500/10 text-gray-700 border-0">
                    BẢO TRÌ
                </Badge>
            );
        default:
            return (
                <Badge
                    variant="outline"
                    className="border-muted-foreground/20"
                >
                    TRỐNG
                </Badge>
            );
    }
}

export function CrateDetails({ crate, recentBaskets }: CrateDetailsProps) {
    const crateBaskets = recentBaskets.filter(b => b.assignedCrateId === crate.crateId);

    return (
        <>
            {/* Header Card */}
            <Card className="mb-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">
                            Crate {crate.crateId}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Vị trí: {crate.position} •
                            Sức chứa: {crate.currentLoad}/{crate.maxCapacity} items
                        </p>
                    </div>
                    {getStatusBadge(crate.status, crate.lightStatus)}
                </div>
            </Card>

            {/* Capacity Progress */}
            <Card className="mb-4 p-4">
                <h3 className="font-medium mb-3">Dung lượng</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Đã sử dụng</span>
                        <span className="font-mono">
                            {crate.currentLoad} / {crate.maxCapacity} items
                        </span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${crate.status === "full" ? "bg-red-500" :
                                crate.currentLoad > crate.maxCapacity * 0.7 ? "bg-yellow-500" :
                                    "bg-green-500"
                                }`}
                            style={{
                                width: `${(crate.currentLoad / crate.maxCapacity) * 100}%`
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Còn trống: {crate.availableCapacity} items</span>
                        <span>{Math.round((crate.currentLoad / crate.maxCapacity) * 100)}%</span>
                    </div>
                </div>
            </Card>

            {/* Assigned Basket */}
            {crate.assignedBasketId && (
                <Card className="mb-4 p-4 border-green-500 bg-green-50">
                    <h3 className="font-medium mb-2 text-green-700">Giỏ hàng được gán</h3>
                    <div className="flex items-center gap-3">
                        <Package className="size-8 text-green-600" />
                        <div>
                            <p className="font-mono text-lg">{crate.assignedBasketId}</p>
                            <p className="text-xs text-green-600">Đang chờ xử lý</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Items List */}
            <Card className="mb-4 p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Hash className="size-4" />
                    Chi tiết hàng hóa ({crate.items?.length || 0})
                </h3>
                {crate.items && crate.items.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-12 gap-2 bg-muted/50 p-2 text-xs font-medium text-muted-foreground">
                            <div className="col-span-4">Mã SP (SKU)</div>
                            <div className="col-span-2 text-center">SL</div>
                            <div className="col-span-6">Nguồn (Đơn/Rổ)</div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {crate.items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 p-2 text-sm border-t hover:bg-muted/30 items-center">
                                    <div className="col-span-4 font-mono truncate" title={item.sku}>
                                        {item.sku}
                                    </div>
                                    <div className="col-span-2 text-center font-bold">
                                        {item.qty}
                                    </div>
                                    <div className="col-span-6 text-xs text-muted-foreground truncate">
                                        {crate.assignedBasketId || "N/A"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg">
                        Chưa có sản phẩm nào
                    </div>
                )}
            </Card>

            {/* Recent Activity */}
            <Card className="p-4">
                <h3 className="font-medium mb-3">Hoạt động gần đây</h3>
                {crateBaskets.length > 0 ? (
                    <div className="space-y-2">
                        {crateBaskets.map((basket) => (
                            <div
                                key={basket.basketId}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="size-5 text-muted-foreground" />
                                    <span className="font-mono text-sm">{basket.basketId}</span>
                                </div>
                                <Badge variant="outline">
                                    {basket.totalItems} items
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="size-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Chưa có hoạt động nào</p>
                    </div>
                )}
            </Card>
        </>
    );
}
