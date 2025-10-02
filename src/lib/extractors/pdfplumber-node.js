// Node wrapper to call Python pdfplumber for high-fidelity PDF text extraction
export async function extractWithPdfPlumber(buffer) {
  const { spawn } = await import("node:child_process");
  const { tmpdir } = await import("node:os");
  const { mkdtemp, writeFile, readFile, rm } = await import("node:fs/promises");
  const { sep } = await import("node:path");

  const dir = await mkdtemp(tmpdir() + sep + "resume-");
  const inPath = dir + sep + "input.pdf";
  const outPath = dir + sep + "output.txt";
  await writeFile(inPath, buffer);

  try {
    const pythonBin = process.env.PYTHON_BIN || "python3";
    const scriptPath = new URL("./pdfplumber_extract.py", import.meta.url).pathname;
    await new Promise((resolve, reject) => {
      const proc = spawn(pythonBin, [scriptPath, inPath, outPath], { stdio: ["ignore", "pipe", "pipe"] });
      let stderr = "";
      proc.stderr.on("data", (d) => { stderr += String(d || ""); });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("pdfplumber exit code " + code + (stderr ? ": " + stderr : "")));
      });
    });
    const text = await readFile(outPath, "utf8");
    return text;
  } finally {
    try { await rm(dir, { recursive: true, force: true }); } catch {}
  }
}


