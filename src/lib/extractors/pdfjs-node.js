// Node-based PDF.js text extractor. Uses pdfjs-dist in Node with no canvas.
export async function extractWithPdfJs(buffer) {
  const pdfjsLib = await import("pdfjs-dist");
  // Configure worker to use a Node worker script
  const worker = await import("pdfjs-dist/build/pdf.worker.js");
  // Some environments require setting GlobalWorkerOptions
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
  }
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  try {
    let out = "";
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => (typeof it.str === "string" ? it.str : ""));
      out += strings.join(" ") + "\n\n";
    }
    return out.trim();
  } finally {
    try { await doc.destroy(); } catch {}
  }
}


