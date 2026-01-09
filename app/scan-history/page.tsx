"use client"

import { useState } from "react";
import { Search, Calendar, Download, Package, Flag, TrendingUp, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navigation } from "@/components/Navigation";

interface ScanRecord {
    id: string;
    product: string;
    category: string;
    barcode: string;
    time: string;
    crate: string;
    status: "stocked" | "flagged";
    image: string;
}

export default function ScanHistory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCrate, setSelectedCrate] = useState("all");
    const [dateRange, setDateRange] = useState("last30");

    const stats = [
        {
            label: "Total Scans Today",
            value: "142",
            icon: Package,
            iconColor: "text-destructive",
            iconBg: "bg-destructive/10",
        },
        {
            label: "Active Crates",
            value: "5",
            icon: Package,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-500/10",
        },
        {
            label: "Items Flagged",
            value: "2",
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

    const scanRecords: ScanRecord[] = [
        {
            id: "1",
            product: "M12 Hex Bolt Set",
            category: "Hardware • Bulk",
            barcode: "8901-23901",
            time: "Oct 24, 14:30",
            crate: "Crate #402",
            status: "stocked",
            image: "🔩",
        },
        {
            id: "2",
            product: "Packaging Tape 50mm",
            category: "Supplies • Roll",
            barcode: "7221-99832",
            time: "Oct 24, 14:15",
            crate: "Crate #402",
            status: "stocked",
            image: "📦",
        },
        {
            id: "3",
            product: "Unknown Item #992",
            category: "Uncategorized",
            barcode: "0000-ERROR",
            time: "Oct 24, 13:55",
            crate: "Not Assigned",
            status: "flagged",
            image: "❓",
        },
        {
            id: "4",
            product: "Safety Gloves L",
            category: "PPE • Pairs",
            barcode: "3321-55412",
            time: "Oct 24, 13:42",
            crate: "Crate #401",
            status: "stocked",
            image: "🧤",
        },
        {
            id: "5",
            product: "Industrial Cleaner 5L",
            category: "Chemicals • Jerry Can",
            barcode: "1102-99381",
            time: "Oct 24, 13:10",
            crate: "Crate #401",
            status: "stocked",
            image: "🧴",
        },
    ];

    return (
        <>
            <Navigation
                currentPage="scan-history"
            />
            <div className="p-6 bg-background min-h-screen">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-bold text-xl">Scan History</h2>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Download className="size-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, idx) => (
                            <Card key={idx}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                            <h2 className="text-3xl">{stat.value}</h2>
                                        </div>
                                        <div className={`flex items-center justify-center size-12 ${stat.iconBg} rounded-lg`}>
                                            <stat.icon className={`size-6 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by barcode, SKU or product name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-input-background border-0"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-muted-foreground" />
                                    <Select value={dateRange} onValueChange={setDateRange}>
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
                                    onClick={() => setSelectedCrate("all")}
                                    className={selectedCrate === "all" ? "bg-destructive hover:bg-destructive/90" : ""}
                                >
                                    All Crates
                                </Button>
                                <Button
                                    variant={selectedCrate === "401" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCrate("401")}
                                    className={selectedCrate === "401" ? "bg-destructive hover:bg-destructive/90" : ""}
                                >
                                    Crate #401
                                </Button>
                                <Button
                                    variant={selectedCrate === "402" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCrate("402")}
                                    className={selectedCrate === "402" ? "bg-destructive hover:bg-destructive/90" : ""}
                                >
                                    Crate #402
                                </Button>
                                <Button
                                    variant={selectedCrate === "403" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCrate("403")}
                                    className={selectedCrate === "403" ? "bg-destructive hover:bg-destructive/90" : ""}
                                >
                                    Crate #403
                                </Button>
                                <Button variant="ghost" size="sm">
                                    +
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Table */}
                    <Card>
                        <CardContent className="px-[24px] py-[0px]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b hover:bg-transparent">
                                        <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                                            Product
                                        </TableHead>
                                        <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                                            Barcode
                                        </TableHead>
                                        <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                                            Time Scanned
                                        </TableHead>
                                        <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                                            Crate Assignment
                                        </TableHead>
                                        <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-xs uppercase text-muted-foreground font-medium text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scanRecords.map((record) => (
                                        <TableRow key={record.id} className="border-b">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center size-10 bg-muted rounded-lg text-xl">
                                                        {record.image}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{record.product}</p>
                                                        <p className="text-xs text-muted-foreground">{record.category}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-mono">
                                                    <Package className="size-4 text-muted-foreground" />
                                                    {record.barcode}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{record.time}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Package className="size-4 text-destructive" />
                                                    <span className="text-sm">{record.crate}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {record.status === "stocked" ? (
                                                    <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-0">
                                                        • Stocked
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
                                                        • Flagged
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Reassign Crate</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">
                                                            Remove Scan
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-2 border-t">
                                <p className="text-sm text-muted-foreground">Showing 1-5 of 142 results</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" disabled>
                                        <span className="sr-only">Previous</span>
                                        <svg
                                            className="size-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        1
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        2
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        3
                                    </Button>
                                    <span className="text-sm text-muted-foreground px-2">...</span>
                                    <Button variant="outline" size="icon">
                                        <span className="sr-only">Next</span>
                                        <svg
                                            className="size-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
