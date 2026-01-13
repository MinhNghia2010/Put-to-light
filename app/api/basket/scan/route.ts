import { NextRequest, NextResponse } from "next/server";
import type {
  Basket,
  BasketItem,
  ScanBasketResponse,
  SlotDistributionInfo,
  ItemDistribution
} from "@/types";

import { getStore } from "@/lib/backend-store";

// Mock WMS API response - thay thế bằng gọi API thực
async function fetchBasketFromWMS(basketId: string): Promise<BasketItem[]> {
  // Trong thực tế:
  // const response = await fetch(`${process.env.WMS_API_URL}/baskets/${basketId}`);
  // return await response.json();

  // Mock data cho demo
  const mockBasketItems: Record<string, BasketItem[]> = {
    "BASKET-001": [
      {
        sku: "PRO-AUDIO-X7",
        name: "Wireless Noise-Canceling Headphones",
        category: "Electronics > Audio",
        totalQuantity: 5,
        remainingQuantity: 5,
        distributions: [
          { slotId: "A-01", orderId: "ORD-001", quantity: 2, status: "pending" },
          { slotId: "A-03", orderId: "ORD-003", quantity: 3, status: "pending" },
        ],
      },
      {
        sku: "WATCH-SM-001",
        name: "Smart Watch Series 5",
        category: "Electronics > Wearables",
        totalQuantity: 3,
        remainingQuantity: 3,
        distributions: [
          { slotId: "A-02", orderId: "ORD-002", quantity: 1, status: "pending" },
          { slotId: "B-01", orderId: "ORD-004", quantity: 2, status: "pending" },
        ],
      },
    ],
    "BASKET-002": [
      {
        sku: "KB-MECH-RGB",
        name: "Mechanical Keyboard RGB",
        category: "Electronics > Gaming",
        totalQuantity: 4,
        remainingQuantity: 4,
        distributions: [
          { slotId: "A-01", orderId: "ORD-001", quantity: 1, status: "pending" },
          { slotId: "A-04", orderId: "ORD-005", quantity: 3, status: "pending" },
        ],
      },
    ],
  };

  return mockBasketItems[basketId] || [];
}

// Tính toán phân phối cho các máng
function calculateSlotDistributions(items: BasketItem[]): SlotDistributionInfo[] {
  const slotMap = new Map<string, SlotDistributionInfo>();

  items.forEach((item) => {
    item.distributions.forEach((dist) => {
      if (dist.status === "pending") {
        if (!slotMap.has(dist.slotId)) {
          slotMap.set(dist.slotId, {
            slotId: dist.slotId,
            orderId: dist.orderId,
            items: [],
            shouldLight: true,
            lightColor: "#FF6B35", // Màu cam mặc định
          });
        }

        const slotInfo = slotMap.get(dist.slotId)!;
        slotInfo.items.push({
          sku: item.sku,
          name: item.name,
          quantity: dist.quantity,
        });
      }
    });
  });

  return Array.from(slotMap.values());
}

/**
 * POST /api/basket/scan
 * Quét mã rổ và lấy thông tin từ WMS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { basketId, stationId } = body;

    if (!basketId) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã rổ" },
        { status: 400 }
      );
    }

    // Nếu đang có rổ trước đó, đánh dấu là hoàn thành
    const store = getStore();
    if (store.currentBasket && store.currentBasket.basketId !== basketId) {
      store.currentBasket.status = "completed";
      store.basketHistory.push(store.currentBasket);
      console.log(`Rổ ${store.currentBasket.basketId} đã được tính là chia hết`);
    }

    // Lấy thông tin rổ từ WMS
    const items = await fetchBasketFromWMS(basketId);

    if (items.length === 0) {
      return NextResponse.json({
        success: false,
        basket: null,
        distributions: [],
        error: "Không tìm thấy thông tin rổ hoặc rổ trống",
      } as ScanBasketResponse);
    }

    // Tạo rổ mới
    store.currentBasket = {
      basketId,
      scannedAt: new Date().toISOString(),
      items,
      status: "distributing",
    };

    // Tính toán phân phối
    const distributions = calculateSlotDistributions(items);

    console.log(`Đã quét rổ ${basketId} tại trạm ${stationId}`);
    console.log(`Cần phân phối đến ${distributions.length} máng`);

    return NextResponse.json({
      success: true,
      basket: store.currentBasket,
      distributions,
    } as ScanBasketResponse);
  } catch (error) {
    console.error("Error scanning basket:", error);
    return NextResponse.json(
      { success: false, error: `Lỗi khi quét mã rổ: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/basket/scan
 * Lấy thông tin rổ hiện tại
 */
export async function GET() {
  try {
    const store = getStore();
    if (!store.currentBasket) {
      return NextResponse.json(
        { success: false, error: "Chưa có rổ nào được quét" },
        { status: 404 }
      );
    }

    const distributions = calculateSlotDistributions(store.currentBasket.items);

    return NextResponse.json({
      success: true,
      basket: store.currentBasket,
      distributions,
    } as ScanBasketResponse);
  } catch (error) {
    console.error("Error getting current basket:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy thông tin rổ" },
      { status: 500 }
    );
  }
}

// Export để các route khác sử dụng
export function getCurrentBasket(): Basket | null {
  return getStore().currentBasket;
}

export function updateBasketItemDistribution(
  sku: string,
  slotId: string,
  quantity: number
): boolean {
  const store = getStore();
  if (!store.currentBasket) return false;

  const item = store.currentBasket.items.find((i) => i.sku === sku);
  if (!item) return false;

  const distribution = item.distributions.find((d) => d.slotId === slotId);
  if (!distribution) return false;

  // Cập nhật số lượng còn lại
  const quantityChange = quantity - (distribution.quantity - item.remainingQuantity);
  item.remainingQuantity -= quantityChange;

  if (item.remainingQuantity <= 0) {
    distribution.status = "completed";
  }

  return true;
}
