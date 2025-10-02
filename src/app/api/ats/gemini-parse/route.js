export const runtime = "nodejs";

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

// Robust JSON extraction and tolerant parsing
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
      else if (ch === '"') { inStr = false; }
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
  if (depth > 0) return src.slice(start) + "}".repeat(depth);
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
      try { return JSON.parse(slice); } catch {}
    }
  }
  return {};
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return value.split(/\s*,\s*/);
  return [];
}

function extractEmail(text) {
  const m = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
}

function extractPhone(text) {
  const m = String(text || "").match(/\+?[0-9][0-9\-()\s]{6,}/);
  return m ? m[0].trim() : "";
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Expected multipart/form-data", { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file || typeof file === "string") {
      return new Response("Missing file", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("Gemini API key not configured", { status: 500 });
    }

    // Convert file to base64 for Gemini API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'application/pdf';

    // Create a stronger prompt for structured extraction
    const prompt = `You are an expert resume parser. Extract a clean, normalized JSON object following this exact schema. Return ONLY valid JSON (no backticks, no extra text).

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "dates": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "dates": "string",
      "location": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"],
  "languages": ["string"],
  "rawText": "string"
}

Normalization rules:
- Trim all strings; empty strings should be omitted or set to "".
- Ensure arrays are arrays; if a single value is present, wrap in an array.
- Prefer ISO-like date strings when possible.
- Preserve bullet content in experience.description.
- Include the full plain text in rawText.
`;

    // Call Gemini API with the PDF file
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 4000,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(`Gemini API error: ${response.status} - ${errorText}`, { 
        status: response.status 
      });
    }

    const data = await response.json();
    const extractedText = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p?.text)
      .filter(Boolean)
      .join("\n");

    // Parse robustly and normalize
    let parsedData = parseJsonLoose(extractedText);
    if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
      parsedData = {};
    }

    const rawText = String(parsedData.rawText || "");
    const fallbackRawText = rawText || extractedText || "";
    const normalized = {
      name: String(parsedData.name || "").trim() || "Unknown",
      email: String(parsedData.email || extractEmail(fallbackRawText) || "").trim(),
      phone: String(parsedData.phone || extractPhone(fallbackRawText) || "").trim(),
      summary: String(parsedData.summary || "").trim(),
      skills: normalizeArray(parsedData.skills).map((s) => String(s).trim()).filter(Boolean),
      experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((e) => ({
        title: String(e?.title || "").trim(),
        company: String(e?.company || "").trim(),
        location: String(e?.location || "").trim(),
        dates: String(e?.dates || "").trim(),
        description: String(e?.description || "").trim(),
      })) : [],
      education: Array.isArray(parsedData.education) ? parsedData.education.map((e) => ({
        degree: String(e?.degree || "").trim(),
        institution: String(e?.institution || "").trim(),
        dates: String(e?.dates || "").trim(),
        location: String(e?.location || "").trim(),
      })) : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects.map((p) => ({
        name: String(p?.name || "").trim(),
        description: String(p?.description || "").trim(),
        technologies: normalizeArray(p?.technologies).map((s) => String(s).trim()).filter(Boolean),
      })) : [],
      certifications: normalizeArray(parsedData.certifications).map((s) => String(s).trim()).filter(Boolean),
      languages: normalizeArray(parsedData.languages).map((s) => String(s).trim()).filter(Boolean),
      rawText: fallbackRawText,
    };

    // Return the structured resume data
    return Response.json({
      success: true,
      data: normalized
    });

  } catch (error) {
    console.error('Gemini PDF processing error:', error);
    return new Response(`Gemini PDF processing error: ${error.message}`, { status: 500 });
  }
}
