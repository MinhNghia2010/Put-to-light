"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { CrateSelector, CrateDetails } from "@/components/crate-info";
import * as api from "@/lib/api";
import type { Crate } from "@/types";

type CrateData = Crate & { availableCapacity: number };

export function CrateInfo() {
    const searchParams = useSearchParams();
    const crateParam = searchParams.get("crate");
    const [selectedCrateId, setSelectedCrateId] = useState<string>(crateParam || "CRATE-01");
    const [isLoading, setIsLoading] = useState(true);
    const [crates, setCrates] = useState<CrateData[]>([]);
    const [recentBaskets, setRecentBaskets] = useState<{
        basketId: string;
        assignedCrateId: string;
        totalItems: number;
    }[]>([]);

    // Update selected crate when URL parameter changes
    useEffect(() => {
        if (crateParam) {
            setSelectedCrateId(crateParam);
        }
    }, [crateParam]);

    // Load crates from put-to-light API
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await api.getPutToLightStatus();
            if (result.success && result.crates) {
                setCrates(result.crates);
                if (result.recentBaskets) {
                    setRecentBaskets(result.recentBaskets);
                }
                // Auto-select first crate if no param
                if (!crateParam && result.crates.length > 0) {
                    setSelectedCrateId(result.crates[0].crateId);
                }
            }
        } catch (error) {
            console.error("Error loading crates:", error);
        } finally {
            setIsLoading(false);
        }
    }, [crateParam]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const selectedCrate = crates.find((c) => c.crateId === selectedCrateId) || crates[0];

    if (isLoading) {
        return (
            <>
                <Navigation currentPage="crate-info" />
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="size-8 animate-spin text-destructive" />
                </div>
            </>
        );
    }

    return (
        <>
            <Navigation currentPage="crate-info" />
            <div className="flex gap-6 p-6 bg-background min-h-screen">
                {/* Left Panel - Crates Selector */}
                <CrateSelector
                    crates={crates}
                    selectedCrateId={selectedCrateId}
                    onSelectCrate={setSelectedCrateId}
                    onRefresh={loadData}
                />

                {/* Right Panel - Crate Details */}
                <div className="flex-1">
                    {selectedCrate ? (
                        <CrateDetails
                            crate={selectedCrate}
                            recentBaskets={recentBaskets}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="mb-2">Chọn một Crate</h3>
                                <p className="text-sm text-muted-foreground">
                                    Nhấn vào crate từ danh sách bên trái để xem chi tiết.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
