"use client";

import { Package, MoreVertical, Loader2 } from "lucide-react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ScanHistoryEntry } from "@/types";

interface HistoryTableProps {
    history: ScanHistoryEntry[];
    isLoading: boolean;
}

// Format timestamp
function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Get action badge
function getActionBadge(action: string) {
    switch (action) {
        case "put":
            return (
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-0">
                    • Stocked
                </Badge>
            );
        case "update":
            return (
                <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-0">
                    • Updated
                </Badge>
            );
        case "remove":
            return (
                <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
                    • Removed
                </Badge>
            );
        default:
            return (
                <Badge variant="outline">
                    {action}
                </Badge>
            );
    }
}

export function HistoryTable({ history, isLoading }: HistoryTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-destructive" />
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                    <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                        Product
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                        SKU / Basket
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                        Time Scanned
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                        Crate Assignment
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground font-medium">
                        Quantity
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
                {history.length > 0 ? (
                    history.map((record) => (
                        <TableRow key={record.id} className="border-b">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center size-10 bg-muted rounded-lg">
                                        <Package className="size-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{record.itemName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {record.operator}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    <p className="font-mono">{record.sku}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {record.basketId}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm">
                                {formatTime(record.timestamp)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Package className="size-4 text-destructive" />
                                    <span className="text-sm">{record.slotId}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                                {record.quantity}
                            </TableCell>
                            <TableCell>{getActionBadge(record.action)}</TableCell>
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
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                            <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                No scan history found
                            </p>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
