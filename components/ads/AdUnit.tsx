"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type AdType = "leaderboard" | "rectangle" | "mobile" | "halfpage" | "banner" | "native";

interface AdUnitProps {
    type: AdType;
    className?: string;
}

const AD_CONFIG: Record<AdType, { key: string; width: number; height: number }> = {
    // Key terbaru dari pengguna
    leaderboard: { key: "863f6aef8282a41ad5ebdefcf161468b", width: 728, height: 90 },
    rectangle:   { key: "863f6aef8282a41ad5ebdefcf161468b", width: 300, height: 250 },
    mobile:      { key: "863f6aef8282a41ad5ebdefcf161468b", width: 320, height: 50 },
    halfpage:    { key: "863f6aef8282a41ad5ebdefcf161468b", width: 160, height: 600 },
    banner:      { key: "863f6aef8282a41ad5ebdefcf161468b", width: 468, height: 60 },
    native:      { key: "863f6aef8282a41ad5ebdefcf161468b", width: 300, height: 250 }, // Native container placeholder
};

export default function AdUnit({ type, className = "" }: AdUnitProps) {
    // Iklan dinonaktifkan sementara
    return null;
}
