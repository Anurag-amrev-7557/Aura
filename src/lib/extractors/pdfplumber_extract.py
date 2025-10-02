#!/usr/bin/env python3
import sys
import pdfplumber

def main():
    if len(sys.argv) < 3:
        print("Usage: pdfplumber_extract.py INPUT.pdf OUTPUT.txt", file=sys.stderr)
        sys.exit(2)
    in_path = sys.argv[1]
    out_path = sys.argv[2]

    chunks = []
    with pdfplumber.open(in_path) as pdf:
        for page in pdf.pages:
            try:
                text = page.extract_text(x_tolerance=2, y_tolerance=2, keep_blank_chars=False) or ""
            except Exception:
                text = page.extract_text() or ""
            chunks.append(text.strip())
    full = "\n\n".join([c for c in chunks if c])
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full)

if __name__ == "__main__":
    main()


