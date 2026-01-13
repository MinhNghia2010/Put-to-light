"use client";

import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Crate } from "@/types";

type CrateData = Crate & { availableCapacity: number };

interface CrateSelectorProps {
    crates: CrateData[];
    selectedCrateId: string;
    onSelectCrate: (crateId: string) => void;
    onRefresh: () => void;
}

export function CrateSelector({
    crates,
    selectedCrateId,
    onSelectCrate,
    onRefresh,
}: CrateSelectorProps) {
    return (
        <div className="w-80 flex flex-col gap-4 sticky top-24 self-start">
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <h1 className="items-center font-bold text-[20px]">
                        Kho Crates (3×4)
                    </h1>
                    <Button variant="ghost" size="sm" onClick={onRefresh}>
                        <RefreshCw className="size-4" />
                    </Button>
                </div>
            </Card>

            {/* 3x4 Grid */}
            <Card className="p-4">
                <div className="grid grid-cols-4 gap-2">
                    {crates.map((crate) => (
                        <div
                            key={crate.crateId}
                            className={`relative p-2 rounded-lg border-2 cursor-pointer transition-all text-center ${selectedCrateId === crate.crateId
                                ? "border-destructive bg-destructive/10"
                                : crate.lightStatus === "on"
                                    ? "border-green-500 bg-green-50"
                                    : "border-border hover:border-muted-foreground/50"
                                }`}
                            onClick={() => onSelectCrate(crate.crateId)}
                        >
                            {/* Light indicator */}
                            {crate.lightStatus === "on" && (
                                <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-green-500 animate-pulse" />
                            )}

                            <div className="font-mono text-xs font-medium">
                                {crate.crateId.replace("CRATE-", "")}
                            </div>

                            {/* Capacity bar */}
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                <div
                                    className={`h-full transition-all ${crate.status === "full" ? "bg-red-500" :
                                        crate.currentLoad > crate.maxCapacity * 0.7 ? "bg-yellow-500" :
                                            "bg-green-500"
                                        }`}
                                    style={{ width: `${(crate.currentLoad / crate.maxCapacity) * 100}%` }}
                                />
                            </div>

                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                {crate.currentLoad}/{crate.maxCapacity}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Back to Scan Station */}
            <Link href="/scan-station">
                <Button variant="outline" className="w-full">
                    <ArrowLeft className="size-4 mr-2" />
                    Quay lại Scan Station
                </Button>
            </Link>
        </div>
    );
}
