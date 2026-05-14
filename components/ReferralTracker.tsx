"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref && ref.length >= 8) {
            // Save to localStorage so it persists even if user navigates away
            localStorage.setItem("cuan_referrer", ref);
            console.log("Referrer saved:", ref);
        }
    }, [searchParams]);

    return null;
}
