import React from 'react';
import { decryptStreamToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export default async function EmbedPlayerPage({
    params
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const realUrl = decryptStreamToken(token);

    if (!realUrl) {
        return (
            <div style={{
                background: '#000',
                color: '#888',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'sans-serif',
                fontSize: '12px'
            }}>
                Server video sedang tidak tersedia.
            </div>
        );
    }

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            overflow: 'hidden'
        }}>
            <iframe
                src={realUrl}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                style={{
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />
        </div>
    );
}
