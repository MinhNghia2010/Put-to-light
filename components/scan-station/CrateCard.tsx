"use client";

import Link from "next/link";
import { Info, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Crate } from "@/types";

interface CrateCardProps {
    crate: Crate;
    onClick: () => void;
}

// Get crate color based on status
function getCrateColor(status: string, lightStatus: string) {
    if (lightStatus === "on") return "bg-destructive animate-pulse";
    if (status === "full") return "bg-red-500";
    if (status === "maintenance") return "bg-gray-500";
    if (status === "assigned") return "bg-yellow-500";
    return "bg-emerald-900";
}

export function CrateCard({ crate, onClick }: CrateCardProps) {
    return (
        <div
            onClick={onClick}
            className={`relative p-3 h-[20vh] justify-center flex flex-col rounded-xl border-2 transition-all ${crate.lightStatus === "on"
                ? "border-destructive bg-destructive/10 shadow-lg shadow-destructive/20 cursor-pointer hover:shadow-destructive/40"
                : "border-border bg-card hover:border-muted-foreground/30"
                }`}
        >
            {/* Light indicator */}
            <div className={`absolute -top-1.5 -right-2 size-5 rounded-full ${getCrateColor(crate.status, crate.lightStatus)}`} />

            {/* Edit icon for lit crate */}
            {crate.lightStatus === "on" && (
                <div className="absolute top-1 left-1">
                    <Edit3 className="size-3 text-destructive" />
                </div>
            )}

            <div className="text-center">
                <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-2xl ${crate.lightStatus === "on" ? "text-destructive font-bold" : "text-muted-foreground"
                        }`}>
                        {crate.crateId.replace("CRATE-", "")}
                    </span>
                    <Link
                        href={`/crate-info?crate=${crate.crateId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-muted rounded transition-colors"
                    >
                        <Info className="size-6 text-destructive hover:text-destructive/80" />
                    </Link>
                </div>

                {/* Capacity bar */}
                <div className="h-6 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full transition-all ${crate.lightStatus === "on" ? "bg-destructive" :
                            crate.status === "full" ? "bg-red-500" :
                                crate.currentLoad > crate.maxCapacity * 0.7 ? "bg-yellow-500" :
                                    "bg-green-500"
                            }`}
                        style={{ width: `${(crate.currentLoad / crate.maxCapacity) * 100}%` }}
                    />
                </div>

                <div className={`text-xl ${crate.lightStatus === "on" ? "text-destructive font-bold" : ""}`}>
                    {crate.currentLoad}/{crate.maxCapacity}
                </div>

                {crate.assignedBasketId && (
                    <div className="mt-1 text-xs text-destructive font-mono truncate">
                        {crate.assignedBasketId}
                    </div>
                )}
            </div>
        </div>
    );
}
