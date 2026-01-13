"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import type { 
  Basket, 
  Slot, 
  WMSScenario, 
  SlotDistributionInfo,
  ScanHistoryEntry 
} from "@/types";
import * as api from "./api";

// ==================== State Types ====================

interface StationState {
  // Station info
  stationId: string;
  stationName: string;
  status: "idle" | "active" | "paused";
  
  // Current data
  currentScenario: WMSScenario | null;
  currentBasket: Basket | null;
  distributions: SlotDistributionInfo[];
  slots: Slot[];
  
  // UI state
  selectedSlotId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // History (recent entries)
  recentHistory: ScanHistoryEntry[];
}

type StationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SCENARIO"; payload: WMSScenario | null }
  | { type: "SET_BASKET"; payload: { basket: Basket | null; distributions: SlotDistributionInfo[] } }
  | { type: "SET_SLOTS"; payload: Slot[] }
  | { type: "UPDATE_SLOT"; payload: Slot }
  | { type: "SELECT_SLOT"; payload: string | null }
  | { type: "ADD_HISTORY"; payload: ScanHistoryEntry }
  | { type: "SET_STATUS"; payload: "idle" | "active" | "paused" }
  | { type: "RESET" };

// ==================== Initial State ====================

const initialState: StationState = {
  stationId: "STATION-01",
  stationName: "Trạm Put-to-Light 01",
  status: "idle",
  currentScenario: null,
  currentBasket: null,
  distributions: [],
  slots: [],
  selectedSlotId: null,
  isLoading: false,
  error: null,
  recentHistory: [],
};

// ==================== Reducer ====================

function stationReducer(state: StationState, action: StationAction): StationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    
    case "SET_SCENARIO":
      return { 
        ...state, 
        currentScenario: action.payload,
        status: action.payload ? "active" : "idle",
      };
    
    case "SET_BASKET":
      return { 
        ...state, 
        currentBasket: action.payload.basket,
        distributions: action.payload.distributions,
        status: action.payload.basket ? "active" : state.status,
      };
    
    case "SET_SLOTS":
      return { ...state, slots: action.payload };
    
    case "UPDATE_SLOT":
      return {
        ...state,
        slots: state.slots.map((slot) =>
          slot.slotId === action.payload.slotId ? action.payload : slot
        ),
      };
    
    case "SELECT_SLOT":
      return { ...state, selectedSlotId: action.payload };
    
    case "ADD_HISTORY":
      return {
        ...state,
        recentHistory: [action.payload, ...state.recentHistory].slice(0, 50),
      };
    
    case "SET_STATUS":
      return { ...state, status: action.payload };
    
    case "RESET":
      return {
        ...initialState,
        stationId: state.stationId,
        stationName: state.stationName,
      };
    
    default:
      return state;
  }
}

// ==================== Context ====================

interface StationContextValue {
  state: StationState;
  
  // Actions
  loadScenario: () => Promise<void>;
  scanBasket: (basketId: string) => Promise<boolean>;
  loadSlots: () => Promise<void>;
  selectSlot: (slotId: string | null) => void;
  addItemToSlot: (slotId: string, sku: string, quantity: number) => Promise<boolean>;
  updateSlotQuantity: (slotId: string, sku: string, quantity: number) => Promise<boolean>;
  confirmSlot: (slotId: string, sku: string, quantity: number) => Promise<boolean>;
  resetStation: () => Promise<void>;
}

const StationContext = createContext<StationContextValue | null>(null);

// ==================== Provider ====================

export function StationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stationReducer, initialState);

  // Load kịch bản từ WMS
  const loadScenario = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await api.getScenario();
      if (result.success && result.scenario) {
        dispatch({ type: "SET_SCENARIO", payload: result.scenario });
      } else {
        dispatch({ type: "SET_ERROR", payload: result.error || "Không có kịch bản" });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Lỗi khi tải kịch bản" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Quét mã rổ
  const scanBasket = useCallback(async (basketId: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    
    try {
      const result = await api.processBasketScan(basketId, state.stationId);
      
      if (result.success && result.basket) {
        dispatch({ 
          type: "SET_BASKET", 
          payload: { 
            basket: result.basket, 
            distributions: result.distributions || [] 
          } 
        });
        
        if (result.slots) {
          dispatch({ type: "SET_SLOTS", payload: result.slots });
        }
        
        return true;
      } else {
        dispatch({ type: "SET_ERROR", payload: result.error || "Không thể quét rổ" });
        return false;
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Lỗi khi quét rổ" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.stationId]);

  // Load danh sách máng
  const loadSlots = useCallback(async () => {
    try {
      const result = await api.getAllSlots();
      if (result.success && result.slots) {
        dispatch({ type: "SET_SLOTS", payload: result.slots });
      }
    } catch (error) {
      console.error("Error loading slots:", error);
    }
  }, []);

  // Chọn máng
  const selectSlot = useCallback((slotId: string | null) => {
    dispatch({ type: "SELECT_SLOT", payload: slotId });
  }, []);

  // Thêm sản phẩm vào máng
  const addItemToSlot = useCallback(async (
    slotId: string,
    sku: string,
    quantity: number
  ): Promise<boolean> => {
    if (!state.currentBasket) return false;
    
    try {
      const result = await api.addItemToSlot(
        slotId,
        sku,
        quantity,
        state.currentBasket.basketId
      );
      
      if (result.success && result.slot) {
        dispatch({ type: "UPDATE_SLOT", payload: result.slot });
        
        // Add to history
        const historyEntry: ScanHistoryEntry = {
          id: `HIST-${Date.now()}`,
          basketId: state.currentBasket.basketId,
          sku,
          itemName: result.slot.currentItem?.name || sku,
          slotId,
          quantity,
          action: "put",
          timestamp: new Date().toISOString(),
          operator: "OPERATOR",
        };
        dispatch({ type: "ADD_HISTORY", payload: historyEntry });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding item to slot:", error);
      return false;
    }
  }, [state.currentBasket]);

  // Cập nhật số lượng trong máng
  const updateSlotQuantity = useCallback(async (
    slotId: string,
    sku: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      const result = await api.updateSlotQuantity(slotId, {
        slotId,
        sku,
        quantity,
        action: "update",
      });
      
      if (result.success && result.slot) {
        dispatch({ type: "UPDATE_SLOT", payload: result.slot });
        
        // Add to history
        if (state.currentBasket) {
          const historyEntry: ScanHistoryEntry = {
            id: `HIST-${Date.now()}`,
            basketId: state.currentBasket.basketId,
            sku,
            itemName: result.slot.currentItem?.name || sku,
            slotId,
            quantity,
            action: "update",
            timestamp: new Date().toISOString(),
            operator: "OPERATOR",
          };
          dispatch({ type: "ADD_HISTORY", payload: historyEntry });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating slot quantity:", error);
      return false;
    }
  }, [state.currentBasket]);

  // Xác nhận hoàn thành máng
  const confirmSlot = useCallback(async (
    slotId: string,
    sku: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      const result = await api.confirmSlot(slotId, sku, quantity);
      
      if (result.success && result.slot) {
        dispatch({ type: "UPDATE_SLOT", payload: result.slot });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error confirming slot:", error);
      return false;
    }
  }, []);

  // Reset trạm
  const resetStation = useCallback(async () => {
    try {
      await api.resetAllSlots();
      dispatch({ type: "RESET" });
    } catch (error) {
      console.error("Error resetting station:", error);
    }
  }, []);

  const value: StationContextValue = {
    state,
    loadScenario,
    scanBasket,
    loadSlots,
    selectSlot,
    addItemToSlot,
    updateSlotQuantity,
    confirmSlot,
    resetStation,
  };

  return (
    <StationContext.Provider value={value}>
      {children}
    </StationContext.Provider>
  );
}

// ==================== Hook ====================

export function useStation() {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error("useStation must be used within a StationProvider");
  }
  return context;
}
