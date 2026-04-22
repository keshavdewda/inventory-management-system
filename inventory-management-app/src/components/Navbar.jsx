import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, isAuthenticated, logout } from "../utils/auth";
import BrandMark from "./BrandMark";
import useTheme from "../hooks/useTheme";

const getInitials = (name = "User") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const user = getUser();
  const isAuthed = !!isAuthenticated();
  const displayName = user?.name || user?.fullName || user?.email || "User";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="flex h-full w-full items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {isAuthed && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="min-w-0">
            <div className="hidden sm:block">
              <BrandMark />
            </div>
            <div className="sm:hidden">
              <BrandMark compact />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            <span className="hidden md:inline">{theme === "dark" ? "Light" : "Dark"}</span>
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 3.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 0112 3.75zM5.636 5.636a.75.75 0 011.06 0l.354.354a.75.75 0 11-1.06 1.06l-.354-.354a.75.75 0 010-1.06zm12.374 0a.75.75 0 010 1.06l-.354.354a.75.75 0 11-1.06-1.06l.354-.354a.75.75 0 011.06 0zM12 18.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM3.75 12a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 013.75 12zm15 0a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 0118.75 12zM6.343 17.657a.75.75 0 011.06 0l.354.354a.75.75 0 11-1.06 1.06l-.354-.354a.75.75 0 010-1.06zm10.9 0a.75.75 0 010 1.06l-.354.354a.75.75 0 11-1.06-1.06l.354-.354a.75.75 0 011.06 0M12 6.75A5.25 5.25 0 1017.25 12 5.256 5.256 0 0012 6.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M21.752 15.002A9.718 9.718 0 0112 22c-5.385 0-9.75-4.365-9.75-9.75a9.708 9.708 0 013.08-7.062.75.75 0 01.96 1.156A8.209 8.209 0 004 12.25c0 4.556 3.694 8.25 8.25 8.25a8.214 8.214 0 006.86-3.65.75.75 0 011.285.152.75.75 0 01-.643 1.0z" />
              </svg>
            )}
          </button>

          {isAuthed ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-xs font-bold text-white grid place-content-center shadow-sm shadow-cyan-500/30">
                  {getInitials(displayName)}
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="max-w-[140px] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Account</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-500 dark:text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 1112 0" />
                    </svg>
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-slate-800 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
