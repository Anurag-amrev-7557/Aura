"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  ArrowUpRight,
  User as UserIcon,
  FileText,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
  Calendar,
  CreditCard,
  Info,
  Mail,
} from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionConfig,
} from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import UserDropdownMenu from "./UserDropdownMenu";

// Performance constants
const ANIMATION_DURATION = 0.15;
const SCROLL_CONFIG = {
  stiffness: 150,
  damping: 24,
  mass: 0.28,
  restDelta: 0.001,
};
const SCROLL_THRESHOLD = 100;

// Animation configs - defined once
const AUTH_BUTTON_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 0.45,
  opacity: { duration: 0.18 },
};

const MOBILE_MENU_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 0.5,
};

const MENU_ITEM_TRANSITION = {
  duration: 0.18,
  ease: [0.4, 0, 0.2, 1],
};

const THEME_ICON_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.28,
};

// Main navigation items configuration
const navigationItems = Object.freeze([
  { href: "/jobs", label: "Jobs", icon: Calendar },
  { href: "/ats", label: "ATS", icon: FileText },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
]);

const mobileMenuItems = Object.freeze([
  { href: "/profile", icon: UserIcon, label: "Profile" },
  { href: "/ats", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
]);

// Highly optimized NavLink component
const NavLink = memo(({ href, children, Icon, pathname }) => {
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group relative hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md px-1 py-1"
    >
      <span className="inline-flex items-center gap-2">
        {Icon && <Icon size={14} className="opacity-80" />}
        <span>{children}</span>
      </span>
      <span
        className={`pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[2px] origin-left rounded-full transition-all duration-200 ease-out ${
          active
            ? "scale-x-100 bg-[var(--foreground)]/70"
            : "scale-x-0 bg-[var(--foreground)]/40 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
});
NavLink.displayName = "NavLink";

// Highly optimized UserAvatar component
const UserAvatar = memo(({ user, onClick, menuOpen }) => {
  const [imageError, setImageError] = useState(false);

  const userInitials = useMemo(
    () => (user?.name || user?.email || "U").slice(0, 2).toUpperCase(),
    [user?.name, user?.email],
  );

  const handleImageError = useCallback(() => setImageError(true), []);
  const handleImageLoad = useCallback(() => setImageError(false), []);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex cursor-pointer items-center justify-center h-9 w-9 rounded-full overflow-hidden bg-[var(--muted)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      aria-label="User menu"
    >
      {user?.image && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={user.name || user.email || "User"}
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <span className="text-xs font-medium">{userInitials}</span>
      )}
    </button>
  );
});
UserAvatar.displayName = "UserAvatar";

// Highly optimized ThemeToggle component
const ThemeToggle = memo(({ theme, setTheme, effectiveTheme, mounted }) => {
  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === "dark" ? "light" : "dark");
  }, [effectiveTheme, setTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] p-2.5 text-sm hover:bg-[var(--muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
      aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} theme`}
    >
      <span
        suppressHydrationWarning
        className="inline-flex items-center justify-center"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {mounted &&
            (effectiveTheme === "dark" ? (
              <motion.span
                key="sun"
                initial={{ rotate: -270, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 270, opacity: 0, scale: 0.8 }}
                transition={THEME_ICON_TRANSITION}
                className="inline-flex"
              >
                <Sun size={17} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: 270, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -270, opacity: 0, scale: 0.8 }}
                transition={THEME_ICON_TRANSITION}
                className="inline-flex"
              >
                <Moon size={17} />
              </motion.span>
            ))}
        </AnimatePresence>
      </span>
    </button>
  );
});
ThemeToggle.displayName = "ThemeToggle";

function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme, systemTheme } = useTheme();
  const effectiveTheme = theme === "system" ? systemTheme : theme;
  const pathname = usePathname();

  // State management
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Refs
  const menuRef = useRef(null);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized scroll animations
  const { scrollY } = useScroll();
  const progress = useSpring(
    useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]),
    SCROLL_CONFIG,
  );

  // Animation values
  const radius = useTransform(progress, [0, 1], [20, 999]);
  const pad = useTransform(progress, [0, 1], [24, 12]);

  // Memoized theme-dependent colors
  const bgColors = useMemo(
    () =>
      effectiveTheme === "dark"
        ? ["rgba(0,0,0,0.00)", "rgba(10,10,10,0.85)"]
        : ["rgba(255,255,255,0.0)", "rgba(255,255,255,0.70)"],
    [effectiveTheme],
  );

  const shadowColors = useMemo(
    () =>
      effectiveTheme === "dark"
        ? ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(0,0,0,0.40)"]
        : ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(0,0,0,0.12)"],
    [effectiveTheme],
  );

  const bg = useTransform(progress, [0, 1], bgColors);
  const shadow = useTransform(progress, [0, 1], shadowColors);
  const ringOpacity = useTransform(progress, [0, 1], [0, 1]);

  // Optimized event handlers
  const handleMenuToggle = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleSignOut = useCallback(() => {
    setMenuOpen(false);
    setMobileOpen(false);
    signOut({ callbackUrl: "/" });
  }, []);

  // Combined effect for menu interactions (click outside, escape key, body scroll)
  useEffect(() => {
    if (!menuOpen && !mobileOpen) return;

    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };

    // Body scroll lock for mobile menu
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    // Use capture phase for better performance
    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [menuOpen, mobileOpen]);

  // Memoized navigation links
  const desktopNavLinks = useMemo(
    () =>
      navigationItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          Icon={item.icon}
          pathname={pathname}
        >
          {item.label}
        </NavLink>
      )),
    [pathname],
  );

  const mobileNavLinks = useMemo(
    () =>
      navigationItems.map((item) => (
        <Link
          key={item.href}
          onClick={handleMobileMenuClose}
          href={item.href}
          className="px-3 py-2 rounded-md hover:bg-[var(--muted)] inline-flex items-center gap-2 transition-colors focus:outline-none"
        >
          <item.icon size={16} />
          {item.label}
        </Link>
      )),
    [handleMobileMenuClose],
  );

  return (
    <MotionConfig transition={{ duration: ANIMATION_DURATION }}>
      <header className="sticky top-4 z-40 w-full">
        <motion.div
          style={{
            borderRadius: radius,
            boxShadow: shadow,
            backgroundColor: bg,
            paddingLeft: pad,
            paddingRight: pad,
            willChange: "border-radius, box-shadow, background-color, padding",
            transform: "translateZ(0)",
          }}
          className="mx-auto max-w-7xl h-14 flex items-center rounded-full justify-between backdrop-blur-md"
        >
          <motion.div
            aria-hidden
            style={{ opacity: ringOpacity }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-black/5 dark:ring-white/20"
          />

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none rounded-md"
            >
              <div className="h-9 w-9 flex-shrink-0">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="logoGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{
                          stopColor:
                            effectiveTheme === "dark" ? "#60A5FA" : "#3B82F6",
                          stopOpacity: 1,
                        }}
                      />
                      <stop
                        offset="100%"
                        style={{
                          stopColor:
                            effectiveTheme === "dark" ? "#3B82F6" : "#1E40AF",
                          stopOpacity: 1,
                        }}
                      />
                    </linearGradient>
                    <filter
                      id="glow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Main circle background */}
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="url(#logoGradient)"
                    filter="url(#glow)"
                  />

                  {/* Inner elements representing connection/networking */}
                  <g fill="white" opacity="0.95">
                    {/* Central hub */}
                    <circle cx="20" cy="20" r="3" />

                    {/* Connection nodes */}
                    <circle cx="12" cy="14" r="2" />
                    <circle cx="28" cy="14" r="2" />
                    <circle cx="14" cy="26" r="2" />
                    <circle cx="26" cy="26" r="2" />

                    {/* Connection lines */}
                    <line
                      x1="20"
                      y1="20"
                      x2="12"
                      y2="14"
                      stroke="white"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                    <line
                      x1="20"
                      y1="20"
                      x2="28"
                      y2="14"
                      stroke="white"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                    <line
                      x1="20"
                      y1="20"
                      x2="14"
                      y2="26"
                      stroke="white"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                    <line
                      x1="20"
                      y1="20"
                      x2="26"
                      y2="26"
                      stroke="white"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />

                    {/* Subtle AI/tech accent */}
                    <path
                      d="M20 8 L22 12 L18 12 Z"
                      fill="white"
                      opacity="0.7"
                    />
                  </g>
                </svg>
              </div>
              <span className="font-semibold tracking-tight text-[19.2px]">
                Aura
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-8 text-[15px]"
            role="navigation"
          >
            {desktopNavLinks}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-colors focus:outline-none"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <MenuIcon size={18} />
          </button>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle
              theme={theme}
              setTheme={setTheme}
              effectiveTheme={effectiveTheme}
              mounted={mounted}
            />

            <AnimatePresence mode="wait">
              {status === "loading" ? null : session?.user ? (
                <div
                  key="user-menu"
                  className="relative flex items-center justify-center"
                  ref={menuRef}
                >
                  <UserAvatar
                    user={session.user}
                    onClick={handleMenuToggle}
                    menuOpen={menuOpen}
                  />

                  <AnimatePresence mode="wait">
                    {menuOpen && (
                      <UserDropdownMenu
                        session={session}
                        setMenuOpen={setMenuOpen}
                        handleSignOut={handleSignOut}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  key="auth-buttons"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={AUTH_BUTTON_TRANSITION}
                  className="flex items-center gap-3"
                >
                  <Link
                    href="/login"
                    className="text-sm transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md px-2 py-1"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90 transition-opacity dark:bg-white dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                  >
                    Sign up <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <motion.div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleMobileMenuClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={MOBILE_MENU_TRANSITION}
                className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[var(--background)]/95 backdrop-blur-md border-l border-[var(--border)] shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="font-semibold">Menu</div>
                  <button
                    onClick={handleMobileMenuClose}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-colors focus:outline-none"
                    aria-label="Close menu"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>

                <div className="h-px bg-[var(--border)]" />

                <div className="p-2 flex flex-col text-sm gap-1">
                  {mobileNavLinks}
                </div>

                <div className="h-px bg-[var(--border)]" />

                {/* Mobile theme toggle */}
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Theme</span>
                    <ThemeToggle
                      theme={theme}
                      setTheme={setTheme}
                      effectiveTheme={effectiveTheme}
                      mounted={mounted}
                    />
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]" />

                {/* Mobile auth section */}
                <div className="p-2">
                  {session?.user ? (
                    <div className="space-y-1">
                      {/* User info in mobile */}
                      <div className="px-3 py-3 bg-[var(--muted)]/30 rounded-xl mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {(session.user.name || session.user.email || "U")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--foreground)] truncate">
                              {session.user.name || "User"}
                            </div>
                            {session.user.email && (
                              <div className="text-xs text-[var(--foreground)]/60 truncate">
                                {session.user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      {mobileMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          onClick={handleMobileMenuClose}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--muted)] transition-colors focus:outline-none"
                        >
                          <item.icon
                            size={18}
                            className="text-[var(--foreground)]/70"
                          />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}

                      {/* Logout button */}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full text-left px-3 py-2.5 mt-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors focus:outline-none"
                      >
                        <LogOut size={18} className="text-red-500" />
                        <span className="font-medium">Log out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        onClick={handleMobileMenuClose}
                        href="/login"
                        className="block px-3 py-2.5 rounded-md hover:bg-[var(--muted)] transition-colors focus:outline-none"
                      >
                        Log in
                      </Link>
                      <Link
                        onClick={handleMobileMenuClose}
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90 dark:bg-white dark:text-black transition-opacity focus:outline-none"
                      >
                        Sign up <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}

export default memo(Navbar);
