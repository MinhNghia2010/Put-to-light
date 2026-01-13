import { NextRequest, NextResponse } from "next/server";
import type { WMSScenario, SlotAssignment, Order } from "@/types";

// Mock data - trong thực tế sẽ lưu vào database
let currentScenario: WMSScenario | null = null;

/**
 * GET /api/wms/scenario
 * Lấy kịch bản hiện tại từ WMS
 */
export async function GET() {
  try {
    // Trong thực tế: gọi API WMS để lấy kịch bản
    // const response = await fetch(process.env.WMS_API_URL + '/scenario');
    // const scenario = await response.json();

    if (!currentScenario) {
      return NextResponse.json(
        { success: false, error: "Chưa có kịch bản nào được tải" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scenario: currentScenario,
    });
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy kịch bản từ WMS" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wms/scenario
 * Nhận kịch bản mới từ WMS (webhook)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate kịch bản
    if (!body.scenarioId || !body.slots || !body.orders) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu kịch bản không hợp lệ" },
        { status: 400 }
      );
    }

    // Lưu kịch bản mới
    currentScenario = {
      scenarioId: body.scenarioId,
      createdAt: new Date().toISOString(),
      slots: body.slots as SlotAssignment[],
      orders: body.orders as Order[],
    };

    console.log(`Đã nhận kịch bản mới: ${currentScenario.scenarioId}`);

    return NextResponse.json({
      success: true,
      message: "Đã nhận kịch bản thành công",
      scenarioId: currentScenario.scenarioId,
    });
  } catch (error) {
    console.error("Error receiving scenario:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi nhận kịch bản" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wms/scenario
 * Xóa kịch bản hiện tại (reset)
 */
export async function DELETE() {
  try {
    currentScenario = null;
    return NextResponse.json({
      success: true,
      message: "Đã xóa kịch bản",
    });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa kịch bản" },
      { status: 500 }
    );
  }
}

// Export để các route khác sử dụng
export function getScenario(): WMSScenario | null {
  return currentScenario;
}
