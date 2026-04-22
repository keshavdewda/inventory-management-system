import { useEffect, useState } from "react";
import api from "../services/api";

const InventoryReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/reports/inventory");
        setReport(response?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load inventory report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const summary = report?.summary || {};
  const lowStockItems = report?.lowStockItems || [];

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Reports</p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Inventory Report</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Stock levels and low inventory alerts based on live products.</p>
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading inventory report...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Products</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{summary.totalProducts || 0}</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Stock Units</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{summary.totalUnits || 0}</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Low / Out of Stock</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{summary.lowStockCount || 0} / {summary.outOfStockCount || 0}</h3>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Low Stock Items</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-950 dark:text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Reorder Level</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item._id} className="border-t border-slate-100 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4">{item.category || "--"}</td>
                      <td className="px-6 py-4 text-rose-500">{item.quantity}</td>
                      <td className="px-6 py-4">{item.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            {lowStockItems.length === 0 && (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No low stock items right now.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryReport;
