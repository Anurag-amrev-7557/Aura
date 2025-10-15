import { NextResponse } from 'next/server';
import { fetchRemotiveJobs, fetchMuseJobs } from '@/lib/search/remotive';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const source = url.searchParams.get('source') || 'remotive';
    const ttl = parseInt(url.searchParams.get('ttlMs') || '', 10) || undefined;

    let res;
    if (source === 'muse') {
      res = await fetchMuseJobs({ q, page, perPage, ttlMs: ttl });
    } else {
      res = await fetchRemotiveJobs({ q, page, perPage, ttlMs: ttl });
    }

    // enrich hits with raw logo and proxied logo URL for easier debugging in the client
    const enrichedHits = (res.hits || []).map((h) => {
      const companyName = (h.company && h.company.name) || (h.raw && (h.raw.company_name || '')) || '';
      const companyLogoRaw = (h.company && h.company.logo) || (h.raw && (h.raw.company_logo || null)) || null;
      const companyLogoProxy = companyLogoRaw ? `/api/image-proxy?url=${encodeURIComponent(companyLogoRaw)}${companyName ? `&name=${encodeURIComponent(companyName)}` : ''}` : null;
      return { ...h, companyLogoRaw, companyLogoProxy };
    });

    return NextResponse.json({ hits: enrichedHits, total: res.total, page: res.page, perPage: res.perPage });
  } catch (err) {
    console.error('external-jobs error', err);
    return NextResponse.json({ error: err.message || 'Upstream error' }, { status: 502 });
  }
}
