"use client";

import { Suspense } from "react";
import NavigationProgress from "./NavigationProgress";

// Suspense wrapper required because NavigationProgress uses useSearchParams
export default function NavigationProgressWrapper() {
    return (
        <Suspense fallback={null}>
            <NavigationProgress />
        </Suspense>
    );
}
