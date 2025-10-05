import { memo, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  User as UserIcon,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

// Menu items - frozen for performance
const menuItems = Object.freeze([
  {
    href: "/profile",
    icon: UserIcon,
    label: "Profile",
    description: "Manage your account",
  },
  {
    href: "/ats",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "View your applications",
  },
  {
    href: "/settings",
    icon: SettingsIcon,
    label: "Settings",
    description: "Preferences & privacy",
  },
]);

// Animation constants
const DROPDOWN_TRANSITION = {
  type: "spring",
  stiffness: 450,
  damping: 32,
  mass: 0.5,
  restDelta: 0.001,
};

const OPACITY_TRANSITION = { duration: 0.12, ease: [0.4, 0, 0.2, 1] };
const MENU_ITEM_BASE_DELAY = 0.04;
const MENU_ITEM_DELAY_INCREMENT = 0.03;

const UserDropdownMenu = memo(function UserDropdownMenu({
  session,
  setMenuOpen,
  handleSignOut,
}) {
  const handleClose = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  const userImage = useMemo(() => session?.user?.image, [session?.user?.image]);
  const userName = useMemo(
    () => session?.user?.name || "User",
    [session?.user?.name],
  );
  const userEmail = useMemo(() => session?.user?.email, [session?.user?.email]);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={OPACITY_TRANSITION}
        className="fixed inset-0 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* Dropdown menu */}
      <motion.div
        role="menu"
        initial={{ opacity: 0, scale: 0.92, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -6 }}
        transition={{
          ...DROPDOWN_TRANSITION,
          opacity: OPACITY_TRANSITION,
        }}
        style={{
          transformOrigin: "top right",
          willChange: "transform, opacity",
        }}
        className="absolute right-4 top-full mt-6 z-50 w-64 overflow-hidden rounded-2xl border border-[var(--border)]/50 bg-[var(--background)]/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 dark:shadow-black/40"
      >
        {/* User info section */}
        <motion.div
          className="relative px-4 py-4 bg-gradient-to-r from-[var(--muted)]/30 to-[var(--muted)]/10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: MENU_ITEM_BASE_DELAY, duration: 0.15 }}
        >
          <div className="flex items-center gap-3">
            {userImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                className="h-10 w-10 rounded-full"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--foreground)] truncate">
                {userName}
              </div>
              {userEmail && (
                <div className="text-xs text-[var(--foreground)]/60 truncate">
                  {userEmail}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        {/* Menu items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: MENU_ITEM_BASE_DELAY + index * MENU_ITEM_DELAY_INCREMENT,
                duration: 0.18,
              }}
            >
              <Link
                href={item.href}
                onClick={handleClose}
                className="group flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--muted)]/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                role="menuitem"
              >
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-[var(--muted)]/50 group-hover:bg-blue-500/10 transition-colors">
                  <item.icon
                    size={16}
                    className="text-[var(--foreground)]/70 group-hover:text-blue-500 transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--foreground)] transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs text-[var(--foreground)]/50 group-hover:text-[var(--foreground)]/70 transition-colors">
                    {item.description}
                  </div>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-[var(--foreground)]/30 group-hover:text-[var(--foreground)]/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </motion.div>
          ))}
        </div>
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        {/* Logout button */}
        <motion.div
          className="p-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay:
              MENU_ITEM_BASE_DELAY +
              menuItems.length * MENU_ITEM_DELAY_INCREMENT +
              0.02,
            duration: 0.18,
          }}
        >
          <button
            onClick={handleSignOut}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            role="menuitem"
          >
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <LogOut
                size={16}
                className="text-red-500 group-hover:text-red-600 transition-colors"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium">Log out</div>
              <div className="text-xs text-red-500/60 group-hover:text-red-500/80 transition-colors">
                Sign out of your account
              </div>
            </div>
          </button>
        </motion.div>
      </motion.div>
    </>
  );
});

UserDropdownMenu.displayName = "UserDropdownMenu";

export default UserDropdownMenu;
