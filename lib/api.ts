import type {
  Basket,
  Slot,
  WMSScenario,
  ScanBasketResponse,
  SlotDistributionInfo,
  UpdateSlotQuantityRequest,
  UpdateSlotQuantityResponse,
  ScanHistoryEntry,
  PutToLightResponse,
  QRBasketPayload,
  Crate
} from "@/types";

const API_BASE = "/api";

// ==================== WMS API ====================

/**
 * Lấy kịch bản hiện tại từ WMS
 */
export async function getScenario(): Promise<{ success: boolean; scenario?: WMSScenario; error?: string }> {
  const response = await fetch(`${API_BASE}/wms/scenario`);
  return response.json();
}

/**
 * Gửi kịch bản mới từ WMS (webhook)
 */
export async function postScenario(scenario: Partial<WMSScenario>): Promise<{ success: boolean; scenarioId?: string; error?: string }> {
  const response = await fetch(`${API_BASE}/wms/scenario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario),
  });
  return response.json();
}

// ==================== Basket API ====================

/**
 * Quét mã rổ và lấy thông tin từ WMS
 */
export async function scanBasket(basketId: string, stationId: string = "STATION-01"): Promise<ScanBasketResponse> {
  const response = await fetch(`${API_BASE}/basket/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ basketId, stationId }),
  });
  return response.json();
}

/**
 * Lấy thông tin rổ hiện tại
 */
export async function getCurrentBasket(): Promise<ScanBasketResponse> {
  const response = await fetch(`${API_BASE}/basket/scan`);
  return response.json();
}

// ==================== Slots API ====================

/**
 * Lấy danh sách tất cả máng
 */
export async function getAllSlots(): Promise<{ success: boolean; slots: Slot[]; error?: string }> {
  const response = await fetch(`${API_BASE}/slots`);
  return response.json();
}

/**
 * Lấy thông tin một máng cụ thể
 */
export async function getSlot(slotId: string): Promise<{ success: boolean; slot?: Slot; error?: string }> {
  const response = await fetch(`${API_BASE}/slots/${slotId}`);
  return response.json();
}

/**
 * Cập nhật trạng thái đèn cho nhiều máng
 */
export async function updateSlotsLight(
  updates: Array<{
    slotId: string;
    orderId: string;
    lightColor?: string;
    currentItem?: { sku: string; name: string; requiredQuantity: number; confirmedQuantity: number };
  }>
): Promise<{ success: boolean; slots?: Slot[]; error?: string }> {
  const response = await fetch(`${API_BASE}/slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  return response.json();
}

/**
 * Cập nhật số lượng sản phẩm trong máng
 */
export async function updateSlotQuantity(
  slotId: string,
  data: UpdateSlotQuantityRequest
): Promise<UpdateSlotQuantityResponse> {
  const response = await fetch(`${API_BASE}/slots/${slotId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Xác nhận hoàn thành phân phối cho máng
 */
export async function confirmSlot(
  slotId: string,
  sku: string,
  confirmedQuantity: number
): Promise<{ success: boolean; slot?: Slot; error?: string }> {
  const response = await fetch(`${API_BASE}/slots/${slotId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku, confirmedQuantity }),
  });
  return response.json();
}

/**
 * Reset một máng
 */
export async function resetSlot(slotId: string): Promise<{ success: boolean; slot?: Slot; error?: string }> {
  const response = await fetch(`${API_BASE}/slots/${slotId}`, {
    method: "DELETE",
  });
  return response.json();
}

/**
 * Reset tất cả máng
 */
export async function resetAllSlots(): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_BASE}/slots`, {
    method: "PUT",
  });
  return response.json();
}

// ==================== History API ====================

/**
 * Lấy lịch sử quét
 */
export async function getHistory(params?: {
  basketId?: string;
  slotId?: string;
  sku?: string;
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  history?: ScanHistoryEntry[];
  pagination?: { total: number; limit: number; offset: number; hasMore: boolean };
  error?: string
}> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE}/history?${searchParams.toString()}`);
  return response.json();
}

/**
 * Thêm entry vào lịch sử
 */
export async function addHistory(entry: {
  basketId: string;
  sku: string;
  itemName?: string;
  slotId: string;
  quantity: number;
  action: "put" | "update" | "remove";
  operator?: string;
}): Promise<{ success: boolean; entry?: ScanHistoryEntry; error?: string }> {
  const response = await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return response.json();
}

// ==================== Put-to-Light API ====================

/**
 * Process a basket through Put-to-Light workflow
 * This is the main endpoint for scanning a QR code and assigning to a crate
 */
export async function putToLight(payload: QRBasketPayload): Promise<PutToLightResponse> {
  const response = await fetch(`${API_BASE}/put-to-light`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

/**
 * Get Put-to-Light system status (all crates)
 */
export async function getPutToLightStatus(): Promise<{
  success: boolean;
  summary?: {
    totalCrates: number;
    available: number;
    assigned: number;
    full: number;
    maintenance: number;
    totalCapacity: number;
    totalLoad: number;
    processedBasketsCount: number;
  };
  crates?: Array<Crate & {
    availableCapacity: number;
  }>;
  recentBaskets?: Array<{
    basketId: string;
    processedAt: string;
    assignedCrateId: string;
    totalItems: number;
    status: string;
  }>;
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/put-to-light`);
  return response.json();
}

/**
 * Reset Put-to-Light system (clear all crates and processed baskets)
 */
export async function resetPutToLight(): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch(`${API_BASE}/put-to-light`, {
    method: "DELETE",
  });
  return response.json();
}

/**
 * Parse QR code data and call Put-to-Light API
 */
export async function processQRScan(qrData: string): Promise<PutToLightResponse> {
  try {
    // Try to parse QR data as JSON
    const payload = JSON.parse(qrData) as QRBasketPayload;
    return await putToLight(payload);
  } catch (parseError) {
    // If it's not valid JSON, return an error response
    return {
      success: false,
      error: {
        code: "INVALID_QR_DATA",
        message: "QR code does not contain valid JSON data",
        details: { rawData: qrData.substring(0, 100) }
      }
    };
  }
}

// ==================== Helper Functions ====================

/**
 * Xử lý luồng quét rổ hoàn chỉnh
 * 1. Quét mã rổ
 * 2. Nhận danh sách phân phối
 * 3. Bật đèn các máng tương ứng
 */
export async function processBasketScan(basketId: string, stationId: string = "STATION-01") {
  // 1. Quét rổ và lấy thông tin
  const scanResult = await scanBasket(basketId, stationId);

  if (!scanResult.success || !scanResult.basket) {
    return { success: false, error: scanResult.error || "Không thể quét rổ" };
  }

  // 2. Chuẩn bị danh sách cập nhật đèn
  const slotUpdates = scanResult.distributions.map((dist: SlotDistributionInfo) => ({
    slotId: dist.slotId,
    orderId: dist.orderId,
    lightColor: dist.lightColor,
    currentItem: dist.items.length > 0 ? {
      sku: dist.items[0].sku,
      name: dist.items[0].name,
      requiredQuantity: dist.items.reduce((sum, item) => sum + item.quantity, 0),
      confirmedQuantity: 0,
    } : undefined,
  }));

  // 3. Bật đèn các máng
  const lightResult = await updateSlotsLight(slotUpdates);

  return {
    success: true,
    basket: scanResult.basket,
    distributions: scanResult.distributions,
    slots: lightResult.slots,
  };
}

/**
 * Xử lý thêm sản phẩm vào máng
 */
export async function addItemToSlot(
  slotId: string,
  sku: string,
  quantity: number,
  basketId: string
) {
  // 1. Cập nhật số lượng trong máng
  const updateResult = await updateSlotQuantity(slotId, {
    slotId,
    sku,
    quantity,
    action: "add",
  });

  if (!updateResult.success) {
    return updateResult;
  }

  // 2. Ghi lịch sử
  await addHistory({
    basketId,
    sku,
    slotId,
    quantity,
    action: "put",
  });

  return updateResult;
}
