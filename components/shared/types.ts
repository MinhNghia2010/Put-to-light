// Shared types for Put-to-Light components

export interface ScannedItem {
    sku: string;
    qty: number;
    name?: string;
}

export interface ScannedBasket {
    basketId: string;
    items: ScannedItem[];
}

export interface ValidationError {
    type: 'missing_sku' | 'missing_qty' | 'invalid_qty' | 'empty_basket' | 'missing_basketId';
    message: string;
    itemIndex?: number;
}
