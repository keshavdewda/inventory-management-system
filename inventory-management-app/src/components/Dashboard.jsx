const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Welcome back
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Stay ahead of stock, suppliers, and orders with a clear snapshot of today&apos;s activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            Generate Report
          </button>
          <button className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5">
            Quick Restock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          { label: "Total Products", value: "1,250", note: "+6% this week" },
          { label: "Suppliers", value: "48", note: "3 awaiting review" },
          { label: "Orders Today", value: "320", note: "Up 14% vs yesterday" },
          { label: "Low Stock", value: "12", note: "Requires attention" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                {stat.value}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {stat.note}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Sales Chart
            </h3>
            <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
              Last 7 Days
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Revenue is trending upward with steady order volume across categories.
          </p>
          <div className="mt-6">
            <div className="flex h-48 items-end gap-3">
              {[45, 65, 52, 78, 60, 92, 70].map((value, index) => (
                <div key={index} className="flex-1">
                  <div
                    className="rounded-t-lg bg-gradient-to-t from-emerald-500 via-teal-500 to-cyan-500 shadow-md shadow-emerald-500/20"
                    style={{ height: `${value}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg shadow-slate-900/20 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
          <h3 className="text-xl font-semibold">Recent Activities</h3>
          <p className="mt-2 text-sm text-slate-300">
            Latest actions across orders, stock, and suppliers.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Order #4832 shipped to Metro Retail",
              "Inventory restock approved for Packaging",
              "Supplier Atlas Co. updated pricing",
              "Cycle count completed for Zone B",
            ].map((item) => (
              <li key={item} className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
