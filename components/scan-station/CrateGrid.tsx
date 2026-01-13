"use client";

import { RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrateCard } from "./CrateCard";
import { CrateLegend } from "./CrateLegend";
import type { Crate } from "@/types";

interface CrateSummary {
    totalCrates: number;
    available: number;
    assigned: number;
    full: number;
}

interface CrateGridProps {
    crates: Crate[];
    summary?: CrateSummary;
    litCrate?: Crate;
    onCrateClick: (crateId: string, lightStatus: string, currentLoad: number) => void;
    onRefresh: () => void;
    onReset: () => void;
}

export function CrateGrid({
    crates,
    summary,
    litCrate,
    onCrateClick,
    onRefresh,
    onReset,
}: CrateGridProps) {
    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-3 xl:mb-4 shrink-0">
                <h1 className="font-bold text-lg xl:text-xl">Kho Crates (3×4)</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                    >
                        <RefreshCw className="size-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                    >
                        <RotateCcw className="size-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Lit Crate Alert */}
            {litCrate && (
                <div className="mb-4 p-3 bg-destructive/10 border-2 border-destructive rounded-lg animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-4 bg-destructive rounded-full animate-pulse" />
                            <span className="font-semibold text-destructive">
                                CRATE {litCrate.crateId} ĐANG SÁNG
                            </span>
                        </div>
                        <Badge className="bg-destructive">
                            {litCrate.currentLoad}/{litCrate.maxCapacity}
                        </Badge>
                    </div>
                    <p className="text-xs text-destructive/70 mt-1">
                        Nhấn vào crate để chỉnh số lượng hàng
                    </p>
                </div>
            )}

            {/* Summary Stats */}
            {summary && (
                <div className="flex gap-4 mb-4 flex-wrap">
                    <Badge variant="outline">
                        Tổng: {summary.totalCrates}
                    </Badge>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                        Khả dụng: {summary.available}
                    </Badge>
                    <Badge variant="outline" className="border-destructive text-destructive">
                        Đã gán: {summary.assigned}
                    </Badge>
                    <Badge variant="outline" className="border-red-500 text-red-600">
                        Đầy: {summary.full}
                    </Badge>
                </div>
            )}

            {/* 3x4 Crate Grid */}
            <div className="grid grid-cols-4 gap-3 flex-1 auto-rows-min">
                {crates.map((crate) => (
                    <CrateCard
                        key={crate.crateId}
                        crate={crate}
                        onClick={() => onCrateClick(crate.crateId, crate.lightStatus, crate.currentLoad)}
                    />
                ))}
            </div>

            {/* Legend */}
            <CrateLegend />
        </div>
    );
}
