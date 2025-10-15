import fetch from 'node-fetch';

// Simple in-memory cache with TTL
const cache = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60s

function cacheKey(url) {
  return url;
}

async function cachedFetch(url, ttl = DEFAULT_TTL_MS) {
  const key = cacheKey(url);
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expiresAt > now) return entry.data;
  const res = await fetch(url, { headers: { 'User-Agent': 'Aura/Remotive-Proxy' } });
  if (!res.ok) throw new Error(`Upstream fetch failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  cache.set(key, { data: json, expiresAt: now + ttl });
  return json;
}

function normalizeRemotiveJob(j) {
  return {
    id: String(j.id),
    title: j.title || '',
    company: { name: j.company_name || '' },
    description: j.description || '',
    location: { city: j.candidate_required_location || '' },
    url: j.url || '',
    remote: true,
    posted_at: j.publication_date || null,
    skills: Array.isArray(j.tags) ? j.tags : [],
    raw: j
  };
}

function normalizeMuseJob(j) {
  // The Muse has a slightly different structure. Try to map fields we care about.
  return {
    id: String(j.id),
    title: j.name || j.title || '',
    company: { name: j.company?.name || '' },
    description: j.contents || j.contents_plain || '',
    location: { city: (j.locations && j.locations[0]?.name) || '' },
    url: j.refs?.landing_page || j.refs?.canonical || '',
    remote: Boolean(j.remote),
    posted_at: j.publication_date || null,
    skills: Array.isArray(j.levels) ? j.levels.map(l => l.name) : [],
    raw: j
  };
}

export async function fetchRemotiveJobs({ q, page = 1, perPage = 10, ttlMs } = {}) {
  const base = 'https://remotive.com/api/remote-jobs';
  const params = new URLSearchParams();
  if (q) params.set('search', q);
  // Remotive doesn't have `page` param; emulate by slicing results
  const url = `${base}${q ? `?${params.toString()}` : ''}`;
  const raw = await cachedFetch(url, ttlMs);
  const jobs = Array.isArray(raw.jobs) ? raw.jobs : [];
  const start = (page - 1) * perPage;
  const pageItems = jobs.slice(start, start + perPage).map(normalizeRemotiveJob);
  return { hits: pageItems, total: jobs.length, page, perPage };
}

export async function fetchMuseJobs({ q, page = 1, perPage = 10, ttlMs } = {}) {
  // The Muse supports pagination
  const base = 'https://www.themuse.com/api/public/jobs';
  const params = new URLSearchParams();
  if (q) params.set('category', q); // The Muse API uses category/search differently; best-effort
  params.set('page', String(page));
  params.set('descending', 'true');
  const url = `${base}?${params.toString()}`;
  const raw = await cachedFetch(url, ttlMs);
  const results = Array.isArray(raw.results) ? raw.results : [];
  const pageItems = results.slice(0, perPage).map(normalizeMuseJob);
  return { hits: pageItems, total: raw._metadata?.count || results.length, page, perPage };
}

export default {
  fetchRemotiveJobs,
  fetchMuseJobs
};
