export const runtime = "nodejs";

function extractJsonSubstring(input) {
  if (!input || typeof input !== "string") return null;
  const fenced = input.match(/```json[\s\S]*?```|```[\s\S]*?```/i);
  let src = fenced ? fenced[0].replace(/```json|```/gi, "").trim() : input.trim();
  let start = src.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) { esc = false; }
      else if (ch === "\\") { esc = true; }
      else if (ch === "\"") { inStr = false; }
    } else {
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return src.slice(start, i + 1);
        }
      }
    }
  }
  // If we get here, JSON might be truncated; attempt to close remaining braces
  if (depth > 0) {
    return src.slice(start) + "}".repeat(depth);
  }
  return null;
}

function parseJsonLoose(text) {
  if (!text) return {};
  const candidate = extractJsonSubstring(text) || text;
  const cleaned = candidate
    .replace(/^\uFEFF/, "")
    .replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const slice = cleaned.slice(first, last + 1);
      try { return JSON.parse(slice); } catch { /* ignore */ }
    }
  }
  return {};
}

function compressForModel(input, maxChars) {
  if (!input) return "";
  const text = String(input).replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  // Preferentially keep likely-important lines (skills, summary, experience bullets)
  const lines = String(input)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const important = [];
  for (const l of lines) {
    if (/^(skills?|summary|profile|experience|projects|education)\b/i.test(l)) important.push(l);
    else if (/^[•\-\*]/.test(l)) important.push(l);
    if (important.join(" ").length > maxChars * 0.8) break;
  }
  const head = text.slice(0, Math.floor(maxChars * 0.5));
  const tail = text.slice(-Math.floor(maxChars * 0.2));
  const merged = (important.join(" ") + " " + head + " " + tail).slice(0, maxChars);
  return merged;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const where = (searchParams.get("where") || "global").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const sort = (searchParams.get("sort") || "relevance").trim(); // relevance | date
    const remote = (searchParams.get("remote") || "").trim(); // "true" for remote only
    const type = (searchParams.get("type") || "").trim(); // FULLTIME | PARTTIME | CONTRACT | INTERN | TEMPORARY
    const date = (searchParams.get("date") || "").trim(); // 24h | 3d | 7d | 30d

    if (!q) {
      return new Response("Missing q", { status: 400 });
    }

    // Simple aggregator using JSearch via SerpAPI-compatible endpoint or public APIs
    // For demo, use JSearch RapidAPI if env provided, otherwise return mock data for testing
    const serpKey = process.env.SERPAPI_KEY;
    const jsearchKey = process.env.RAPIDAPI_KEY;
    if (!jsearchKey && serpKey) {
      // Prefer SerpApi Google Jobs if configured
      const serpUrl = new URL("https://serpapi.com/search");
      serpUrl.searchParams.set("engine", "google_jobs");
      serpUrl.searchParams.set("q", q);
      if (where && where !== "global") serpUrl.searchParams.set("location", where);
      const token = (searchParams.get("token") || "").trim();
      if (token) serpUrl.searchParams.set("next_page_token", token);
      serpUrl.searchParams.set("api_key", serpKey);

      const resp = await fetch(serpUrl.toString(), { headers: { "accept": "application/json" } });
      if (!resp.ok) {
        const t = await resp.text();
        return new Response(t || "SerpApi error", { status: resp.status });
      }
      const data = await resp.json();
      const items = Array.isArray(data?.jobs_results) ? data.jobs_results : [];
      const jobs = items.map((j) => ({
        id: j.job_id || j.job_id_snippet || j.apply_link || j.title,
        title: j.title || "",
        company: j.company_name || j.publisher || "",
        location: j.location || "",
        link: j.apply_link || j.share_link || j.google_jobs_url || "",
        description: j.description || "",
        postedAt: j.detected_extensions?.posted_at || j.detected_extensions?.posted_at_text || "",
      }));
      const nextToken = data?.serpapi_pagination?.next_page_token || "";
      // Basic client-side filters to honor UI controls
      let filtered = jobs;
      if (remote === "true") filtered = filtered.filter((j) => /remote/i.test(j.location || j.description || "remote"));
      if (type) {
        const t = type.replace(/_/g, " ").toLowerCase();
        filtered = filtered.filter((j) =>
          (j.title && j.title.toLowerCase().includes(t)) ||
          (j.description && j.description.toLowerCase().includes(t))
        );
      }
      const dateToDays = { "24h": 1, "3d": 3, "7d": 7, "30d": 30 };
      if (date && dateToDays[date]) {
        const days = dateToDays[date];
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        filtered = filtered.filter((j) => {
          const ts = Date.parse(j.postedAt || "");
          return Number.isFinite(ts) ? ts >= cutoff : true;
        });
      }
      if (sort === "date") {
        filtered.sort((a, b) => (Date.parse(b.postedAt || "") || 0) - (Date.parse(a.postedAt || "") || 0));
      }
      return Response.json({ jobs: filtered, page, hasMore: Boolean(nextToken), meta: { params: { q, where, sort, remote, type, date }, nextToken } });
    }
    if (!jsearchKey) {
      // Free aggregation using Remotive (search + pagination) and RemoteOK (feed, client-side filtered)
      const pageSize = 20;

      // Build Remotive URL
      const remotiveUrl = new URL("https://remotive.com/api/remote-jobs");
      if (q) remotiveUrl.searchParams.set("search", q);
      remotiveUrl.searchParams.set("limit", String(pageSize));
      remotiveUrl.searchParams.set("page", String(page));
      // Map type to Remotive job_type where possible
      const remotiveTypeMap = {
        full_time: "full_time",
        part_time: "part_time",
        contract: "contract",
        internship: "internship",
        temporary: "temporary",
      };
      if (type && remotiveTypeMap[type]) {
        remotiveUrl.searchParams.set("job_type", remotiveTypeMap[type]);
      }

      // Fetch in parallel: Remotive and RemoteOK (no params on RemoteOK API)
      const [remotiveResp, remoteOkResp] = await Promise.allSettled([
        fetch(remotiveUrl.toString(), { headers: { "accept": "application/json" } }),
        fetch("https://remoteok.com/api", { headers: { "accept": "application/json" } }),
      ]);

      // Parse Remotive
      let remotiveJobs = [];
      let remotiveTotal = 0;
      try {
        if (remotiveResp.status === "fulfilled" && remotiveResp.value.ok) {
          const data = await remotiveResp.value.json();
          const items = Array.isArray(data?.jobs) ? data.jobs : [];
          remotiveJobs = items.map((j) => ({
            id: j.id || j.url || `${j.company_name}-${j.title}`,
            title: j.title || "",
            company: j.company_name || "",
            location: j.candidate_required_location || j.job_type || "Remote",
            link: j.url || "",
            description: j.description || "",
            postedAt: j.publication_date || "",
          }));
          remotiveTotal = Number(data?.total) || remotiveJobs.length;
        }
      } catch (_) {}

      // Parse RemoteOK
      let remoteOkJobs = [];
      try {
        if (remoteOkResp.status === "fulfilled" && remoteOkResp.value.ok) {
          const data = await remoteOkResp.value.json();
          const items = Array.isArray(data) ? data.slice(1) : []; // first item is metadata
          remoteOkJobs = items.map((j) => ({
            id: j.id || j.slug || j.url,
            title: j.position || j.title || "",
            company: j.company || "",
            location: (Array.isArray(j.location) ? j.location.join(", ") : j.location) || "Remote",
            link: j.url || (j.apply_url || ""),
            description: j.description || j.tags?.join(", ") || "",
            postedAt: j.date || j.published_at || "",
          }));
        }
      } catch (_) {}

      // Combine sources
      let combined = [...remotiveJobs, ...remoteOkJobs];

      // Filter by query if needed (RemoteOK doesn't support search server-side)
      if (q) {
        const qLower = q.toLowerCase();
        combined = combined.filter((j) =>
          (j.title && j.title.toLowerCase().includes(qLower)) ||
          (j.company && j.company.toLowerCase().includes(qLower)) ||
          (j.description && j.description.toLowerCase().includes(qLower))
        );
      }

      // Filter by remoteOnly (both APIs are predominantly remote; keep for compatibility)
      if (remote === "true") {
        combined = combined.filter((j) => /remote/i.test(j.location || "remote"));
      }

      // Filter by type best-effort
      if (type) {
        const t = type.replace(/_/g, " ").toLowerCase();
        combined = combined.filter((j) =>
          (j.description && j.description.toLowerCase().includes(t)) ||
          (j.location && j.location.toLowerCase().includes(t)) ||
          (j.title && j.title.toLowerCase().includes(t))
        );
      }

      // Date filter
      const dateToDays = { "24h": 1, "3d": 3, "7d": 7, "30d": 30 };
      if (date && dateToDays[date]) {
        const days = dateToDays[date];
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        combined = combined.filter((j) => {
          const ts = Date.parse(j.postedAt || "");
          return Number.isFinite(ts) ? ts >= cutoff : true;
        });
      }

      // Location best-effort filter (string contains)
      if (where && where !== "global") {
        const w = where.toLowerCase();
        combined = combined.filter((j) =>
          (j.location && j.location.toLowerCase().includes(w)) ||
          (j.description && j.description.toLowerCase().includes(w))
        );
      }

      // Sorting
      if (sort === "date") {
        combined.sort((a, b) => (Date.parse(b.postedAt || "") || 0) - (Date.parse(a.postedAt || "") || 0));
      } else {
        // simple relevance: prioritize title/company matches
        const qLower = (q || "").toLowerCase();
        combined.sort((a, b) => {
          const score = (j) => {
            let s = 0;
            if (!qLower) return s;
            if (j.title && j.title.toLowerCase().includes(qLower)) s += 3;
            if (j.company && j.company.toLowerCase().includes(qLower)) s += 2;
            if (j.description && j.description.toLowerCase().includes(qLower)) s += 1;
            return s;
          };
          return score(b) - score(a);
        });
      }

      // Paginate client-side across combined list
      const total = combined.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const slice = combined.slice(start, end);
      const hasMore = end < total;

      return Response.json({
        jobs: slice,
        page,
        hasMore,
        meta: {
          params: { q, where, page, sort, remote, type, date },
          sources: {
            remotive: { url: remotiveUrl.toString(), totalHint: remotiveTotal || undefined },
            remoteok: { url: "https://remoteok.com/api" },
          },
        },
      });
    }

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", q);
    url.searchParams.set("page", String(page));
    url.searchParams.set("num_pages", "1");
    if (where && where !== "global") {
      // JSearch prefers comma-separated "City, State" or "City, State, Country"; pass raw user input
      url.searchParams.set("location", where);
      // Provide radius default to broaden results if city provided (optional)
      if (!url.searchParams.get("radius")) url.searchParams.set("radius", "25");
    }

    // Optional filters
    if (remote === "true") url.searchParams.set("remote_jobs_only", "true");
    // If both location and remote are set, keep both to allow "remote near X" matches
    const typeMap = {
      full_time: "FULLTIME",
      part_time: "PARTTIME",
      contract: "CONTRACTOR",
      contractor: "CONTRACTOR",
      internship: "INTERN",
      intern: "INTERN",
    };
    if (type) {
      const t = typeMap[type.toLowerCase()];
      if (t) {
        url.searchParams.set("employment_types", t);
      }
    }
    const dateMap = {
      "24h": "last_24_hours",
      "3d": "last_3_days",
      "7d": "last_7_days",
      "30d": "last_30_days",
    };
    if (date && dateMap[date]) url.searchParams.set("date_posted", dateMap[date]);
    if (sort === "date") {
      url.searchParams.set("sort_by", "date_posted");
      url.searchParams.set("sort_type", "desc");
    }

    const resp = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": jsearchKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(t, { status: resp.status });
    }

    const data = await resp.json();
    const items = Array.isArray(data?.data) ? data.data : [];
    const jobs = items.map((j) => ({
      id: j.job_id,
      title: j.job_title,
      company: j.employer_name,
      location: j.job_city && j.job_state ? `${j.job_city}, ${j.job_state}` : j.job_city || j.job_state || j.job_country || "",
      link: j.job_apply_link || j.job_google_link || j.job_offer_expiration || "",
      description: j.job_description || "",
      postedAt: j.job_posted_at_datetime_utc || j.job_posted_at || "",
    }));

    // Heuristic for hasMore: if results returned and metadata suggests more, or page size seems full
    const total = Number(data?.metadata?.total_jobs || 0);
    const pageSize = Number(data?.metadata?.count || jobs.length);
    const hasMore = total ? page * (pageSize || 10) < total : jobs.length >= (pageSize || 10);

    // Echo selected params for debugging on the client side (non-breaking)
    const echoedParams = {
      q,
      where: where && where !== "global" ? where : undefined,
      page,
      sort,
      remote: remote === "true" ? true : undefined,
      type: type || undefined,
      date: date || undefined,
      requestedUrl: url.toString(),
      apiStatus: data?.status || undefined,
    };

    return Response.json({ jobs, page, hasMore, meta: { params: echoedParams } });
  } catch (err) {
    return new Response(err?.message || "Server error", { status: 500 });
  }
}

async function callGemini(
  prompt,
  apiKey,
  { responseMimeType = "application/json", maxOutputTokens = 3000, retries = 3, baseDelayMs = 400 } = {}
) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              topP: 0.9,
              topK: 40,
              maxOutputTokens,
              responseMimeType,
            },
          }),
        }
      );
      if (!resp.ok) {
        const status = resp.status;
        const t = await resp.text().catch(() => "");
        // Retry on transient 429/503
        if ((status === 429 || status === 503) && attempt < retries) {
          const jitter = Math.floor(Math.random() * 200);
          const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          continue;
        }
        throw new Error(`Gemini API error: ${status} - ${t}`);
      }
      const data = await resp.json();
      const text = (data?.candidates?.[0]?.content?.parts || [])
        .map((p) => p?.text)
        .filter(Boolean)
        .join("\n");
      return text || "";
    } catch (e) {
      lastErr = e;
      // Network failures: backoff retry
      if (attempt < retries) {
        const jitter = Math.floor(Math.random() * 200);
        const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }
      break;
    }
  }
  throw lastErr || new Error("Gemini call failed");
}

export async function POST(request) {
  try {
    const { resume, job, structured } = await request.json();
    const resumeText = (resume || "").trim();
    if (!resumeText) {
      return new Response("Missing resume", { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Minimal safe fallback so UI doesn't break
      return Response.json({
        overallScore: 0.6,
        summary: "Gemini API key not configured. Showing heuristic summary.",
        gaps: ["Add quantifiable achievements", "Align keywords with job description"],
        tips: ["Use action verbs", "Include metrics", "Tailor to the job"],
        keywordsMatched: [],
        suggestedEdits: [],
        sectionScores: { Summary: 0.6, Experience: 0.6, Skills: 0.6, Education: 0.6 },
        keywordGaps: [],
        quantifiedBullets: [],
        redFlags: [],
      });
    }

    const compressedResume = compressForModel(resumeText, 6000);
    const compressedJob = job ? compressForModel(job, 3000) : "";
    const structuredHint = structured ? JSON.stringify(structured).slice(0, 4000) : "";

    const prompt = `You are an ATS and resume expert. Analyze the candidate's resume against the (optional) job description and return ONLY strict JSON.

          Resume:
          ${compressedResume}

          ${compressedJob ? `Job:\n${compressedJob}\n` : ""}
          ${structuredHint ? `StructuredResumeHint:\n${structuredHint}\n` : ""}

          JSON schema:
          {
            "overallScore": number in [0,1],
            "summary": string,
            "gaps": string[],
            "tips": string[],
            "keywordsMatched": string[],
            "suggestedEdits": string[],
            "sectionScores": { [section: string]: number in [0,1] },
            "keywordGaps": string[],
            "quantifiedBullets": string[],
            "redFlags": string[]
          }`;

    let parsed;
    try {
      const raw = await callGemini(prompt, apiKey, { responseMimeType: "application/json" });
      parsed = parseJsonLoose(raw);
    } catch (gemErr) {
      // Graceful degraded response if model overloaded or throttled
      const msg = String(gemErr?.message || "Gemini unavailable");
      return Response.json({
        overallScore: 0.5,
        summary: `AI is temporarily unavailable (${msg}). Showing a basic heuristic summary instead.`,
        gaps: ["Ensure keywords from the job appear in your resume", "Quantify achievements with metrics"],
        tips: ["Tailor the summary to the role", "Use consistent tense and formatting"],
        keywordsMatched: [],
        suggestedEdits: [],
        sectionScores: { Summary: 0.5, Experience: 0.5, Skills: 0.5, Education: 0.5 },
        keywordGaps: [],
        quantifiedBullets: [],
        redFlags: [],
      });
    }
    // Basic normalization so UI doesn't explode
    const safe = {
      overallScore: Number(parsed.overallScore || 0),
      summary: String(parsed.summary || ""),
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      keywordsMatched: Array.isArray(parsed.keywordsMatched) ? parsed.keywordsMatched : [],
      suggestedEdits: Array.isArray(parsed.suggestedEdits) ? parsed.suggestedEdits : [],
      sectionScores: parsed.sectionScores && typeof parsed.sectionScores === "object" ? parsed.sectionScores : {},
      keywordGaps: Array.isArray(parsed.keywordGaps) ? parsed.keywordGaps : [],
      quantifiedBullets: Array.isArray(parsed.quantifiedBullets) ? parsed.quantifiedBullets : [],
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    };

    return Response.json(safe);
  } catch (err) {
    return new Response(err?.message || "Analysis failed", { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { resume, job } = await request.json();
    const resumeText = (resume || "").trim();
    if (!resumeText) {
      return new Response("Missing resume", { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        rewritten: resumeText,
        suggestions: ["Add measurable outcomes", "Tighten wording", "Match job keywords"],
        quantifiedBullets: [],
      });
    }

    const compressedResume = compressForModel(resumeText, 6000);
    const compressedJob = job ? compressForModel(job, 3000) : "";
    const prompt = `Rewrite the resume to better match the job (if provided). Keep truthful content, improve clarity, and quantify achievements. Return ONLY strict JSON with keys: rewritten (string), suggestions (string[]), quantifiedBullets (string[]).

Resume:\n${compressedResume}
${compressedJob ? `\nJob:\n${compressedJob}` : ""}`;

    let parsed;
    try {
      const raw = await callGemini(prompt, apiKey, { responseMimeType: "application/json" });
      parsed = parseJsonLoose(raw);
    } catch (gemErr) {
      const msg = String(gemErr?.message || "Gemini unavailable");
      return Response.json({
        rewritten: resumeText,
        suggestions: [
          `AI temporarily unavailable (${msg}). Manual suggestions shown.`,
          "Add measurable outcomes to bullets (%, $, #)",
          "Mirror key terms from the job posting",
        ],
        quantifiedBullets: [],
      });
    }
    return Response.json({
      rewritten: String(parsed.rewritten || resumeText),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      quantifiedBullets: Array.isArray(parsed.quantifiedBullets) ? parsed.quantifiedBullets : [],
    });
  } catch (err) {
    return new Response(err?.message || "Rewrite failed", { status: 500 });
  }
}