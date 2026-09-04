"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function GoRedirectClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const destination = searchParams.get("to") || "/";

    useEffect(() => {
        router.replace(destination);
    }, [destination, router]);

    return (
        <div className="min-h-screen bg-[#0c0c0e] flex flex-col items-center justify-center px-4 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-zinc-400 text-xs">Mengarahkan ke video...</p>
        </div>
    );
}
