import { NextRequest, NextResponse } from "next/server";
import type {
  QRBasketPayload,
  QRBasketItem,
  PutToLightResponse,
  PutToLightErrorCode,
  Crate,
} from "@/types";

import {
  getStore,
  getProduct,
  getAllCrates,
  findBestCrate,
  assignBasketToCrate,
  isBasketProcessed,
  getProcessedBasket,
  markBasketProcessed,
  resetAllCrates,
  updateCrateItems
} from "@/lib/backend-store";

// =============================================================================
// PUT-TO-LIGHT API ROUTE
// =============================================================================
// This route handles the core "Put-to-Light" workflow:
// 1. User scans a QR code containing basket information
// 2. System validates the data and checks product registry
// 3. System finds the best available crate with sufficient capacity
// 4. System assigns basket to crate and triggers light
// =============================================================================

/**
 * Helper: Create error response
 */
function errorResponse(
  code: PutToLightErrorCode,
  message: string,
  details?: Record<string, unknown>,
  status: number = 400
): NextResponse<PutToLightResponse> {
  console.error(`[PUT-TO-LIGHT ERROR] ${code}: ${message}`, details);
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

/**
 * Helper: Validate QR payload structure
 */
function validateQRPayload(data: unknown): {
  valid: boolean;
  payload?: QRBasketPayload;
  error?: { code: PutToLightErrorCode; message: string };
} {
  // Check if data is an object
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      error: {
        code: "INVALID_QR_DATA",
        message: "QR data must be a valid JSON object",
      },
    };
  }

  const obj = data as Record<string, unknown>;

  // Check for basketId
  if (!obj.basketId || typeof obj.basketId !== "string" || obj.basketId.trim() === "") {
    return {
      valid: false,
      error: {
        code: "MISSING_BASKET_ID",
        message: "Basket ID is required and must be a non-empty string",
      },
    };
  }

  // Check for items array
  if (!obj.items || !Array.isArray(obj.items)) {
    return {
      valid: false,
      error: {
        code: "MISSING_ITEMS",
        message: "Items array is required",
      },
    };
  }

  if (obj.items.length === 0) {
    return {
      valid: false,
      error: {
        code: "MISSING_ITEMS",
        message: "Items array cannot be empty",
      },
    };
  }

  // Validate each item
  for (let i = 0; i < obj.items.length; i++) {
    const item = obj.items[i] as Record<string, unknown>;

    if (!item.sku || typeof item.sku !== "string") {
      return {
        valid: false,
        error: {
          code: "INVALID_QR_DATA",
          message: `Item at index ${i} is missing a valid SKU`,
        },
      };
    }

    if (typeof item.qty !== "number" || item.qty <= 0 || !Number.isInteger(item.qty)) {
      return {
        valid: false,
        error: {
          code: "INVALID_QR_DATA",
          message: `Item at index ${i} (${item.sku}) has invalid quantity. Must be a positive integer.`,
        },
      };
    }
  }

  return {
    valid: true,
    payload: {
      basketId: obj.basketId as string,
      items: obj.items as QRBasketItem[],
    },
  };
}

/**
 * Helper: Validate all products exist in registry
 */
function validateProducts(items: QRBasketItem[]): {
  valid: boolean;
  unknownSkus?: string[];
} {
  const unknownSkus: string[] = [];

  for (const item of items) {
    const product = getProduct(item.sku);
    if (!product || !product.active) {
      unknownSkus.push(item.sku);
    }
  }

  return {
    valid: unknownSkus.length === 0,
    unknownSkus: unknownSkus.length > 0 ? unknownSkus : undefined,
  };
}

/**
 * Helper: Calculate total items in basket
 */
function calculateTotalItems(items: QRBasketItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

// =============================================================================
// POST /api/put-to-light
// Main endpoint: Process a scanned basket and assign to a crate
// =============================================================================
export async function POST(request: NextRequest): Promise<NextResponse<PutToLightResponse>> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // STEP 1: Parse and validate QR payload
    // =========================================================================
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return errorResponse(
        "INVALID_QR_DATA",
        "Failed to parse JSON. The QR code data is malformed."
      );
    }

    const validation = validateQRPayload(rawBody);
    if (!validation.valid || !validation.payload) {
      return errorResponse(
        validation.error!.code,
        validation.error!.message
      );
    }

    const { basketId, items } = validation.payload;
    console.log(`[PUT-TO-LIGHT] Processing basket: ${basketId} with ${items.length} item types`);

    // =========================================================================
    // STEP 2: Check for duplicate processing (Idempotency)
    // =========================================================================
    if (isBasketProcessed(basketId)) {
      const existingRecord = getProcessedBasket(basketId);
      return errorResponse(
        "ALREADY_PROCESSED",
        `Basket ${basketId} has already been processed`,
        {
          processedAt: existingRecord?.processedAt,
          assignedCrateId: existingRecord?.assignedCrateId,
        },
        409 // Conflict
      );
    }

    // =========================================================================
    // STEP 3: Validate all products exist in registry
    // =========================================================================
    const productValidation = validateProducts(items);
    if (!productValidation.valid) {
      return errorResponse(
        "UNKNOWN_PRODUCT",
        `One or more products are not registered in the system`,
        { unknownSkus: productValidation.unknownSkus }
      );
    }

    // =========================================================================
    // STEP 4: Calculate total items and find suitable crate
    // =========================================================================
    const totalItems = calculateTotalItems(items);
    console.log(`[PUT-TO-LIGHT] Total items in basket: ${totalItems}`);

    const bestCrate = findBestCrate(totalItems);
    if (!bestCrate) {
      // Log capacity status for debugging
      const allCrates = getAllCrates();
      const crateStatus = allCrates.map(c => ({
        id: c.crateId,
        available: c.maxCapacity - c.currentLoad,
        status: c.status,
      }));

      return errorResponse(
        "NO_CAPACITY",
        `No crate has sufficient capacity for ${totalItems} items. All crates are either full or under maintenance.`,
        {
          requiredCapacity: totalItems,
          crateStatus,
        },
        503 // Service Unavailable
      );
    }

    console.log(`[PUT-TO-LIGHT] Best crate found: ${bestCrate.crateId} (available: ${bestCrate.maxCapacity - bestCrate.currentLoad})`);

    // =========================================================================
    // STEP 5: Assign basket to crate (atomic operation)
    // =========================================================================
    const assignment = assignBasketToCrate(bestCrate.crateId, basketId, totalItems, items);
    if (!assignment.success || !assignment.crate) {
      // Race condition - another request took this crate
      // In production, use database transactions with row locking
      return errorResponse(
        "SYSTEM_ERROR",
        assignment.error || "Failed to assign basket to crate",
        {},
        500
      );
    }

    // =========================================================================
    // STEP 6: Mark basket as processed (idempotency record)
    // =========================================================================
    markBasketProcessed(basketId, bestCrate.crateId, totalItems);

    // =========================================================================
    // STEP 7: Return success response with crate details
    // =========================================================================
    const processingTime = Date.now() - startTime;
    console.log(`[PUT-TO-LIGHT] ✅ Basket ${basketId} assigned to crate ${bestCrate.crateId} in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        basketId,
        assignedCrate: {
          crateId: assignment.crate.crateId,
          position: assignment.crate.position,
          lightColor: assignment.crate.lightColor,
        },
        totalItems,
        crateCapacityAfter: {
          current: assignment.crate.currentLoad,
          max: assignment.crate.maxCapacity,
          percentFull: Math.round((assignment.crate.currentLoad / assignment.crate.maxCapacity) * 100),
        },
      },
    });

  } catch (error) {
    console.error("[PUT-TO-LIGHT] Unexpected error:", error);
    return errorResponse(
      "SYSTEM_ERROR",
      "An unexpected error occurred while processing the basket",
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

// =============================================================================
// GET /api/put-to-light
// Get current status of all crates
// =============================================================================
export async function GET(): Promise<NextResponse> {
  try {
    const crates = getAllCrates();
    const processedBaskets = Array.from(getStore().processedBaskets.values());

    // Calculate summary statistics
    const summary = {
      totalCrates: crates.length,
      available: crates.filter(c => c.status === "available").length,
      assigned: crates.filter(c => c.status === "assigned").length,
      full: crates.filter(c => c.status === "full").length,
      maintenance: crates.filter(c => c.status === "maintenance").length,
      totalCapacity: crates.reduce((sum, c) => sum + c.maxCapacity, 0),
      totalLoad: crates.reduce((sum, c) => sum + c.currentLoad, 0),
      processedBasketsCount: processedBaskets.length,
    };

    return NextResponse.json({
      success: true,
      summary,
      crates: crates.map(c => ({
        crateId: c.crateId,
        position: c.position,
        maxCapacity: c.maxCapacity,
        currentLoad: c.currentLoad,
        availableCapacity: c.maxCapacity - c.currentLoad,
        status: c.status,
        lightStatus: c.lightStatus,
        assignedBasketId: c.assignedBasketId,
        items: c.items,
        lightColor: c.lightColor,
        lastUpdated: c.lastUpdated,
      })),
      recentBaskets: processedBaskets.slice(-10), // Last 10 processed
    });

  } catch (error) {
    console.error("[PUT-TO-LIGHT] Error getting status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get crate status" },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/put-to-light
// Reset all crates and processed baskets (admin/testing)
// =============================================================================
export async function DELETE(): Promise<NextResponse> {
  try {
    resetAllCrates();

    console.log("[PUT-TO-LIGHT] All crates reset");

    return NextResponse.json({
      success: true,
      message: "All crates have been reset and processed baskets cleared",
    });

  } catch (error) {
    console.error("[PUT-TO-LIGHT] Error resetting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset crates" },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH /api/put-to-light
// Preview which crate will be assigned (lights up without assigning)
// =============================================================================
import { previewCrateForBasket, turnOffAllCrateLights } from "@/lib/backend-store";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, itemCount } = body;

    if (action === "preview") {
      // Preview mode: light up the target crate without assigning
      if (typeof itemCount !== "number" || itemCount <= 0) {
        return NextResponse.json(
          { success: false, error: "itemCount is required for preview" },
          { status: 400 }
        );
      }

      const crate = previewCrateForBasket(itemCount);

      if (!crate) {
        return NextResponse.json({
          success: false,
          error: "No available crate with sufficient capacity",
        });
      }

      console.log(`[PUT-TO-LIGHT] Preview: Crate ${crate.crateId} lit up for ${itemCount} items`);

      return NextResponse.json({
        success: true,
        previewCrate: {
          crateId: crate.crateId,
          position: crate.position,
          availableCapacity: crate.maxCapacity - crate.currentLoad,
        },
      });
    }

    if (action === "cancel-preview") {
      // Cancel preview: turn off all lights
      turnOffAllCrateLights();
      console.log("[PUT-TO-LIGHT] Preview cancelled, all lights off");

      return NextResponse.json({
        success: true,
        message: "Preview cancelled",
      });
    }

    if (action === "update-crate-items") {
      const { crateId, items } = body;

      if (!crateId || !items || !Array.isArray(items)) {
        return NextResponse.json({ success: false, error: "Invalid crateId or items" }, { status: 400 });
      }

      const result = updateCrateItems(crateId, items);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, crate: result.crate });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'preview' or 'cancel-preview'" },
      { status: 400 }
    );

  } catch (error) {
    console.error("[PUT-TO-LIGHT] Error in PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
