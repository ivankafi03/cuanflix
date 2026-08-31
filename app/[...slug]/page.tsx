import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VanityRedirectClient from "@/components/VanityRedirectClient";

export const dynamic = "force-dynamic";

export default async function CatchAllVanityPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    const fullSlug = slug.join("/");
    const key = `vanity_${fullSlug}`;

    try {
        const cacheEntry = await prisma.contentCache.findUnique({
            where: { key },
        });

        if (cacheEntry) {
            const data = JSON.parse(cacheEntry.data);
            if (data && data.isActive !== false && data.targetUrl) {
                // Increment click counter non-blocking
                (async () => {
                    try {
                        const updatedData = {
                            ...data,
                            clicks: (data.clicks || 0) + 1,
                        };
                        await prisma.contentCache.update({
                            where: { key },
                            data: { data: JSON.stringify(updatedData) },
                        });
                    } catch (e) {
                        console.error("Error updating vanity link clicks:", e);
                    }
                })();

                let target = data.targetUrl.trim();
                // Ensure target has leading slash if internal link
                if (!target.startsWith("http://") && !target.startsWith("https://") && !target.startsWith("/")) {
                    target = `/${target}`;
                }

                return <VanityRedirectClient targetUrl={target} />;
            }
        }
    } catch (err: any) {
        // If error was triggered by next/navigation redirect, rethrow it
        if (err?.digest?.startsWith("NEXT_REDIRECT")) {
            throw err;
        }
        console.error("Vanity link lookup error:", err);
    }

    notFound();
}
