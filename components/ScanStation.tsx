"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { QRScanner } from "@/components/QRScanner";
import {
    ScannedBasketCard,
    CrateGrid,
    ConfirmationModal,
    QuantityEditModal,
} from "@/components/scan-station";
import { usePutToLight } from "@/lib/hooks";
import { toast } from "sonner";
import type { ScannedItem, ScannedBasket, ValidationError } from "@/components/shared/types";

export function ScanStation() {
    const [scannedBasket, setScannedBasket] = useState<ScannedBasket | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [selectedLitCrate, setSelectedLitCrate] = useState<string | null>(null);
    const [crateItems, setCrateItems] = useState<ScannedItem[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [previewCrateId, setPreviewCrateId] = useState<string | null>(null);
    const [editableItems, setEditableItems] = useState<ScannedItem[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

    const {
        crateStatus,
        processQRCode,
        loadStatus,
        resetSystem,
    } = usePutToLight();

    // Load status on mount
    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    // Validate basket data
    const validateBasket = useCallback((data: unknown): ValidationError[] => {
        const errors: ValidationError[] = [];

        if (!data || typeof data !== 'object') {
            errors.push({ type: 'missing_basketId', message: 'Dữ liệu không hợp lệ' });
            return errors;
        }

        const obj = data as Record<string, unknown>;

        if (!obj.basketId || typeof obj.basketId !== 'string') {
            errors.push({ type: 'missing_basketId', message: 'Thiếu mã giỏ hàng (basketId)' });
        }

        if (!obj.items || !Array.isArray(obj.items)) {
            errors.push({ type: 'empty_basket', message: 'Không có mặt hàng trong giỏ (items)' });
            return errors;
        }

        if (obj.items.length === 0) {
            errors.push({ type: 'empty_basket', message: 'Giỏ hàng trống' });
        }

        obj.items.forEach((item: unknown, index: number) => {
            const itemObj = item as Record<string, unknown>;
            if (!itemObj.sku || typeof itemObj.sku !== 'string' || itemObj.sku.trim() === '') {
                errors.push({ type: 'missing_sku', message: `Mặt hàng ${index + 1}: Thiếu SKU`, itemIndex: index });
            }
            if (itemObj.qty === undefined || itemObj.qty === null) {
                errors.push({ type: 'missing_qty', message: `Mặt hàng ${index + 1}: Thiếu số lượng (qty)`, itemIndex: index });
            } else if (typeof itemObj.qty !== 'number' || itemObj.qty <= 0) {
                errors.push({ type: 'invalid_qty', message: `Mặt hàng ${index + 1}: Số lượng không hợp lệ`, itemIndex: index });
            }
        });

        return errors;
    }, []);

    // Parse QR/JSON data to get basket items
    const parseBasketData = useCallback((data: string): ScannedBasket | null => {
        try {
            const parsed = JSON.parse(data);
            const errors = validateBasket(parsed);
            setValidationErrors(errors);

            if (errors.some(e => e.type === 'missing_basketId' || e.type === 'empty_basket')) {
                return null;
            }

            if (parsed.basketId && Array.isArray(parsed.items)) {
                return {
                    basketId: parsed.basketId,
                    items: parsed.items.map((item: { sku?: string; qty?: number; name?: string }) => ({
                        sku: item.sku || '',
                        qty: item.qty || 0,
                        name: item.name
                    }))
                };
            }
            return null;
        } catch {
            setValidationErrors([{ type: 'missing_basketId', message: 'JSON không hợp lệ' }]);
            return null;
        }
    }, [validateBasket]);

    // Call preview API to light up crate
    const previewCrate = useCallback(async (itemCount: number): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/put-to-light', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'preview', itemCount })
            });
            const result = await response.json();
            if (result.success && result.previewCrate) {
                setPreviewCrateId(result.previewCrate.crateId);
                loadStatus();
                return { success: true };
            } else {
                return { success: false, error: result.error || 'Không có crate nào khả dụng với sức chứa đủ' };
            }
        } catch (error) {
            console.error('Preview error:', error);
            return { success: false, error: 'Lỗi kết nối server' };
        }
    }, [loadStatus]);

    // Handle QR scan
    const handleQRScan = useCallback(async (data: string) => {
        const basket = parseBasketData(data);
        if (basket) {
            setScannedBasket(basket);
            setEditableItems([...basket.items]);
            const totalItems = basket.items.reduce((sum, item) => sum + item.qty, 0);
            const previewResult = await previewCrate(totalItems);
            if (!previewResult.success) {
                toast.error("Lỗi xem trước", { description: previewResult.error || 'Không tìm thấy crate phù hợp' });
            }
        }
    }, [parseBasketData, previewCrate]);

    // Handle confirm and assign to crate
    const handleConfirmAssign = useCallback(async () => {
        if (!scannedBasket) return;

        const updatedBasket = {
            ...scannedBasket,
            items: editableItems.filter(item => item.sku && item.qty > 0)
        };

        if (updatedBasket.items.length === 0) {
            toast.warning("Giỏ hàng trống", { description: "Không có mặt hàng hợp lệ để gán." });
            setIsConfirmModalOpen(false);
            return;
        }

        setIsAssigning(true);
        setIsConfirmModalOpen(false);

        try {
            const result = await processQRCode(JSON.stringify(updatedBasket));
            if (result?.success) {
                loadStatus();
                toast.success("Gán thành công!", {
                    description: `Crate ${result.data?.assignedCrate?.crateId} đang sáng đèn.`,
                    duration: 5000,
                });
            } else {
                toast.error("Gán thất bại", { description: result?.error?.message || "Đã có lỗi xảy ra." });
            }
        } catch {
            toast.error("Lỗi hệ thống", { description: "Không thể kết nối đến server." });
        } finally {
            setIsAssigning(false);
        }
    }, [scannedBasket, editableItems, processQRCode, loadStatus]);

    // Handle item quantity change in modal
    const handleItemQtyChange = useCallback((index: number, newQty: number) => {
        setEditableItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], qty: newQty };
            return updated;
        });
    }, []);

    // Handle item removal
    const handleRemoveItem = useCallback((index: number) => {
        setEditableItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Handle crate click - only for lit crates
    const handleCrateClick = useCallback((crateId: string, lightStatus: string, currentLoad: number) => {
        if (lightStatus === "on") {
            setSelectedLitCrate(crateId);
            const crate = crateStatus?.crates?.find(c => c.crateId === crateId);
            if (crate && crate.items) {
                setCrateItems([...crate.items]);
            } else {
                setCrateItems([]);
            }
            setIsQuantityModalOpen(true);
        }
    }, [crateStatus]);

    // Handle quantity update
    const handleQuantityUpdate = useCallback(async () => {
        if (!selectedLitCrate) return;

        try {
            const response = await fetch('/api/put-to-light', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update-crate-items',
                    crateId: selectedLitCrate,
                    items: crateItems
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Cập nhật thành công!", { description: `Crate ${selectedLitCrate} đã được cập nhật.` });
                setIsQuantityModalOpen(false);
                setSelectedLitCrate(null);
                loadStatus();
            } else {
                toast.error("Cập nhật thất bại", { description: result.error || "Lỗi không xác định" });
            }
        } catch {
            toast.error("Lỗi hệ thống", { description: "Không thể kết nối server" });
        }
    }, [selectedLitCrate, crateItems, loadStatus]);

    // Handle crate item Qty change
    const handleCrateItemQtyChange = useCallback((index: number, newQty: number) => {
        setCrateItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], qty: newQty };
            return updated;
        });
    }, []);

    // Handle crate item remove
    const handleRemoveCrateItem = useCallback((index: number) => {
        setCrateItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Clear scanned basket
    const handleClearBasket = useCallback(() => {
        setScannedBasket(null);
    }, []);

    // Calculate total items from editable items
    const totalItems = editableItems.reduce((sum, item) => sum + (item.qty || 0), 0);

    // Get the lit crate info
    const litCrate = crateStatus?.crates?.find(c => c.lightStatus === "on");

    return (
        <>
            <Navigation currentPage="scan-station" />
            <div className="flex gap-4 xl:gap-6 p-4 xl:p-6 bg-muted/30 min-h-[calc(100vh-64px)]">
                <div className="w-[280px] xl:w-[340px] flex flex-col gap-3 xl:gap-4 shrink-0">
                    {/* QR Scanner Card */}
                    <Card className="py-0">
                        <CardContent className="p-0">
                            <QRScanner
                                onScanSuccess={handleQRScan}
                                onScanError={(err) => console.log("Scan error:", err)}
                                height={210}
                            />
                        </CardContent>
                    </Card>

                    {/* Scanned Basket Items Display */}
                    {scannedBasket && (
                        <ScannedBasketCard
                            basket={scannedBasket}
                            totalItems={totalItems}
                            isAssigning={isAssigning}
                            onClear={handleClearBasket}
                            onConfirm={() => setIsConfirmModalOpen(true)}
                        />
                    )}
                </div>

                {/* Right Panel - Crate Grid */}
                <CrateGrid
                    crates={crateStatus?.crates || []}
                    summary={crateStatus?.summary}
                    litCrate={litCrate}
                    onCrateClick={handleCrateClick}
                    onRefresh={loadStatus}
                    onReset={resetSystem}
                />
            </div>

            {/* Confirmation Modal */}
            {scannedBasket && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onOpenChange={setIsConfirmModalOpen}
                    basketId={scannedBasket.basketId}
                    editableItems={editableItems}
                    validationErrors={validationErrors}
                    totalItems={totalItems}
                    onItemQtyChange={handleItemQtyChange}
                    onRemoveItem={handleRemoveItem}
                    onConfirm={handleConfirmAssign}
                />
            )}

            {/* Quantity Edit Modal */}
            <QuantityEditModal
                isOpen={isQuantityModalOpen}
                onOpenChange={setIsQuantityModalOpen}
                crateId={selectedLitCrate}
                items={crateItems}
                onItemQtyChange={handleCrateItemQtyChange}
                onRemoveItem={handleRemoveCrateItem}
                onSave={handleQuantityUpdate}
            />
        </>
    );
}
