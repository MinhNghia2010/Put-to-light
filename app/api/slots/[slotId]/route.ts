import { NextRequest, NextResponse } from "next/server";
import type {
  Slot,
  UpdateSlotQuantityRequest,
  UpdateSlotQuantityResponse,
  SlotItem,
  ScanHistoryEntry
} from "@/types";

import { getStore } from "@/lib/backend-store";

/**
 * GET /api/slots/[slotId]
 * Lấy thông tin chi tiết một máng
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    const slot = getStore().slots.get(slotId);

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy máng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      slot,
    });
  } catch (error) {
    console.error("Error getting slot:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy thông tin máng" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/slots/[slotId]
 * Cập nhật số lượng sản phẩm trong máng
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    const body: UpdateSlotQuantityRequest = await request.json();
    const { sku, quantity, action } = body;

    const slot = getStore().slots.get(slotId);

    if (!slot) {
      return NextResponse.json({
        success: false,
        slot: null,
        remainingInBasket: 0,
        error: "Không tìm thấy máng",
      } as UpdateSlotQuantityResponse, { status: 404 });
    }

    // Kiểm tra đèn có đang sáng không
    if (slot.lightStatus !== "on") {
      return NextResponse.json({
        success: false,
        slot,
        remainingInBasket: 0,
        error: "Máng này không đang hoạt động",
      } as UpdateSlotQuantityResponse, { status: 400 });
    }

    let historyAction: "put" | "update" | "remove" = "put";

    switch (action) {
      case "add": {
        // Thêm sản phẩm vào máng
        const newItem: SlotItem = {
          sku,
          name: slot.currentItem?.name || sku,
          quantity,
          addedAt: new Date().toISOString(),
        };
        slot.itemsInSlot.push(newItem);
        slot.filled += quantity;
        historyAction = "put";

        // Cập nhật currentItem
        if (slot.currentItem) {
          slot.currentItem.confirmedQuantity += quantity;

          // Nếu đã đủ số lượng, tắt đèn
          if (slot.currentItem.confirmedQuantity >= slot.currentItem.requiredQuantity) {
            slot.lightStatus = "off";
            slot.currentItem = null;
          }
        }
        break;
      }

      case "update": {
        // Cập nhật số lượng sản phẩm cuối cùng
        const lastItem = slot.itemsInSlot.findLast((item) => item.sku === sku);
        if (lastItem) {
          const diff = quantity - lastItem.quantity;
          slot.filled += diff;
          lastItem.quantity = quantity;
          historyAction = "update";

          // Cập nhật confirmedQuantity nếu có
          if (slot.currentItem && slot.currentItem.sku === sku) {
            slot.currentItem.confirmedQuantity += diff;
          }
        }
        break;
      }

      case "remove": {
        // Xóa sản phẩm khỏi máng
        const itemIndex = slot.itemsInSlot.findLastIndex((item) => item.sku === sku);
        if (itemIndex !== -1) {
          const removedItem = slot.itemsInSlot[itemIndex];
          slot.filled -= removedItem.quantity;
          slot.itemsInSlot.splice(itemIndex, 1);
          historyAction = "remove";

          // Cập nhật confirmedQuantity nếu có
          if (slot.currentItem && slot.currentItem.sku === sku) {
            slot.currentItem.confirmedQuantity -= removedItem.quantity;
          }
        }
        break;
      }
    }

    // Ghi lịch sử
    const historyEntry: ScanHistoryEntry = {
      id: `HIST-${Date.now()}`,
      basketId: "CURRENT", // Sẽ lấy từ context thực tế
      sku,
      itemName: slot.currentItem?.name || sku,
      slotId,
      quantity,
      action: historyAction,
      timestamp: new Date().toISOString(),
      operator: "SYSTEM", // Sẽ lấy từ auth context
    };
    getStore().scanHistory.push(historyEntry);

    console.log(`Máng ${slotId}: ${action} ${quantity} x ${sku}`);

    return NextResponse.json({
      success: true,
      slot,
      remainingInBasket: 0, // Sẽ tính từ basket context
    } as UpdateSlotQuantityResponse);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({
      success: false,
      slot: null,
      remainingInBasket: 0,
      error: "Lỗi khi cập nhật máng",
    } as UpdateSlotQuantityResponse, { status: 500 });
  }
}

/**
 * POST /api/slots/[slotId]
 * Xác nhận hoàn thành phân phối cho máng
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    const body = await request.json();
    const { sku, confirmedQuantity } = body;

    const slot = getStore().slots.get(slotId);

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy máng" },
        { status: 404 }
      );
    }

    // Xác nhận và tắt đèn
    slot.lightStatus = "off";

    if (slot.currentItem && slot.currentItem.sku === sku) {
      slot.currentItem.confirmedQuantity = confirmedQuantity;
      slot.currentItem = null;
    }

    console.log(`Máng ${slotId}: Xác nhận ${confirmedQuantity} x ${sku}`);

    return NextResponse.json({
      success: true,
      message: "Đã xác nhận hoàn thành",
      slot,
    });
  } catch (error) {
    console.error("Error confirming slot:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xác nhận máng" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/slots/[slotId]
 * Reset một máng cụ thể
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    const slot = getStore().slots.get(slotId);

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy máng" },
        { status: 404 }
      );
    }

    // Reset máng
    slot.lightStatus = "off";
    slot.lightColor = "#FF6B35";
    slot.currentItem = null;
    slot.orderId = null;
    slot.itemsInSlot = [];
    slot.filled = 0;

    return NextResponse.json({
      success: true,
      message: `Đã reset máng ${slotId}`,
      slot,
    });
  } catch (error) {
    console.error("Error resetting slot:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi reset máng" },
      { status: 500 }
    );
  }
}
