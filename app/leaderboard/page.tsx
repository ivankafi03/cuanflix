import React from "react";
import LeaderboardClient from "@/components/LeaderboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leaderboard - Top Earners",
    description: "Daftar member dengan penghasilan tertinggi di Cuanflix. Mulai nonton dan raih posisi teratas!",
};

export default function PublicLeaderboardPage() {
    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-24 md:pb-10 px-4">
            <LeaderboardClient />
        </div>
    );
}
