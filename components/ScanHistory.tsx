"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import {
    StatsCards,
    SearchFilters,
    HistoryTable,
    Pagination,
} from "@/components/scan-history";
import { useScanHistory } from "@/lib/hooks";

export function ScanHistory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCrate, setSelectedCrate] = useState("all");
    const [dateRange, setDateRange] = useState("last30");

    const { history, isLoading, pagination, loadHistory, loadMore } = useScanHistory();

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Filter history based on search and selected crate
    const filteredHistory = history.filter((record) => {
        const matchesSearch = searchQuery === "" ||
            record.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.basketId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCrate = selectedCrate === "all" ||
            record.slotId.includes(selectedCrate);

        return matchesSearch && matchesCrate;
    });

    // Get unique crates from history
    const uniqueCrates = Array.from(new Set(history.map(h => h.slotId)));

    // Export to CSV
    const handleExport = () => {
        const headers = ["ID", "Basket ID", "SKU", "Item Name", "Slot", "Quantity", "Action", "Timestamp", "Operator"];
        const rows = filteredHistory.map(record => [
            record.id,
            record.basketId,
            record.sku,
            record.itemName,
            record.slotId,
            record.quantity,
            record.action,
            record.timestamp,
            record.operator,
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `scan-history-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    return (
        <>
            <Navigation currentPage="scan-history" />
            <div className="p-6 bg-background min-h-screen">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-bold text-xl">Scan History</h2>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handleExport}>
                            <Download className="size-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <StatsCards history={history} />

                    {/* Search and Filters */}
                    <SearchFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        selectedCrate={selectedCrate}
                        onCrateChange={setSelectedCrate}
                        uniqueCrates={uniqueCrates}
                    />

                    {/* Data Table */}
                    <Card>
                        <CardContent className="px-[24px] py-[0px]">
                            <HistoryTable
                                history={filteredHistory}
                                isLoading={isLoading}
                            />

                            {/* Pagination */}
                            <Pagination
                                filteredCount={filteredHistory.length}
                                totalCount={pagination.total}
                                hasMore={pagination.hasMore}
                                onLoadMore={loadMore}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
