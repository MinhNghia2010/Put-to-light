'use client'

import { useState } from "react";
import Link from "next/link";
import { Package, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { AddToCrateModal } from "@/components/AddToCrateModal";

interface CrateSlot {
    filled: boolean;
    product?: string;
}

interface Crate {
    id: string;
    zone: string;
    shift: number;
    capacity: number;
    filled: number;
    status: "ready" | "full" | "scanning" | "empty";
    slots: CrateSlot[];
    lastProduct?: string;
}

export default function ScanStation() {
    const [isAddToCrateOpen, setIsAddToCrateOpen] = useState(false);
    const [selectedCrateId, setSelectedCrateId] = useState<string>("");
    
    const [scannedProduct, setScannedProduct] = useState({
        sku: "PRO-AUDIO-X7",
        name: "Wireless Noise-Canceling Headphones",
        category: "Electronics > Audio",
        weight: "0.45 kg",
        dimensions: "18×15×5 cm",
        destZone: "Zone A-03",
        quantity: "1 Unit",
    });

    const [crates, setCrates] = useState<Crate[]>([
        {
            id: "A-01",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 4,
            status: "ready",
            slots: Array(10)
                .fill(null)
                .map((_, i) => ({ filled: i < 4 })),
            lastProduct: "Smart Wat...",
        },
        {
            id: "A-02",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 10,
            status: "full",
            slots: Array(10).fill({ filled: true }),
            lastProduct: "Gaming M...",
        },
        {
            id: "A-03",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 7,
            status: "scanning",
            slots: Array(10)
                .fill(null)
                .map((_, i) => ({ filled: i < 7 })),
            lastProduct: "Scanning...",
        },
        {
            id: "A-04",
            zone: "A",
            shift: 2,
            capacity: 10,
            filled: 2,
            status: "ready",
            slots: Array(10)
                .fill(null)
                .map((_, i) => ({ filled: i < 2 })),
            lastProduct: "HDMI Cable",
        },
        {
            id: "B-01",
            zone: "B",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
        {
            id: "B-02",
            zone: "B",
            shift: 2,
            capacity: 10,
            filled: 5,
            status: "ready",
            slots: Array(10)
                .fill(null)
                .map((_, i) => ({ filled: i < 5 })),
            lastProduct: "Keyboard",
        },
        {
            id: "B-03",
            zone: "B",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
        {
            id: "B-04",
            zone: "B",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
        {
            id: "C-01",
            zone: "C",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
        {
            id: "C-02",
            zone: "C",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
        {
            id: "C-03",
            zone: "C",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
        {
            id: "C-04",
            zone: "C",
            shift: 2,
            capacity: 10,
            filled: 0,
            status: "empty",
            slots: Array(10).fill({ filled: false }),
            lastProduct: "Empty",
        },
    ]);

    // Get the current target crate (scanning status)
    const currentTargetCrate = crates.find(c => c.status === "scanning");

    const handleOpenAddToCrate = (crateId: string) => {
        setSelectedCrateId(crateId);
        setIsAddToCrateOpen(true);
    };

    const handleConfirmAssign = () => {
        if (currentTargetCrate) {
            handleOpenAddToCrate(currentTargetCrate.id);
        }
    };

    return (
        <>
            <Navigation currentPage="scan-station" />
            <div className="flex gap-4 xl:gap-6 p-4 xl:p-6 bg-muted/30 overflow-hidden">
                <div className="w-[280px] xl:w-[340px] flex flex-col gap-3 xl:gap-4 flex-shrink-0">
                    {/* Camera Feed */}
                    <Card className="overflow-hidden py-0">
                        <CardContent className="p-0">
                        <div className="relative aspect-4/3 bg-gradient-to-br from-gray-800 to-gray-900">

                            {/* Barcode frame overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[200px] xl:w-[280px] h-[130px] xl:h-[180px] border-2 border-destructive/50 rounded-lg relative">
                                    {/* Corner decorations */}
                                    <div className="absolute top-0 left-0 w-6 xl:w-8 h-6 xl:h-8 border-t-4 border-l-4 border-destructive rounded-tl-lg"></div>
                                    <div className="absolute top-0 right-0 w-6 xl:w-8 h-6 xl:h-8 border-t-4 border-r-4 border-destructive rounded-tr-lg"></div>
                                    <div className="absolute bottom-0 left-0 w-6 xl:w-8 h-6 xl:h-8 border-b-4 border-l-4 border-destructive rounded-bl-lg"></div>
                                    <div className="absolute bottom-0 right-0 w-6 xl:w-8 h-6 xl:h-8 border-b-4 border-r-4 border-destructive rounded-br-lg"></div>

                                    {/* Scanning line animation */}
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-destructive/70 shadow-lg shadow-destructive/50"></div>
                                </div>
                            </div>

                            <div className="absolute bottom-3 xl:bottom-4 left-1/2 -translate-x-1/2 bg-transparent px-3 pt-3 rounded text-[8px] xl:text-xs text-white">
                                Position barcode in frame
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scanned Product */}
                <Card className="overflow-auto">
                    <CardContent className="p-3 xl:px-4 py-0">
                        <div className="flex items-start gap-2 xl:gap-3 mb-3 xl:mb-4">
                            <div className="flex items-center justify-center size-10 xl:size-12 bg-destructive/10 rounded-lg flex-shrink-0">
                                <Package className="size-5 xl:size-6 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Badge className="bg-green-500 text-white mb-1 xl:mb-2 text-[10px] xl:text-xs">
                                    MATCH FOUND
                                </Badge>
                                <p className="text-[10px] xl:text-xs text-muted-foreground truncate">SKU: {scannedProduct.sku}</p>
                            </div>
                        </div>

                        <h3 className="mb-3 xl:mb-4 text-sm xl:text-base leading-tight">{scannedProduct.name}</h3>

                        <div className="space-y-1.5 xl:space-y-2 mb-3 xl:mb-4 text-xs xl:text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="truncate ml-2">{scannedProduct.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Weight:</span>
                                <span>{scannedProduct.weight}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dimensions:</span>
                                <span>{scannedProduct.dimensions}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1.5 xl:pt-2 mt-1.5 xl:mt-2">
                                <span className="text-muted-foreground">Dest. Zone:</span>
                                <span className="font-medium text-destructive">{scannedProduct.destZone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span>{scannedProduct.quantity}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-destructive hover:bg-destructive/90 text-xs xl:text-sm h-9 xl:h-10"
                            onClick={handleConfirmAssign}
                            disabled={!currentTargetCrate}
                        >
                            <CheckCircle2 className="size-3.5 xl:size-4 mr-1.5 xl:mr-2" />
                            Confirm & Assign to Crate
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel - Active Crate Manifest */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-4">
                <h1 className="font-bold text-lg xl:text-xl mb-3 xl:mb-4 shrink-0">
                    Crates
                </h1>
                <div className="grid grid-cols-4 gap-2 xl:gap-3 flex-1 auto-rows-fr">
                    {crates.map((crate) => (
                        <Card
                            key={crate.id}
                            className={`relative overflow-hidden transition-all ${crate.status === "scanning"
                                ? "ring-2 ring-destructive shadow-lg shadow-destructive/20 cursor-pointer hover:shadow-destructive/30"
                                : ""
                                }`}
                            onClick={() => crate.status === "scanning" && handleOpenAddToCrate(crate.id)}
                        >
                            <CardContent className="px-4 py-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs xl:text-sm font-semibold">{crate.id}</h4>
                                    <Button 
                                        asChild 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 xl:h-7 xl:w-7 hover:bg-muted"
                                    >
                                        <Link href={`/crate-info?crate=${crate.id}`}>
                                            <Info className="size-3.5 xl:size-4 text-muted-foreground" />
                                        </Link>
                                    </Button>
                                </div>

                                {/* Slot Grid */}
                                <div className="grid grid-cols-5 gap-0.5 mb-2">
                                    {crate.slots.map((slot, idx) => (
                                        <div
                                            key={idx}
                                            className={`aspect-square rounded-sm ${slot.filled
                                                ? "bg-destructive"
                                                : "bg-muted border border-border"
                                                }`}
                                        ></div>
                                    ))}
                                </div>

                                <div className="text-[10px] xl:text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground truncate mr-1">
                                            {crate.status === "scanning" ? "Scanning..." : `Last: ${crate.lastProduct}`}
                                        </span>
                                        <span className="font-medium flex-shrink-0">
                                            {crate.filled}/{crate.capacity}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>

        {/* Add to Crate Modal */}
        <AddToCrateModal
            open={isAddToCrateOpen}
            onClose={() => setIsAddToCrateOpen(false)}
            crateId={selectedCrateId}
        />
        </>
    );
}