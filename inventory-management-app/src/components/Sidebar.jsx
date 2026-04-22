import { NavLink } from "react-router-dom";
import { getUser } from "../utils/auth";

const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  </svg>
);

const IconBox = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8.5L12 4l8 4.5v7L12 20l-8-4.5v-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8.5l8 4.5 8-4.5" />
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconTruck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 3h14v13H1z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8h4l3 3v5h-7z" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

const IconShopping = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2l1.5 4.5M21 6H8.3l1.5 9h8.9L21 6z" />
    <circle cx="10" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
  </svg>
);

const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m8 10V4m8 16v-7" />
  </svg>
);

const IconCog = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75A2.25 2.25 0 1012 14.25 2.25 2.25 0 1012 9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.43 12.98a7.97 7.97 0 000-1.96l2.02-1.57a.5.5 0 00.12-.64l-1.91-3.3a.5.5 0 00-.6-.22l-2.38.96a8.1 8.1 0 00-1.7-.98l-.36-2.5A.5.5 0 0014.12 2h-3.24a.5.5 0 00-.5.43l-.36 2.5a8.1 8.1 0 00-1.7.98l-2.38-.96a.5.5 0 00-.6.22l-1.91 3.3a.5.5 0 00.12.64l2.02 1.57a7.97 7.97 0 000 1.96l-2.02 1.57a.5.5 0 00-.12.64l1.91 3.3a.5.5 0 00.6.22l2.38-.96a8.1 8.1 0 001.7.98l.36 2.5a.5.5 0 00.5.43h3.24a.5.5 0 00.5-.43l.36-2.5a8.1 8.1 0 001.7-.98l2.38.96a.5.5 0 00.6-.22l1.91-3.3a.5.5 0 00-.12-.64l-2.02-1.57z" />
  </svg>
);

const Sidebar = ({ onNavigate }) => {
  const role = getUser()?.role || "viewer";
  const canManage = role === "admin" || role === "manager";
  const isAdmin = role === "admin";

  const sectionLinks = [
    {
      title: "Overview",
      links: [{ to: "/dashboard", label: "Dashboard", icon: <IconGrid /> }],
    },
    {
      title: "Operations",
      links: [
        { to: "/products", label: "Products", icon: <IconBox /> },
        ...(canManage ? [{ to: "/products/new", label: "New Product", icon: <IconBox /> }] : []),
        { to: "/products/categories", label: "Categories", icon: <IconBox /> },
        { to: "/suppliers", label: "Suppliers", icon: <IconTruck /> },
        ...(canManage ? [{ to: "/suppliers/new", label: "New Supplier", icon: <IconTruck /> }] : []),
        { to: "/orders", label: "Orders", icon: <IconShopping /> },
        ...(canManage ? [{ to: "/orders/new", label: "New Order", icon: <IconShopping /> }] : []),
      ],
    },
    {
      title: "Reports",
      links: [
        { to: "/reports/sales", label: "Sales Report", icon: <IconChart /> },
        { to: "/reports/inventory", label: "Inventory Report", icon: <IconChart /> },
      ],
    },
    {
      title: "System",
      links: [
        ...(isAdmin
          ? [
              { to: "/users", label: "Users", icon: <IconUsers /> },
              { to: "/users/new", label: "New User", icon: <IconUsers /> },
            ]
          : []),
        { to: "/settings", label: "Settings", icon: <IconCog /> },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white/95 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Logged In As</p>
        <p className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-white">{role}</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
        {sectionLinks.map((section) =>
          section.links.length ? (
            <div key={section.title} className="space-y-1.5">
              <p className="px-2 text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      [
                        "group flex items-center justify-between rounded-lg px-2.5 py-2 transition duration-200 hover:translate-x-0.5",
                        isActive
                          ? "bg-slate-900 text-white ring-1 ring-slate-700/40 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.75)] dark:bg-cyan-500 dark:text-slate-950 dark:ring-cyan-300/40 dark:shadow-[0_10px_24px_-14px_rgba(34,211,238,0.8)]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                      ].join(" ")
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="opacity-90">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5 opacity-45"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                    </svg>
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
