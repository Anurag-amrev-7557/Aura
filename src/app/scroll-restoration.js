"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration() {
  const pathname = usePathname();

  // Restore saved scroll position on back/forward navigations
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("scrollRestoration" in window.history)) return;

    const { history } = window;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    let shouldRestore = false;
    const onPopState = () => {
      shouldRestore = true;
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      history.scrollRestoration = previous;
    };
  }, []);

  // On route change, if it's a new push, scroll to top; if pop, browser handles
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Defer to next frame to let layout settle to avoid jank
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}


