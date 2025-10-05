"use client";
import { motion } from "framer-motion";

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(99,102,241,0.25),transparent_70%),radial-gradient(800px_400px_at_10%_10%,rgba(34,197,94,0.18),transparent_60%),radial-gradient(700px_400px_at_90%_20%,rgba(14,165,233,0.18),transparent_60%)]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      <Orb className="left-[10%] top-[20%]" color="rgba(99,102,241,0.35)" size={220} delay={0} />
      <Orb className="right-[12%] top-[30%]" color="rgba(14,165,233,0.35)" size={180} delay={2} />
      <Orb className="left-[20%] bottom-[15%]" color="rgba(34,197,94,0.35)" size={200} delay={1} />
      <Grid />
    </div>
  );
}

function Orb({ className = "", color = "rgba(99,102,241,0.35)", size = 180, delay = 0 }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0.3, y: 0 }}
      animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -12, 0] }}
      transition={{ duration: 8, repeat: Infinity, delay }}
      style={{ width: size, height: size, background: color, filter: "blur(30px)", borderRadius: 9999 }}
    />
  );
}

function Grid() {
  return (
    <div className="absolute inset-0 opacity-[0.12]">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" opacity="0.55" />
        <rect width="100%" height="100%" fill="url(#fade)" opacity="0.25" />
      </svg>
    </div>
  );
}


