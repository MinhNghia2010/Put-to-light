import { Suspense } from "react";
import { CrateInfo } from "@/components/CrateInfo";

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-destructive"></div>
        </div>
    );
}

export default function CrateInfoPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CrateInfo />
        </Suspense>
    );
}
