import { NextResponse } from 'next/server';
import { getLatestVideos } from '@/lib/jav';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const videos = await getLatestVideos(page);
        return NextResponse.json(videos);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch latest videos' }, { status: 500 });
    }
}
