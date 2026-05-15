import { NextRequest, NextResponse } from "next/server";

/**
 * /api/hls-player?url={m3u8Url}
 * Mengembalikan HTML page dengan HLS.js player.
 * Dipakai sebagai iframe src untuk video yang hanya punya stream m3u8.
 */
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url") || "";

    if (!url || !url.startsWith("http")) {
        return new NextResponse("Invalid URL", { status: 400 });
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Video Player</title>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; width: 100vw; height: 100vh; overflow: hidden; }
  video { width: 100%; height: 100%; object-fit: contain; }
  #error { display: none; color: #fff; font-family: sans-serif; font-size: 14px;
           position: absolute; inset: 0; align-items: center; justify-content: center;
           flex-direction: column; gap: 8px; background: #111; }
</style>
</head>
<body>
<video id="video" controls autoplay playsinline></video>
<div id="error">
  <svg width="40" height="40" fill="none" stroke="#f472b6" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
  <span>Video tidak tersedia</span>
</div>
<script>
  const src = ${JSON.stringify(url)};
  const video = document.getElementById('video');
  const errorDiv = document.getElementById('error');

  function showError() {
    video.style.display = 'none';
    errorDiv.style.display = 'flex';
  }

  if (Hls.isSupported()) {
    const hls = new Hls({ maxBufferLength: 30, enableWorker: true });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) showError();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.addEventListener('error', showError);
  } else {
    showError();
  }
</script>
</body>
</html>`;

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Frame-Options": "SAMEORIGIN",
            "Cache-Control": "no-store",
        },
    });
}
