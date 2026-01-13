"use client";

import { useState, useCallback } from "react";
import * as api from "./api";
import type { ScanBasketResponse, Slot, ScanHistoryEntry, PutToLightResponse, QRBasketPayload } from "@/types";

/**
 * Hook để quản lý quét rổ
 */
export function useBasketScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<ScanBasketResponse | null>(null);

  const scan = useCallback(async (basketId: string, stationId?: string) => {
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await api.processBasketScan(basketId, stationId);
      
      if (result.success && result.basket) {
        setLastScan({
          success: true,
          basket: result.basket,
          distributions: result.distributions || [],
        });
        return result;
      } else {
        setError(result.error || "Không thể quét rổ");
        return null;
      }
    } catch (err) {
      setError("Lỗi kết nối");
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLastScan(null);
    setError(null);
  }, []);

  return {
    scan,
    reset,
    isScanning,
    error,
    lastScan,
    basket: lastScan?.basket || null,
    distributions: lastScan?.distributions || [],
  };
}

/**
 * Hook để quản lý các máng (slots)
 */
export function useSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getAllSlots();
      if (result.success && result.slots) {
        setSlots(result.slots);
      }
    } catch (err) {
      setError("Không thể tải danh sách máng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSlot = useCallback((updatedSlot: Slot) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.slotId === updatedSlot.slotId ? updatedSlot : slot
      )
    );
  }, []);

  const getSlotById = useCallback((slotId: string) => {
    return slots.find((slot) => slot.slotId === slotId);
  }, [slots]);

  const getLitSlots = useCallback(() => {
    return slots.filter((slot) => slot.lightStatus === "on");
  }, [slots]);

  return {
    slots,
    isLoading,
    error,
    loadSlots,
    updateSlot,
    getSlotById,
    getLitSlots,
    setSlots,
  };
}

/**
 * Hook để quản lý một máng cụ thể
 */
export function useSlot(slotId: string) {
  const [slot, setSlot] = useState<Slot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlot = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getSlot(slotId);
      if (result.success && result.slot) {
        setSlot(result.slot);
      } else {
        setError(result.error || "Không tìm thấy máng");
      }
    } catch (err) {
      setError("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  }, [slotId]);

  const addItem = useCallback(async (sku: string, quantity: number, basketId: string) => {
    try {
      const result = await api.addItemToSlot(slotId, sku, quantity, basketId);
      if (result.success && result.slot) {
        setSlot(result.slot);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [slotId]);

  const updateQuantity = useCallback(async (sku: string, quantity: number) => {
    try {
      const result = await api.updateSlotQuantity(slotId, {
        slotId,
        sku,
        quantity,
        action: "update",
      });
      if (result.success && result.slot) {
        setSlot(result.slot);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [slotId]);

  const confirm = useCallback(async (sku: string, quantity: number) => {
    try {
      const result = await api.confirmSlot(slotId, sku, quantity);
      if (result.success && result.slot) {
        setSlot(result.slot);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [slotId]);

  const reset = useCallback(async () => {
    try {
      const result = await api.resetSlot(slotId);
      if (result.success && result.slot) {
        setSlot(result.slot);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [slotId]);

  return {
    slot,
    isLoading,
    error,
    loadSlot,
    addItem,
    updateQuantity,
    confirm,
    reset,
    isLit: slot?.lightStatus === "on",
  };
}

/**
 * Hook để quản lý lịch sử
 */
export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  const loadHistory = useCallback(async (params?: {
    basketId?: string;
    slotId?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    try {
      const result = await api.getHistory(params);
      if (result.success && result.history) {
        setHistory(result.history);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore) return;
    
    setIsLoading(true);
    try {
      const result = await api.getHistory({
        offset: pagination.offset + pagination.limit,
        limit: pagination.limit,
      });
      if (result.success && result.history) {
        setHistory((prev) => [...prev, ...result.history!]);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    } catch (err) {
      console.error("Error loading more history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

  return {
    history,
    isLoading,
    pagination,
    loadHistory,
    loadMore,
  };
}

/**
 * Hook for Put-to-Light workflow
 * Handles QR scanning and crate assignment
 */
export function usePutToLight() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PutToLightResponse | null>(null);
  const [crateStatus, setCrateStatus] = useState<Awaited<ReturnType<typeof api.getPutToLightStatus>> | null>(null);

  /**
   * Process a QR code scan (raw string from scanner)
   */
  const processQRCode = useCallback(async (qrData: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await api.processQRScan(qrData);
      setLastResult(result);

      if (!result.success && result.error) {
        setError(`${result.error.code}: ${result.error.message}`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection error";
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Process a basket payload directly (already parsed)
   */
  const processBasket = useCallback(async (payload: QRBasketPayload) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await api.putToLight(payload);
      setLastResult(result);

      if (!result.success && result.error) {
        setError(`${result.error.code}: ${result.error.message}`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection error";
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Load current crate status
   */
  const loadStatus = useCallback(async () => {
    try {
      const status = await api.getPutToLightStatus();
      setCrateStatus(status);
      return status;
    } catch (err) {
      console.error("Error loading crate status:", err);
      return null;
    }
  }, []);

  /**
   * Reset the system
   */
  const resetSystem = useCallback(async () => {
    try {
      const result = await api.resetPutToLight();
      if (result.success) {
        setLastResult(null);
        setError(null);
        await loadStatus();
      }
      return result;
    } catch (err) {
      console.error("Error resetting system:", err);
      return { success: false, error: "Connection error" };
    }
  }, [loadStatus]);

  /**
   * Clear the last result
   */
  const clearResult = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  return {
    // State
    isProcessing,
    error,
    lastResult,
    crateStatus,
    
    // Computed
    assignedCrate: lastResult?.success ? lastResult.data?.assignedCrate : null,
    
    // Actions
    processQRCode,
    processBasket,
    loadStatus,
    resetSystem,
    clearResult,
  };
}
