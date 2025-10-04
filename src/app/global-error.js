"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            fontFamily:
              "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.7, maxWidth: 720 }}>
            {String(error?.message || "Unknown error")}
          </pre>
          <button
            onClick={() => reset()}
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              border: "1px solid #ccc",
              background: "white",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
