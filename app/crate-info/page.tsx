'use client'

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, Hash } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface CrateItem {
    id: string;
    sku: string;
    name: string;
    category: string;
    quantity: number;
    timeAdded: string;
    weight: string;
}

interface Crate {
    id: string;
    zone: string;
    shift: number;
    capacity: number;
    filled: number;
    status: "ready" | "full" | "scanning" | "empty";
    items: CrateItem[];
}

export default function CrateInfo() {
    const searchParams = useSearchParams();
    const crateParam = searchParams.get("crate");
    const [selectedCrateId, setSelectedCrateId] =
        useState<string>(crateParam || "A-01");

    // Update selected crate when URL parameter changes
    useEffect(() => {
        if (crateParam) {
            setSelectedCrateId(crateParam);
        }
    }, [crateParam]);

    const crates: Crate[] = [
        {
            id: "A-01",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 4,
            status: "ready",
            items: [
                {
                    id: "1",
                    sku: "WATCH-SM-001",
                    name: "Smart Watch Series 5",
                    category: "Electronics > Wearables",
                    quantity: 1,
                    timeAdded: "14:23:15",
                    weight: "0.35 kg",
                },
                {
                    id: "2",
                    sku: "BAND-SW-002",
                    name: "Smart Watch Band",
                    category: "Accessories",
                    quantity: 2,
                    timeAdded: "14:25:42",
                    weight: "0.05 kg",
                },
                {
                    id: "3",
                    sku: "CHRG-USB-C",
                    name: "USB-C Charging Cable",
                    category: "Electronics > Cables",
                    quantity: 1,
                    timeAdded: "14:28:03",
                    weight: "0.08 kg",
                },
            ],
        },
        {
            id: "A-02",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 10,
            status: "full",
            items: [
                {
                    id: "1",
                    sku: "MOUSE-GM-X1",
                    name: "Gaming Mouse Pro X",
                    category: "Electronics > Gaming",
                    quantity: 2,
                    timeAdded: "13:15:22",
                    weight: "0.12 kg",
                },
                {
                    id: "2",
                    sku: "PAD-MSE-L",
                    name: "Large Mouse Pad",
                    category: "Accessories",
                    quantity: 3,
                    timeAdded: "13:18:45",
                    weight: "0.25 kg",
                },
                {
                    id: "3",
                    sku: "KB-MECH-RGB",
                    name: "Mechanical Keyboard RGB",
                    category: "Electronics > Gaming",
                    quantity: 2,
                    timeAdded: "13:22:11",
                    weight: "0.95 kg",
                },
                {
                    id: "4",
                    sku: "HDST-GM-001",
                    name: "Gaming Headset",
                    category: "Electronics > Audio",
                    quantity: 3,
                    timeAdded: "13:28:33",
                    weight: "0.35 kg",
                },
            ],
        },
        {
            id: "A-03",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 7,
            status: "scanning",
            items: [
                {
                    id: "1",
                    sku: "PRO-AUDIO-X7",
                    name: "Wireless Noise-Canceling Headphones",
                    category: "Electronics > Audio",
                    quantity: 1,
                    timeAdded: "15:12:30",
                    weight: "0.45 kg",
                },
                {
                    id: "2",
                    sku: "CASE-AUD-X7",
                    name: "Headphone Carrying Case",
                    category: "Accessories",
                    quantity: 1,
                    timeAdded: "15:15:18",
                    weight: "0.15 kg",
                },
                {
                    id: "3",
                    sku: "CABL-AUX-1M",
                    name: "3.5mm Audio Cable 1m",
                    category: "Electronics > Cables",
                    quantity: 2,
                    timeAdded: "15:18:45",
                    weight: "0.03 kg",
                },
                {
                    id: "4",
                    sku: "ADPT-USB-AUD",
                    name: "USB Audio Adapter",
                    category: "Electronics > Adapters",
                    quantity: 1,
                    timeAdded: "15:21:02",
                    weight: "0.02 kg",
                },
                {
                    id: "5",
                    sku: "CHRG-USBC-2M",
                    name: "USB-C Charging Cable 2m",
                    category: "Electronics > Cables",
                    quantity: 2,
                    timeAdded: "15:24:37",
                    weight: "0.08 kg",
                },
            ],
        },
        {
            id: "A-04",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 2,
            status: "ready",
            items: [
                {
                    id: "1",
                    sku: "HDMI-2.1-3M",
                    name: "HDMI Cable 2.1 - 3m",
                    category: "Electronics > Cables",
                    quantity: 1,
                    timeAdded: "14:45:12",
                    weight: "0.12 kg",
                },
                {
                    id: "2",
                    sku: "ADPT-HDMI-DP",
                    name: "HDMI to DisplayPort Adapter",
                    category: "Electronics > Adapters",
                    quantity: 1,
                    timeAdded: "14:47:55",
                    weight: "0.05 kg",
                },
            ],
        },
        {
            id: "B-01",
            zone: "B",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            items: [],
        },
        {
            id: "B-02",
            zone: "B",
            shift: 2,
            capacity: 10,
            filled: 5,
            status: "ready",
            items: [
                {
                    id: "1",
                    sku: "KB-WIRE-STD",
                    name: "Standard Wired Keyboard",
                    category: "Electronics > Peripherals",
                    quantity: 2,
                    timeAdded: "12:30:22",
                    weight: "0.65 kg",
                },
                {
                    id: "2",
                    sku: "MOUSE-WIRE-01",
                    name: "Wired Optical Mouse",
                    category: "Electronics > Peripherals",
                    quantity: 2,
                    timeAdded: "12:33:45",
                    weight: "0.10 kg",
                },
                {
                    id: "3",
                    sku: "HUB-USB-4P",
                    name: "4-Port USB Hub",
                    category: "Electronics > Hubs",
                    quantity: 1,
                    timeAdded: "12:36:18",
                    weight: "0.15 kg",
                },
            ],
        },
    ];

    const selectedCrate =
        crates.find((c) => c.id === selectedCrateId) || crates[0];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ready":
                return (
                    <Badge className="bg-green-500/10 text-green-700 border-0">
                        READY
                    </Badge>
                );
            case "full":
                return (
                    <Badge className="bg-red-500/10 text-red-700 border-0">
                        FULL
                    </Badge>
                );
            case "scanning":
                return (
                    <Badge className="bg-destructive/10 text-destructive border-0">
                        SCANNING
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="border-muted-foreground/20"
                    >
                        EMPTY
                    </Badge>
                );
        }
    };

    return (
        <>
            <Navigation
                currentPage="crate-info"
            />
            <div className="flex gap-6 p-6 bg-background min-h-screen">
                {/* Left Panel - Crates List */}
                <div className="w-80 flex flex-col gap-4 sticky top-24 self-start">
                    <Card className="p-4">
                        <h1 className="items-center font-bold text-[20px]">
                            Active Crates
                        </h1>
                    </Card>

                    <Card className="py-2">
                        <CardContent className="px-0">
                            <div className="flex flex-col">
                                {crates.map((crate, index) => (
                                    <div
                                        key={crate.id}
                                        className={`cursor-pointer transition-all duration-300 ${index !== crates.length - 1
                                            ? "border-b"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            setSelectedCrateId(
                                                selectedCrateId === crate.id
                                                    ? ""
                                                    : crate.id,
                                            )
                                        }
                                    >
                                        <div
                                            className={`p-4 hover:bg-accent/50 ${selectedCrateId === crate.id
                                                ? "bg-destructive/5 border-l-4 border-l-destructive"
                                                : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">
                                                    {crate.id}
                                                </h3>
                                                {getStatusBadge(crate.status)}
                                            </div>

                                            {selectedCrateId === crate.id && (
                                                <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            Capacity:
                                                        </span>
                                                        <span className="font-medium">
                                                            {crate.filled}/{crate.capacity}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-destructive h-2 rounded-full transition-all"
                                                            style={{
                                                                width: `${(crate.filled / crate.capacity) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Crate Items */}
                <div className="flex-1">
                    <Card className="mb-4 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    Crate {selectedCrate.id} - Item Details
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Zone {selectedCrate.zone} • Shift{" "}
                                    {selectedCrate.shift} •{" "}
                                    {selectedCrate.items.length} items
                                </p>
                            </div>
                            {getStatusBadge(selectedCrate.status)}
                        </div>
                    </Card>

                    {selectedCrate.items.length > 0 ? (
                        <div className="space-y-3">
                            {selectedCrate.items.map((item, index) => (
                                <Card
                                    key={item.id}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* Item Icon & Number */}
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center justify-center size-12 bg-destructive/10 rounded-lg">
                                                    <Package className="size-6 text-destructive" />
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    #{index + 1}
                                                </Badge>
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="mb-1">{item.name}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            SKU: {item.sku}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            Quantity:
                                                        </span>
                                                        <span className="font-medium">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            Added:
                                                        </span>
                                                        <span className="font-medium">
                                                            {item.timeAdded}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            Category:
                                                        </span>
                                                        <span>{item.category}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            Weight:
                                                        </span>
                                                        <span>{item.weight}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="mb-2">No Items in Crate</h3>
                                <p className="text-sm text-muted-foreground">
                                    This crate is currently empty. Start scanning
                                    items to add them.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}