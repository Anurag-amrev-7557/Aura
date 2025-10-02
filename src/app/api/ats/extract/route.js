import { NextResponse } from "next/server";
export const runtime = "nodejs";
// Ensure CommonJS require is available in this module scope when running in Node.js runtime
// eslint-disable-next-line no-eval
const nodeRequire = typeof require === "function" ? require : (0, eval)("require");
// Lazy import helpers to avoid bundling cost in edge/runtime
async function tryPdfPlumber(buffer) {
  try {
    const { extractWithPdfPlumber } = await import("../../../../lib/extractors/pdfplumber-node.js");
    return await extractWithPdfPlumber(buffer);
  } catch (_) {
    return null;
  }
}

async function tryPdfJs(buffer) {
  try {
    const { extractWithPdfJs } = await import("../../../../lib/extractors/pdfjs-node.js");
    return await extractWithPdfJs(buffer);
  } catch (_) {
    return null;
  }
}

// Helper function to format structured resume data as text
function formatResumeDataAsText(data) {
  let text = "";
  
  if (data.name) {
    text += `Name: ${data.name}\n\n`;
  }
  
  if (data.email) {
    text += `Email: ${data.email}\n\n`;
  }
  
  if (data.skills && Array.isArray(data.skills)) {
    text += `Skills: ${data.skills.join(", ")}\n\n`;
  }
  
  if (data.education && Array.isArray(data.education)) {
    text += "Education:\n";
    data.education.forEach(edu => {
      text += `- ${edu.name}`;
      if (edu.dates) text += ` (${edu.dates})`;
      text += "\n";
    });
    text += "\n";
  }
  
  if (data.experience && Array.isArray(data.experience)) {
    text += "Experience:\n";
    data.experience.forEach(exp => {
      text += `- ${exp.title}`;
      if (exp.organization) text += ` at ${exp.organization}`;
      if (exp.location) text += ` (${exp.location})`;
      if (exp.dates) text += ` (${exp.dates})`;
      text += "\n";
    });
    text += "\n";
  }
  
  return text.trim();
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new NextResponse("Expected multipart/form-data", { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return new NextResponse("Missing file", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = file.name || "upload";
    const ext = (filename.split(".").pop() || "").toLowerCase();

    // For non-PDF files, try resume parser API first if available
    const apiKey = process.env.RESUME_PARSER_API_KEY;
    if (apiKey && ["docx", "doc"].includes(ext)) {
      try {
        const response = await fetch('https://api.apilayer.com/resume_parser/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'apikey': apiKey
          },
          body: buffer
        });

        if (response.ok) {
          const parsedData = await response.json();
          return NextResponse.json({ 
            text: formatResumeDataAsText(parsedData),
            structured: parsedData,
            source: 'api'
          });
        }
      } catch (apiError) {
        console.warn('Resume parser API failed, falling back to local parsing:', apiError.message);
        // Continue to local parsing
      }
    }

    let text = "";
    if (ext === "pdf") {
      // 1) Try Python pdfplumber for layout-accurate extraction
      const plumber = await tryPdfPlumber(buffer);
      if (plumber && typeof plumber === "string" && plumber.trim()) {
        return NextResponse.json({ text: plumber.trim(), source: "pdfplumber" });
      }
      // 2) Try pdf.js text extraction
      const pdfjs = await tryPdfJs(buffer);
      if (pdfjs && typeof pdfjs === "string" && pdfjs.trim()) {
        return NextResponse.json({ text: pdfjs.trim(), source: "pdfjs" });
      }
      try {
        const PDFParser = (nodeRequire("pdf2json")).default || nodeRequire("pdf2json");
        const parser = new PDFParser();
        const parsed = await new Promise((resolve, reject) => {
          parser.on("pdfParser_dataError", (errData) => reject(errData.parserError || errData));
          parser.on("pdfParser_dataReady", (pdfData) => resolve(pdfData));
          parser.parseBuffer(buffer);
        });
        // Flatten text items
        let out = "";
        for (const page of parsed?.formImage?.Pages || []) {
          const texts = [];
          for (const textObj of page.Texts || []) {
            for (const r of textObj.R || []) {
              if (typeof r.T === "string") {
                try { texts.push(decodeURIComponent(r.T)); } catch { texts.push(r.T); }
              }
            }
          }
          out += texts.join(" ") + "\n\n";
        }
        text = out.trim();
      } catch (e) {
        return new NextResponse("Failed to parse PDF: " + (e?.message || e), { status: 422 });
      }
    } else if (ext === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (ext === "rtf") {
      // Lightweight RTF to text: remove control words, groups, and decode escapes
      const raw = buffer.toString("utf8");
      text = raw
        .replace(/\\'[0-9a-fA-F]{2}/g, (m) => {
          try { return Buffer.from(m.slice(2), 'hex').toString('latin1'); } catch { return ' '; }
        })
        .replace(/\\u-?\d+\??/g, " ")
        .replace(/\\[a-zA-Z]+-?\d*\s?/g, "")
        .replace(/[{}]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    } else if (ext === "doc") {
      // Legacy .doc not supported without native tools; ask user to convert to .docx
      return new NextResponse("Unsupported .doc file. Please convert to .docx and retry.", { status: 415 });
    } else if (["png", "jpg", "jpeg"].includes(ext)) {
      // OCR via tesseract.js
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker();
      try {
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        const { data } = await worker.recognize(Buffer.from(buffer));
        text = data?.text || "";
      } finally {
        await worker.terminate();
      }
    } else if (ext === "tex") {
      // Simple LaTeX extractor: strip commands and keep text blocks
      const raw = buffer.toString("utf8");
      text = raw
        .replace(/%.*$/gm, "")
        .replace(/\\begin\{.*?\}[\s\S]*?\\end\{.*?\}/g, " ")
        .replace(/\\[a-zA-Z@]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    } else if (["txt", "md", "json"].includes(ext)) {
      text = buffer.toString("utf8");
    } else {
      return new NextResponse("Unsupported file type", { status: 415 });
    }

    return NextResponse.json({ 
      text,
      source: 'local'
    });
  } catch (err) {
    return new NextResponse(err?.message || "Extraction error", { status: 500 });
  }
}
