import { NextRequest, NextResponse } from "next/server";
import type {
  Slot,
  SlotItem,
  CurrentSlotItem,
  UpdateSlotQuantityResponse
} from "@/types";

import { getStore } from "@/lib/backend-store";

/**
 * GET /api/slots
 * Lấy danh sách tất cả các máng
 */
export async function GET() {
  try {
    const allSlots = Array.from(getStore().slots.values());
    return NextResponse.json({
      success: true,
      slots: allSlots,
    });
  } catch (error) {
    console.error("Error getting slots:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy danh sách máng" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/slots
 * Cập nhật trạng thái đèn cho nhiều máng (khi quét rổ mới)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    // Tắt tất cả đèn trước
    getStore().slots.forEach((slot) => {
      slot.lightStatus = "off";
      slot.currentItem = null;
    });

    // Bật đèn cho các máng được chỉ định
    updates.forEach((update: {
      slotId: string;
      orderId: string;
      lightColor?: string;
      currentItem?: CurrentSlotItem;
    }) => {
      const slot = getStore().slots.get(update.slotId);
      if (slot) {
        slot.lightStatus = "on";
        slot.orderId = update.orderId;
        if (update.lightColor) slot.lightColor = update.lightColor;
        if (update.currentItem) slot.currentItem = update.currentItem;
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${updates.length} máng`,
      slots: Array.from(getStore().slots.values()),
    });
  } catch (error) {
    console.error("Error updating slots:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi cập nhật máng" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/slots
 * Reset tất cả các máng
 */
export async function PUT() {
  try {
    getStore().slots.forEach((slot) => {
      slot.lightStatus = "off";
      slot.lightColor = "#FF6B35";
      slot.currentItem = null;
      slot.orderId = null;
    });

    return NextResponse.json({
      success: true,
      message: "Đã reset tất cả máng",
    });
  } catch (error) {
    console.error("Error resetting slots:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi reset máng" },
      { status: 500 }
    );
  }
}

// Export helper functions
export function getSlot(slotId: string): Slot | undefined {
  return getStore().slots.get(slotId);
}

export function updateSlotLight(
  slotId: string,
  status: "off" | "on" | "blinking",
  color?: string
): boolean {
  const slot = getStore().slots.get(slotId);
  if (!slot) return false;

  slot.lightStatus = status;
  if (color) slot.lightColor = color;
  return true;
}

export function addItemToSlot(
  slotId: string,
  item: SlotItem
): boolean {
  const slot = getStore().slots.get(slotId);
  if (!slot) return false;

  slot.itemsInSlot.push(item);
  slot.filled += item.quantity;
  return true;
}
