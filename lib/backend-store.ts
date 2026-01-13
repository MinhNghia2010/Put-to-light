
import { Slot, Basket, ScanHistoryEntry, Product, Crate, ProcessedBasket, QRBasketItem } from "@/types";

// =============================================================================
// GLOBAL IN-MEMORY STORE
// =============================================================================
// Note: In production, this would be a database (Postgres, MongoDB, Redis, etc.)
// In a serverless environment (Vercel), these global variables might be reset on cold starts.
// For a local long-running server (npm run dev/start), this works for demo purposes.
// =============================================================================

interface Store {
    // Original slot-based system
    slots: Map<string, Slot>;
    currentBasket: Basket | null;
    basketHistory: Basket[];
    scanHistory: ScanHistoryEntry[];

    // Put-to-Light system
    products: Map<string, Product>;           // Product registry (SKU -> Product)
    crates: Map<string, Crate>;               // Crate inventory (crateId -> Crate)
    processedBaskets: Map<string, ProcessedBasket>; // Idempotency tracking (basketId -> ProcessedBasket)
}

export function getStore(): Store {
    const globalAny = globalThis as unknown as { _store?: Store };

    if (!globalAny._store) {
        globalAny._store = {
            slots: new Map(),
            currentBasket: null,
            basketHistory: [],
            scanHistory: [],
            products: new Map(),
            crates: new Map(),
            processedBaskets: new Map(),
        };

        // Initialize default slots
        const defaultSlots = [
            "A-01", "A-02", "A-03", "A-04",
            "B-01", "B-02", "B-03", "B-04",
            "C-01", "C-02", "C-03", "C-04",
        ];

        defaultSlots.forEach((slotId: string) => {
            globalAny._store!.slots.set(slotId, {
                slotId,
                position: slotId,
                orderId: null,
                lightStatus: "off",
                lightColor: "#FF6B35",
                currentItem: null,
                itemsInSlot: [],
                capacity: 10,
                filled: 0,
            });
        });

        // =================================================================
        // Initialize Product Registry (simulating MongoDB/Redis)
        // =================================================================
        const defaultProducts: Product[] = [
            { sku: "apple-red", name: "Red Apple", category: "Fruits", weight: 200, volume: 150, active: true },
            { sku: "apple-green", name: "Green Apple", category: "Fruits", weight: 180, volume: 140, active: true },
            { sku: "milk-carton", name: "Milk Carton 1L", category: "Dairy", weight: 1050, volume: 1100, active: true },
            { sku: "bread-white", name: "White Bread Loaf", category: "Bakery", weight: 400, volume: 2000, active: true },
            { sku: "eggs-12pack", name: "Eggs 12-Pack", category: "Dairy", weight: 720, volume: 800, active: true },
            { sku: "banana-bunch", name: "Banana Bunch", category: "Fruits", weight: 500, volume: 600, active: true },
            { sku: "cheese-cheddar", name: "Cheddar Cheese 500g", category: "Dairy", weight: 500, volume: 400, active: true },
            { sku: "orange-juice", name: "Orange Juice 2L", category: "Beverages", weight: 2100, volume: 2200, active: true },
            { sku: "PRO-AUDIO-X7", name: "Wireless Noise-Canceling Headphones", category: "Electronics", weight: 300, volume: 500, active: true },
            { sku: "WATCH-SM-001", name: "Smart Watch Series 5", category: "Electronics", weight: 50, volume: 100, active: true },
            { sku: "KB-MECH-RGB", name: "Mechanical Keyboard RGB", category: "Electronics", weight: 800, volume: 1500, active: true },
        ];

        defaultProducts.forEach((product) => {
            globalAny._store!.products.set(product.sku, product);
        });

        // =================================================================
        // Initialize Crates (3x4 grid = 12 crates)
        // =================================================================
        const defaultCrates: Crate[] = [
            // Row 1
            { crateId: "CRATE-01", position: "R1-C1", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-02", position: "R1-C2", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-03", position: "R1-C3", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-04", position: "R1-C4", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            // Row 2
            { crateId: "CRATE-05", position: "R2-C1", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-06", position: "R2-C2", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-07", position: "R2-C3", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-08", position: "R2-C4", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            // Row 3
            { crateId: "CRATE-09", position: "R3-C1", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-10", position: "R3-C2", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-11", position: "R3-C3", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
            { crateId: "CRATE-12", position: "R3-C4", maxCapacity: 20, currentLoad: 0, status: "available", assignedBasketId: null, lightStatus: "off", lightColor: "#00FF00", items: [], lastUpdated: new Date().toISOString() },
        ];

        defaultCrates.forEach((crate) => {
            globalAny._store!.crates.set(crate.crateId, crate);
        });
    }

    return globalAny._store;
}

export function getSlot(slotId: string) {
    return getStore().slots.get(slotId);
}

export function getAllSlots() {
    return Array.from(getStore().slots.values());
}

export function updateSlot(slot: Slot) {
    getStore().slots.set(slot.slotId, slot);
}

export function getCurrentBasket() {
    return getStore().currentBasket;
}

export function setCurrentBasket(basket: Basket | null) {
    getStore().currentBasket = basket;
}

export function addScanHistory(entry: ScanHistoryEntry) {
    getStore().scanHistory.push(entry);
}

// =============================================================================
// PUT-TO-LIGHT STORE OPERATIONS
// =============================================================================

/**
 * Get a product by SKU
 */
export function getProduct(sku: string): Product | undefined {
    return getStore().products.get(sku);
}

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
    return Array.from(getStore().products.values());
}

/**
 * Check if a product exists and is active
 */
export function isProductValid(sku: string): boolean {
    const product = getStore().products.get(sku);
    return product !== undefined && product.active;
}

/**
 * Get a crate by ID
 */
export function getCrate(crateId: string): Crate | undefined {
    return getStore().crates.get(crateId);
}

/**
 * Get all crates
 */
export function getAllCrates(): Crate[] {
    return Array.from(getStore().crates.values());
}

/**
 * Find the best available crate for a given item count
 * Strategy: First-fit with smallest available capacity (to optimize space usage)
 */
export function findBestCrate(itemCount: number): Crate | null {
    const availableCrates = Array.from(getStore().crates.values())
        .filter(crate =>
            crate.status === "available" &&
            (crate.currentLoad + itemCount) <= crate.maxCapacity
        )
        .sort((a, b) => {
            // Sort by available space (smallest first) to optimize bin packing
            const availableA = a.maxCapacity - a.currentLoad;
            const availableB = b.maxCapacity - b.currentLoad;
            return availableA - availableB;
        });

    return availableCrates.length > 0 ? availableCrates[0] : null;
}

/**
 * Preview which crate will be assigned (lights up the crate without assigning)
 * This shows the user which crate items will go into before confirmation
 */
export function previewCrateForBasket(itemCount: number): Crate | null {
    // First turn off all lights
    turnOffAllCrateLights();

    // Find the best crate
    const crate = findBestCrate(itemCount);

    if (crate) {
        // Light up the preview crate (but don't assign yet)
        crate.lightStatus = "on";
        crate.lightColor = "#FF0000"; // Red for preview
        crate.lastUpdated = new Date().toISOString();
    }

    return crate;
}

/**
 * Turn off all crate lights (ensures only 1 crate is lit at a time)
 */
export function turnOffAllCrateLights(): void {
    const store = getStore();
    store.crates.forEach((crate) => {
        if (crate.lightStatus === "on") {
            crate.lightStatus = "off";
            // Keep the assigned status and load, just turn off light
            crate.lastUpdated = new Date().toISOString();
        }
    });
}


/**
 * Assign a basket to a crate (atomic operation)
 * This updates the crate's load and marks it as assigned
 * IMPORTANT: Only 1 crate should be lit at a time
 */
export function assignBasketToCrate(
    crateId: string,
    basketId: string,
    itemCount: number,
    items?: QRBasketItem[]
): { success: boolean; crate?: Crate; error?: string } {
    const store = getStore();
    const crate = store.crates.get(crateId);

    if (!crate) {
        return { success: false, error: "Crate not found" };
    }

    if (crate.status !== "available") {
        return { success: false, error: `Crate is not available (status: ${crate.status})` };
    }

    const newLoad = crate.currentLoad + itemCount;
    if (newLoad > crate.maxCapacity) {
        return { success: false, error: `Insufficient capacity (need: ${itemCount}, available: ${crate.maxCapacity - crate.currentLoad})` };
    }

    // IMPORTANT: Turn off all other lights first - only 1 crate should be lit
    turnOffAllCrateLights();

    // Atomic update (in production, use database transactions)
    crate.currentLoad = newLoad;
    crate.assignedBasketId = basketId;
    crate.status = newLoad >= crate.maxCapacity ? "full" : "assigned";
    crate.lightStatus = "on";
    crate.lightColor = "#FF0000"; // Red for active assignment (destructive theme)
    if (items) {
        crate.items = [...(crate.items || []), ...items];
    }
    crate.lastUpdated = new Date().toISOString();

    return { success: true, crate };
}

/**
 * Update items in a crate (for manual adjustments)
 */
export function updateCrateItems(
    crateId: string,
    items: QRBasketItem[]
): { success: boolean; crate?: Crate; error?: string } {
    const store = getStore();
    const crate = store.crates.get(crateId);

    if (!crate) {
        return { success: false, error: "Crate not found" };
    }

    // Update items
    crate.items = items;

    // Recalculate load
    const newLoad = items.reduce((sum, item) => sum + item.qty, 0);
    crate.currentLoad = newLoad;

    // Update status
    if (newLoad === 0) {
        crate.status = "available";
        crate.assignedBasketId = null;
        crate.lightStatus = "off";
        crate.lightColor = "#00FF00";
    } else {
        crate.status = newLoad >= crate.maxCapacity ? "full" : "assigned";
    }

    crate.lastUpdated = new Date().toISOString();

    return { success: true, crate };
}

/**
 * Turn off crate light (after items are placed)
 */
export function turnOffCrateLight(crateId: string): boolean {
    const crate = getStore().crates.get(crateId);
    if (!crate) return false;

    crate.lightStatus = "off";
    crate.status = crate.currentLoad >= crate.maxCapacity ? "full" : "available";
    crate.assignedBasketId = null;
    crate.lastUpdated = new Date().toISOString();
    return true;
}

/**
 * Check if a basket has already been processed (idempotency)
 */
export function isBasketProcessed(basketId: string): boolean {
    return getStore().processedBaskets.has(basketId);
}

/**
 * Get processed basket record
 */
export function getProcessedBasket(basketId: string): ProcessedBasket | undefined {
    return getStore().processedBaskets.get(basketId);
}

/**
 * Mark a basket as processed
 */
export function markBasketProcessed(
    basketId: string,
    crateId: string,
    totalItems: number
): ProcessedBasket {
    const record: ProcessedBasket = {
        basketId,
        processedAt: new Date().toISOString(),
        assignedCrateId: crateId,
        totalItems,
        status: "assigned"
    };
    getStore().processedBaskets.set(basketId, record);
    return record;
}

/**
 * Reset a specific crate (for testing/admin)
 */
export function resetCrate(crateId: string): boolean {
    const crate = getStore().crates.get(crateId);
    if (!crate) return false;

    crate.currentLoad = 0;
    crate.status = "available";
    crate.assignedBasketId = null;
    crate.lightStatus = "off";
    crate.lightColor = "#00FF00";
    crate.items = [];
    crate.lastUpdated = new Date().toISOString();
    return true;
}

/**
 * Reset all crates and processed baskets (for testing/admin)
 */
export function resetAllCrates(): void {
    const store = getStore();

    store.crates.forEach((crate) => {
        if (crate.status !== "maintenance") {
            crate.currentLoad = 0;
            crate.status = "available";
            crate.assignedBasketId = null;
            crate.lightStatus = "off";
            crate.lightColor = "#00FF00";
            crate.items = [];
            crate.lastUpdated = new Date().toISOString();
        }
    });

    store.processedBaskets.clear();
}
