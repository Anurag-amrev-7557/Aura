"use client";
import { useState, useRef, useEffect } from "react";

export default function SortDropdown({ options = [], value, onChange, label = "Sort" }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    function onDocClick(e) {
      if (
        !btnRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      ) {
        // trigger closing animation before unmount
        setClosing(true);
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (open && activeIndex > -1) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, open]);

  const selected = options.find((o) => o.value === value) || options[0];

  const openAndFocus = (index = 0) => {
    setOpen(true);
    setActiveIndex(index);
  };

  // handle animated close/unmount: when toggling closed, play closing animation then unmount
  useEffect(() => {
    if (!open && closing) {
      const t = setTimeout(() => {
        setClosing(false);
        setIsMounted(false);
      }, 220);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, closing]);

  return (
    <div className="relative inline-block text-sm">
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          if (open) {
            setClosing(true);
            setOpen(false);
          } else {
            // Ensure list is mounted first so the entry transition can run
            setClosing(false);
            setIsMounted(true);
            // Next frame: open so transition classes apply
            requestAnimationFrame(() => {
              setOpen(true);
              setActiveIndex(-1);
            });
          }
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openAndFocus(0);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openAndFocus(options.length - 1);
            } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (open) {
              setClosing(true);
              setOpen(false);
            } else {
              // mount then open for smooth animation
              setClosing(false);
              setIsMounted(true);
              requestAnimationFrame(() => setOpen(true));
            }
          }
        }}
        className="flex items-center gap-2 py-2 px-4 rounded-full border border-[var(--border)] bg-[var(--background)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--muted)]"
      >
  <span className="min-w-[120px] text-center truncate">{selected?.label ?? label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

  {(isMounted || closing) && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={activeIndex > -1 ? `sort-opt-${activeIndex}` : undefined}
          className={`absolute right-0 mt-2 w-56 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all duration-200 ${open && !closing ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1"}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, options.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Home") {
              e.preventDefault();
              setActiveIndex(0);
            } else if (e.key === "End") {
              e.preventDefault();
              setActiveIndex(options.length - 1);
            } else if (e.key === "Escape") {
              e.preventDefault();
              // trigger close animation
              setClosing(true);
              setOpen(false);
              btnRef.current?.focus();
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (activeIndex > -1) {
                const opt = options[activeIndex];
                onChange(opt.value);
                setClosing(true);
                setOpen(false);
                btnRef.current?.focus();
              }
            }
          }}
        >
          {options.map((opt, idx) => (
            <li
              id={`sort-opt-${idx}`}
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              tabIndex={-1}
              ref={(el) => (itemRefs.current[idx] = el)}
              onClick={() => {
                onChange(opt.value);
                setClosing(true);
                setOpen(false);
                btnRef.current?.focus();
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`px-4 py-2 cursor-pointer hover:bg-[var(--muted)]/20 ${opt.value === value ? "font-semibold bg-[var(--muted)]/10" : ""}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
