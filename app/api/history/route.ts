import { NextRequest, NextResponse } from "next/server";
import type { ScanHistoryEntry } from "@/types";

// Mock data - trong thực tế sẽ lưu vào database
const scanHistory: ScanHistoryEntry[] = [
  // Mock data cho demo
  {
    id: "HIST-001",
    basketId: "BASKET-001",
    sku: "PRO-AUDIO-X7",
    itemName: "Wireless Noise-Canceling Headphones",
    slotId: "A-01",
    quantity: 2,
    action: "put",
    timestamp: "2026-01-09T14:30:00.000Z",
    operator: "OPERATOR-1",
  },
  {
    id: "HIST-002",
    basketId: "BASKET-001",
    sku: "PRO-AUDIO-X7",
    itemName: "Wireless Noise-Canceling Headphones",
    slotId: "A-03",
    quantity: 3,
    action: "put",
    timestamp: "2026-01-09T14:31:15.000Z",
    operator: "OPERATOR-1",
  },
  {
    id: "HIST-003",
    basketId: "BASKET-001",
    sku: "WATCH-SM-001",
    itemName: "Smart Watch Series 5",
    slotId: "A-02",
    quantity: 1,
    action: "put",
    timestamp: "2026-01-09T14:32:30.000Z",
    operator: "OPERATOR-1",
  },
];

/**
 * GET /api/history
 * Lấy lịch sử quét
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const basketId = searchParams.get("basketId");
    const slotId = searchParams.get("slotId");
    const sku = searchParams.get("sku");
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let filtered = [...scanHistory];

    // Apply filters
    if (basketId) {
      filtered = filtered.filter((h) => h.basketId === basketId);
    }
    if (slotId) {
      filtered = filtered.filter((h) => h.slotId === slotId);
    }
    if (sku) {
      filtered = filtered.filter((h) => h.sku === sku);
    }
    if (action) {
      filtered = filtered.filter((h) => h.action === action);
    }

    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Pagination
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      history: paginated,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error getting history:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy lịch sử" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history
 * Thêm mới một entry vào lịch sử
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { basketId, sku, itemName, slotId, quantity, action, operator } = body;

    if (!basketId || !sku || !slotId || quantity === undefined || !action) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const entry: ScanHistoryEntry = {
      id: `HIST-${Date.now()}`,
      basketId,
      sku,
      itemName: itemName || sku,
      slotId,
      quantity,
      action,
      timestamp: new Date().toISOString(),
      operator: operator || "SYSTEM",
    };

    scanHistory.push(entry);

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Error adding history:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi thêm lịch sử" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history
 * Xóa lịch sử (cho admin)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const basketId = searchParams.get("basketId");

    if (basketId) {
      // Xóa lịch sử của một basket cụ thể
      const indexesToRemove = scanHistory
        .map((h, i) => (h.basketId === basketId ? i : -1))
        .filter((i) => i !== -1)
        .reverse();
      
      indexesToRemove.forEach((i) => scanHistory.splice(i, 1));
      
      return NextResponse.json({
        success: true,
        message: `Đã xóa lịch sử của basket ${basketId}`,
      });
    } else {
      // Xóa toàn bộ lịch sử
      scanHistory.length = 0;
      return NextResponse.json({
        success: true,
        message: "Đã xóa toàn bộ lịch sử",
      });
    }
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa lịch sử" },
      { status: 500 }
    );
  }
}

// Export để các module khác sử dụng
export function addHistoryEntry(entry: Omit<ScanHistoryEntry, "id" | "timestamp">) {
  const newEntry: ScanHistoryEntry = {
    ...entry,
    id: `HIST-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  scanHistory.push(newEntry);
  return newEntry;
}
