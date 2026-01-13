// ==================== WMS Types ====================

// Kịch bản phân chia từ WMS
export interface WMSScenario {
  scenarioId: string;
  createdAt: string;
  slots: SlotAssignment[];
  orders: Order[];
}

// Đơn hàng
export interface Order {
  orderId: string;
  customerName: string;
  slotId: string; // Máng được gán cho đơn hàng này
  items: OrderItem[];
  status: "pending" | "in-progress" | "completed";
}

// Sản phẩm trong đơn hàng
export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  pickedQuantity: number;
}

// Gán máng cho đơn hàng
export interface SlotAssignment {
  slotId: string;
  orderId: string;
  lightColor: string; // Màu đèn sáng
}

// ==================== Basket/Crate Types ====================

// Rổ hàng
export interface Basket {
  basketId: string;
  scannedAt: string;
  items: BasketItem[];
  status: "scanning" | "distributing" | "completed";
}

// Sản phẩm trong rổ
export interface BasketItem {
  sku: string;
  name: string;
  category: string;
  totalQuantity: number;
  remainingQuantity: number;
  distributions: ItemDistribution[];
}

// Phân phối sản phẩm đến các máng
export interface ItemDistribution {
  slotId: string;
  orderId: string;
  quantity: number;
  status: "pending" | "completed";
}

// ==================== Slot/Chute Types ====================

// Máng (Slot/Chute)
export interface Slot {
  slotId: string;
  position: string; // Vị trí vật lý: "A-01", "B-02"...
  orderId: string | null;
  lightStatus: "off" | "on" | "blinking";
  lightColor: string;
  currentItem: CurrentSlotItem | null;
  itemsInSlot: SlotItem[];
  capacity: number;
  filled: number;
}

// Sản phẩm hiện tại đang cần đưa vào máng
export interface CurrentSlotItem {
  sku: string;
  name: string;
  requiredQuantity: number;
  confirmedQuantity: number;
}

// Sản phẩm đã có trong máng
export interface SlotItem {
  sku: string;
  name: string;
  quantity: number;
  addedAt: string;
}

// ==================== API Request/Response Types ====================

// Request quét mã rổ
export interface ScanBasketRequest {
  basketId: string;
  stationId: string;
}

// Response từ WMS về thông tin rổ
export interface ScanBasketResponse {
  success: boolean;
  basket: Basket | null;
  distributions: SlotDistributionInfo[];
  error?: string;
}

// Thông tin phân phối cho từng máng
export interface SlotDistributionInfo {
  slotId: string;
  orderId: string;
  items: {
    sku: string;
    name: string;
    quantity: number;
  }[];
  shouldLight: boolean;
  lightColor: string;
}

// Request cập nhật số lượng máng
export interface UpdateSlotQuantityRequest {
  slotId: string;
  sku: string;
  quantity: number;
  action: "add" | "update" | "remove";
}

// Response cập nhật số lượng
export interface UpdateSlotQuantityResponse {
  success: boolean;
  slot: Slot | null;
  remainingInBasket: number;
  error?: string;
}

// Request xác nhận hoàn thành máng
export interface ConfirmSlotRequest {
  slotId: string;
  sku: string;
  confirmedQuantity: number;
}

// ==================== Station Types ====================

// Trạm làm việc
export interface Station {
  stationId: string;
  name: string;
  slots: Slot[];
  currentBasket: Basket | null;
  currentScenario: WMSScenario | null;
  status: "idle" | "active" | "paused";
}

// ==================== Event Types (cho real-time updates) ====================

export type SlotEventType =
  | "LIGHT_ON"
  | "LIGHT_OFF"
  | "QUANTITY_UPDATE"
  | "ITEM_CONFIRMED"
  | "SLOT_COMPLETED";

export interface SlotEvent {
  type: SlotEventType;
  slotId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// ==================== Scan History Types ====================

export interface ScanHistoryEntry {
  id: string;
  basketId: string;
  sku: string;
  itemName: string;
  slotId: string;
  quantity: number;
  action: "put" | "update" | "remove";
  timestamp: string;
  operator: string;
}

// ==================== Put-to-Light Types ====================

// QR Code payload structure (what gets scanned)
export interface QRBasketPayload {
  basketId: string;
  items: QRBasketItem[];
}

export interface QRBasketItem {
  sku: string;
  qty: number;
}

// Product in the system registry
export interface Product {
  sku: string;
  name: string;
  category: string;
  weight?: number;  // grams
  volume?: number;  // cubic cm
  active: boolean;
}

// Crate (destination bin in the rack)
export interface Crate {
  crateId: string;
  position: string;           // Physical position: "RACK-A-01"
  maxCapacity: number;        // Maximum items/volume
  currentLoad: number;        // Current items/volume
  status: "available" | "assigned" | "full" | "maintenance";
  assignedBasketId: string | null;
  lightStatus: "off" | "on" | "blinking";
  lightColor: string;
  items: QRBasketItem[]; // List of items currently in the crate
  lastUpdated: string;
}

// Processed basket record (for idempotency)
export interface ProcessedBasket {
  basketId: string;
  processedAt: string;
  assignedCrateId: string;
  totalItems: number;
  status: "assigned" | "completed" | "cancelled";
}

// Put-to-Light API Request/Response
export interface PutToLightRequest {
  basketId: string;
  items: QRBasketItem[];
}

export interface PutToLightResponse {
  success: boolean;
  data?: {
    basketId: string;
    assignedCrate: {
      crateId: string;
      position: string;
      lightColor: string;
    };
    totalItems: number;
    crateCapacityAfter: {
      current: number;
      max: number;
      percentFull: number;
    };
  };
  error?: {
    code: PutToLightErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type PutToLightErrorCode =
  | "INVALID_QR_DATA"
  | "MISSING_BASKET_ID"
  | "MISSING_ITEMS"
  | "UNKNOWN_PRODUCT"
  | "ALREADY_PROCESSED"
  | "NO_CAPACITY"
  | "SYSTEM_ERROR";