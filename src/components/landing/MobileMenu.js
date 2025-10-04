import { memo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon, ArrowUpRight, User as UserIcon, LayoutDashboard, Settings as SettingsIcon, LogOut } from 'lucide-react';

const MobileMenu = memo(({ 
  mobileOpen, 
  handleMobileMenuClose, 
  mobileNavLinks, 
  ThemeToggle,
  theme, 
  setTheme, 
  effectiveTheme, 
  mounted, 
  status, 
  session, 
  handleSignOut 
}) => {
  if (!mobileOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 md:hidden"
    >
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={handleMobileMenuClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[var(--background)]/95 backdrop-blur-md border-l border-[var(--border)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex items-center justify-between p-4">
          <div className="font-semibold">Menu</div>
          <button
            onClick={handleMobileMenuClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
          {status === "authenticated" ? (
            <div className="space-y-1">
              {/* User info in mobile */}
              <div className="px-3 py-3 bg-[var(--muted)]/30 rounded-xl mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {(session.user.name || session.user.email || "U").slice(0, 2).toUpperCase()}
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
              {[
                { href: "/profile", icon: UserIcon, label: "Profile" },
                { href: "/ats", icon: LayoutDashboard, label: "Dashboard" },
                { href: "/settings", icon: SettingsIcon, label: "Settings" }
              ].map((item) => (
                <Link 
                  key={item.href}
                  onClick={handleMobileMenuClose} 
                  href={item.href} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <item.icon size={18} className="text-[var(--foreground)]/70" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Logout button */}
              <button 
                onClick={handleSignOut} 
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 mt-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                <LogOut size={18} className="text-red-500" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="mobile-auth-buttons"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25, 
                  mass: 0.5,
                  opacity: { duration: 0.2 }
                }}
                className="space-y-1"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                >
                  <Link 
                    onClick={handleMobileMenuClose} 
                    href="/login" 
                    className="block px-3 py-2 rounded-md hover:bg-[var(--muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Log in
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.2, 
                    duration: 0.3, 
                    ease: "easeOut",
                    scale: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                >
                  <Link 
                    onClick={handleMobileMenuClose} 
                    href="/signup" 
                    className="mt-1 inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90 dark:bg-white dark:text-black transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Sign up <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu;
