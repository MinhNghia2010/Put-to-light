"use client";

import { Search, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    dateRange: string;
    onDateRangeChange: (value: string) => void;
    selectedCrate: string;
    onCrateChange: (value: string) => void;
    uniqueCrates: string[];
}

export function SearchFilters({
    searchQuery,
    onSearchChange,
    dateRange,
    onDateRangeChange,
    selectedCrate,
    onCrateChange,
    uniqueCrates,
}: SearchFiltersProps) {
    return (
        <Card className="mb-6">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by barcode, SKU or product name..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 bg-input-background border-0"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <Select value={dateRange} onValueChange={onDateRangeChange}>
                            <SelectTrigger className="w-[180px] bg-input-background border-0">
                                <SelectValue placeholder="Date range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="last7">Last 7 Days</SelectItem>
                                <SelectItem value="last30">Last 30 Days</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">FILTER CRATE:</span>
                    <Button
                        variant={selectedCrate === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onCrateChange("all")}
                        className={
                            selectedCrate === "all"
                                ? "bg-destructive hover:bg-destructive/90"
                                : ""
                        }
                    >
                        All Crates
                    </Button>
                    {uniqueCrates.slice(0, 4).map((crate) => (
                        <Button
                            key={crate}
                            variant={selectedCrate === crate ? "default" : "outline"}
                            size="sm"
                            onClick={() => onCrateChange(crate)}
                            className={
                                selectedCrate === crate
                                    ? "bg-destructive hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            {crate}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
