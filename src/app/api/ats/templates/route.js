export const runtime = "nodejs";

// Robust JSON extraction/parsing (aligned with ats/route.js)
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

// Utility: compress resume content to a short, info-dense string (from ats/route.js)
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

async function callGemini(prompt, apiKey, { responseMimeType = "application/json", maxOutputTokens = 1200, retries = 2, baseDelayMs = 200 } = {}) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.6,
              topP: 0.8,
              topK: 40,
              maxOutputTokens,
              responseMimeType,
            },
          }),
        }
      );
      if (!response.ok) {
        const status = response.status;
        const errorText = await response.text().catch(() => "");
        if ((status === 429 || status === 503) && attempt < retries) {
          const jitter = Math.floor(Math.random() * 200);
          const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          continue;
        }
        throw new Error(`Gemini API error: ${status} - ${errorText}`);
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n") || "";
      return text;
    } catch (e) {
      lastErr = e;
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

async function generateTemplatesWithGemini(resumeContent, apiKey) {
  // Use a much shorter, compressed resume for the prompt to speed up Gemini
  const compressedResume = compressForModel(resumeContent, 600);

  const prompt = `Generate 5-6 job templates based on this resume. Each template needs:
- name: Job title
- text: Job description (60-80 words)
- matchReason: Why it matches
- keySkills: 3-4 skills
- experienceLevel: Junior/Mid/Senior
- industry: Industry

Resume: ${compressedResume}

Return JSON:
{
  "templates": [
    {
      "name": "Software Engineer",
      "text": "Develop scalable applications using modern frameworks. Collaborate with teams to deliver features. Work with cloud platforms and databases. Competitive salary and growth opportunities.",
      "matchReason": "Programming experience aligns with role requirements",
      "keySkills": ["JavaScript", "React", "Node.js", "AWS"],
      "experienceLevel": "Mid",
      "industry": "Technology"
    }
  ]
}`;

  try {
    const text = await callGemini(prompt, apiKey, { 
      responseMimeType: "application/json", 
      maxOutputTokens: 1200,
      temperature: 0.7,
      topP: 0.9,
      topK: 30
    });

    if (!text.trim()) {
      console.error("Gemini API returned empty response:");
      throw new Error("Empty response from Gemini API");
    }

    try {
      const parsed = parseJsonLoose(text);
      return parsed && parsed.templates ? parsed : JSON.parse(text);
    } catch (parseError) {
      const parsed = parseJsonLoose(text);
      if (parsed && parsed.templates) return parsed;
      console.error("Failed to parse/fix Gemini JSON:", text);
      throw new Error("Invalid JSON response from Gemini - unable to parse or fix");
    }
  } catch (error) {
    console.error("Gemini template generation error:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { resumeContent } = await request.json();

    if (!resumeContent || !resumeContent.trim()) {
      return new Response("Resume content is required", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.", { status: 500 });
    }

    try {
      const templates = await generateTemplatesWithGemini(resumeContent, apiKey);
      return Response.json({ success: true, templates: templates.templates || [] });
    } catch (e) {
      // Graceful fallback rather than 500
      return Response.json({
        success: true,
        templates: [
          {
            name: "Senior Software Engineer",
            text: "Lead development of scalable web applications using modern frameworks like React, Node.js, and cloud platforms. Collaborate with cross-functional teams to deliver high-quality features and mentor junior developers. Drive technical decisions and architecture improvements. Competitive salary, flexible hours, and excellent growth opportunities in a fast-growing company.",
            matchReason: "Strong programming background and experience align with senior development role",
            keySkills: ["JavaScript", "React", "Node.js", "AWS", "Leadership"],
            experienceLevel: "Senior",
            industry: "Technology",
          },
          {
            name: "Full Stack Developer",
            text: "Develop and maintain both front-end and back-end components of web applications. Work with modern frameworks, integrate third-party APIs, and ensure optimal performance and reliability. Collaborate with designers and product managers to deliver exceptional user experiences. Remote-friendly with competitive benefits and professional development opportunities.",
            matchReason: "Full-stack development experience matches comprehensive role requirements",
            keySkills: ["Frontend", "Backend", "APIs", "Database", "UI/UX"],
            experienceLevel: "Mid",
            industry: "Technology",
          },
          {
            name: "DevOps Engineer",
            text: "Design and implement CI/CD pipelines, manage cloud infrastructure, and ensure system reliability and scalability. Work with containerization technologies like Docker and Kubernetes. Monitor system performance and implement automation solutions. Join a dynamic team with cutting-edge technology stack and growth opportunities.",
            matchReason: "Technical expertise and problem-solving skills align with infrastructure role",
            keySkills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Monitoring"],
            experienceLevel: "Mid",
            industry: "Technology",
          },
          {
            name: "Product Manager",
            text: "Lead product strategy and roadmap development for innovative software solutions. Collaborate with engineering, design, and business teams to deliver user-centric products. Analyze market trends and user feedback to drive product decisions. Excellent communication skills and technical background required for this strategic role.",
            matchReason: "Technical background combined with leadership potential suits product management",
            keySkills: ["Product Strategy", "User Research", "Agile", "Analytics", "Communication"],
            experienceLevel: "Mid",
            industry: "Technology",
          },
          {
            name: "Solutions Architect",
            text: "Design and implement enterprise-scale software solutions for clients across various industries. Lead technical discussions, create system architectures, and guide development teams. Work with cloud platforms, microservices, and modern development practices. Travel opportunities and exposure to diverse technical challenges.",
            matchReason: "Strong technical foundation and experience align with architecture responsibilities",
            keySkills: ["System Design", "Cloud Architecture", "Microservices", "Consulting", "Leadership"],
            experienceLevel: "Senior",
            industry: "Consulting",
          },
          {
            name: "Data Engineer",
            text: "Build and maintain data pipelines, ETL processes, and data warehouses to support business intelligence and analytics. Work with big data technologies, cloud platforms, and modern data processing frameworks. Collaborate with data scientists and analysts to deliver actionable insights. Competitive compensation and learning opportunities.",
            matchReason: "Technical skills and analytical mindset match data engineering requirements",
            keySkills: ["Python", "SQL", "ETL", "Cloud Platforms", "Data Modeling"],
            experienceLevel: "Mid",
            industry: "Data & Analytics",
          },
          {
            name: "Technical Lead",
            text: "Lead a team of developers in building innovative software products. Drive technical decisions, code reviews, and best practices implementation. Mentor team members and collaborate with stakeholders to deliver high-quality solutions. Strong leadership skills and technical expertise required for this senior role.",
            matchReason: "Experience and technical depth position you well for leadership responsibilities",
            keySkills: ["Team Leadership", "Technical Architecture", "Mentoring", "Project Management", "Communication"],
            experienceLevel: "Senior",
            industry: "Technology",
          },
          {
            name: "Startup CTO",
            text: "Join an early-stage startup as Chief Technology Officer to build and scale the technical foundation. Lead technology strategy, hire and manage engineering teams, and make key technical decisions. Work directly with founders and investors. Equity participation and significant growth potential in a fast-paced environment.",
            matchReason: "Strong technical background and leadership potential align with startup CTO role",
            keySkills: ["Technology Strategy", "Team Building", "Startup Experience", "Leadership", "Innovation"],
            experienceLevel: "Senior",
            industry: "Startup",
          },
        ],
      });
    }

  } catch (error) {
    console.error("Template generation error:", error);
    // Final guard: respond gracefully
    return Response.json({ success: true, templates: [] });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeContent = searchParams.get("resume");

    if (!resumeContent) {
      return new Response("Resume content parameter is required", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.", { status: 500 });
    }

    try {
      const templates = await generateTemplatesWithGemini(resumeContent, apiKey);
      return Response.json({ success: true, templates: templates.templates || [] });
    } catch (e) {
      return Response.json({ success: true, templates: [] });
    }

  } catch (error) {
    console.error("Template generation error:", error);
    return new Response(`Template generation failed: ${error.message}`, { status: 500 });
  }
}
