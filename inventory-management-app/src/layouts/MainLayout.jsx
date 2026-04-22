import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const body = document.body;
    body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar onMenuToggle={() => setMobileMenuOpen((open) => !open)} />

      <div className="pt-16">
        <div className="hidden lg:fixed lg:inset-y-16 lg:left-0 lg:block lg:w-60">
          <Sidebar />
        </div>

        <main className="min-h-[calc(100vh-4rem)] lg:ml-60">
          <div className="space-y-4 px-3 py-4 sm:space-y-4 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
            <Outlet />
          </div>
        </main>
      </div>

      <div
        className={[
          "fixed inset-0 z-40 transition duration-200 lg:hidden",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className={[
            "absolute inset-0 bg-slate-900/45 transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <div
          className={[
            "absolute left-0 top-16 h-[calc(100%-4rem)] transform transition-transform duration-200",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar onNavigate={closeMobileMenu} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
