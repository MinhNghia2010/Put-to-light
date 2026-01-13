"use client";

import { Package, Flag, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ScanHistoryEntry } from "@/types";

interface StatsCardsProps {
    history: ScanHistoryEntry[];
}

export function StatsCards({ history }: StatsCardsProps) {
    const stats = [
        {
            label: "Total Scans Today",
            value: String(history.length),
            icon: Package,
            iconColor: "text-destructive",
            iconBg: "bg-destructive/10",
        },
        {
            label: "Active Crates",
            value: String(new Set(history.map(h => h.slotId)).size),
            icon: Package,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-500/10",
        },
        {
            label: "Items Flagged",
            value: String(history.filter(h => h.action === "remove").length),
            icon: Flag,
            iconColor: "text-destructive",
            iconBg: "bg-destructive/10",
        },
        {
            label: "Efficiency Rate",
            value: "98%",
            icon: TrendingUp,
            iconColor: "text-green-600",
            iconBg: "bg-green-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, idx) => (
                <Card key={idx}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {stat.label}
                                </p>
                                <h2 className="text-3xl">{stat.value}</h2>
                            </div>
                            <div
                                className={`flex items-center justify-center size-12 ${stat.iconBg} rounded-lg`}
                            >
                                <stat.icon className={`size-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
