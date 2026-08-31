import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MemberVanityClient from "@/components/dashboard/MemberVanityClient";

export const metadata = {
    title: "Custom Link Shortener - Cuanflix Dashboard",
};

export default async function CustomLinkPage() {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        redirect("/auth/login");
    }

    return <MemberVanityClient user={user} />;
}
