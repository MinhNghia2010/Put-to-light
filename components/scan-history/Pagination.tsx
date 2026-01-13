"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
    filteredCount: number;
    totalCount: number;
    hasMore: boolean;
    onLoadMore: () => void;
}

export function Pagination({
    filteredCount,
    totalCount,
    hasMore,
    onLoadMore,
}: PaginationProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
                Showing {filteredCount} of {totalCount} results
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                    <span className="sr-only">Previous</span>
                    <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Button>
                <Button
                    variant="default"
                    size="icon"
                    className="bg-destructive hover:bg-destructive/90"
                >
                    1
                </Button>
                {hasMore && (
                    <>
                        <Button variant="outline" size="icon" onClick={onLoadMore}>
                            2
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">...</span>
                    </>
                )}
                <Button variant="outline" size="icon" disabled={!hasMore}>
                    <span className="sr-only">Next</span>
                    <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
