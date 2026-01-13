"use client";

export function CrateLegend() {
    return (
        <div className="flex gap-4 mt-6 pt-4 border-t flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded-full bg-destructive animate-pulse" />
                <span>Đang sáng (nhấn để chỉnh)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded-full bg-emerald-900" />
                <span>Khả dụng</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded-full bg-yellow-500" />
                <span>Đã gán</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded-full bg-red-500" />
                <span>Đầy</span>
            </div>
        </div>
    );
}
