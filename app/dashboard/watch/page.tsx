import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import WatchClient from "@/components/dashboard/WatchClient";
import { redirect } from "next/navigation";

export default async function WatchPage() {
    redirect("/dashboard/share");
}
