import { NextResponse } from 'next/server';
import { getJavWatchData } from '@/lib/jav';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const watchData = await getJavWatchData(id);
        if (!watchData) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }
        return NextResponse.json(watchData);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
    }
}
