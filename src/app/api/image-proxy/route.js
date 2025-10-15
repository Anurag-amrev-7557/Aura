import { NextResponse } from 'next/server';

// Allowlist of hosts we will proxy images from
const ALLOWED_HOSTS = new Set([
  'remotive.com',
  'www.remotive.com',
  'themuse.com',
  'www.themuse.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'cdn.discordapp.com',
]);

export async function GET(req) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });

    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    // Fetch upstream image (first attempt)
    const ua = { 'User-Agent': 'Aura/Image-Proxy (+https://example.com)' };
    let upstream = await fetch(url, { headers: ua, redirect: 'follow' });

    // If upstream not ok, retry with Referer and broader Accept header (some hosts block hotlinks)
    if (!upstream.ok) {
      upstream = await fetch(url, {
        headers: {
          ...ua,
          Referer: 'https://remotive.com/',
          Accept: 'image/*,*/*;q=0.8',
        },
        redirect: 'follow',
      });
    }

    // If still not ok, return placeholder SVG so client receives an image
    if (!upstream.ok) {
      console.warn('image-proxy upstream error', url, upstream.status);
      const nameParam = req.nextUrl.searchParams.get('name') || '';
      const initial = (nameParam && nameParam.trim()[0]) ? nameParam.trim()[0].toUpperCase() : '?';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#374151" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="700">${initial}</text></svg>`;
      return new NextResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' } });
    }

    const contentType = upstream.headers.get('content-type') || '';

    // If response isn't an image, try to extract an image URL from HTML (og:image or img)
    if (!contentType.startsWith('image/')) {
      try {
        const text = await upstream.text();
        // look for og:image
        const ogMatch = text.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
        const imgMatch = text.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
        const candidate = ogMatch?.[1] || imgMatch?.[1];
        if (candidate) {
          // resolve relative URLs
          const resolved = new URL(candidate, url).toString();
          // Only proxy allowed hosts
          const parsed = new URL(resolved);
          if (!ALLOWED_HOSTS.has(parsed.hostname)) {
            // Not allowed; return placeholder
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#374151" font-size="18">?</text></svg>`;
            return new NextResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' } });
          }
          const follow = await fetch(resolved, { headers: ua, redirect: 'follow' });
          if (follow.ok && (follow.headers.get('content-type') || '').startsWith('image/')) {
            const cacheControl = follow.headers.get('cache-control') || 'public, max-age=3600';
            return new NextResponse(follow.body, { status: 200, headers: { 'Content-Type': follow.headers.get('content-type'), 'Cache-Control': cacheControl } });
          }
        }
      } catch (e) {
        console.warn('image-proxy parse error', e);
      }

      // If we reach here, return placeholder SVG
  const nameParam = req.nextUrl.searchParams.get('name') || '';
  const initial = (nameParam && nameParam.trim()[0]) ? nameParam.trim()[0].toUpperCase() : '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#374151" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="700">${initial}</text></svg>`;
  return new NextResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' } });
    }

    const cacheControl = upstream.headers.get('cache-control') || 'public, max-age=3600';
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    });
  } catch (err) {
    console.error('image-proxy error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
