import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import os from "os";
import fs from "fs";

export const dynamic = "force-dynamic";

// Helper for network stats on Linux
function getNetworkStats() {
    try {
        if (os.platform() !== 'linux') return { rx: 0, tx: 0 };
        const data = fs.readFileSync('/proc/net/dev', 'utf8');
        const lines = data.split('\n');
        let rx = 0;
        let tx = 0;
        
        // Typical interface names are eth0, ens3, etc.
        for (const line of lines) {
            if (line.includes(':') && !line.includes('lo:')) {
                const parts = line.trim().split(/\s+/);
                rx += parseInt(parts[1]) || 0; // Bytes received
                tx += parseInt(parts[9]) || 0; // Bytes transmitted
            }
        }
        return { rx, tx };
    } catch (err) {
        return { rx: 0, tx: 0 };
    }
}

export async function GET() {
    const startTime = Date.now();
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Memory Stats
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsage = (usedMem / totalMem) * 100;

        // 2. CPU Load
        const loadAvg = os.loadavg();
        const cpuCount = os.cpus().length;
        const cpuUsage = (loadAvg[0] / cpuCount) * 100;

        // 3. Network Stats
        const net = getNetworkStats();

        // 4. Uptime & Platform
        const uptime = os.uptime();
        const platform = os.platform();
        const arch = os.arch();

        // 5. Latency (processing time for this request)
        const latency = Date.now() - startTime;

        return NextResponse.json({
            memory: {
                total: (totalMem / (1024 ** 3)).toFixed(2) + " GB",
                used: (usedMem / (1024 ** 3)).toFixed(2) + " GB",
                usage: Math.round(memUsage)
            },
            cpu: {
                model: os.cpus()[0].model,
                cores: cpuCount,
                usage: Math.round(cpuUsage > 100 ? 100 : cpuUsage)
            },
            network: {
                rx: net.rx, // cumulative bytes
                tx: net.tx, // cumulative bytes
            },
            system: {
                platform,
                arch,
                uptime: formatUptime(uptime),
                latency: latency + " ms"
            }
        });
    } catch (error) {
        console.error("Server Health Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function formatUptime(seconds: number) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m`;
}
