import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../utils/auth";
import { formatCurrencyValue, useAppCurrency } from "../utils/currency";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "--";

const OrdersList = () => {
  const role = getUser()?.role || "viewer";
  const canManage = role === "admin" || role === "manager";
  const currency = useAppCurrency();
  const formatCurrency = (value) => formatCurrencyValue(value, currency);

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/orders");
        const data = response?.data || [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    if (!lowered) return orders;
    return orders.filter((order) => {
      return (
        order.orderNumber?.toLowerCase().includes(lowered) ||
        order.productName?.toLowerCase().includes(lowered) ||
        order.partner?.toLowerCase().includes(lowered)
      );
    });
  }, [orders, search]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Orders
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
            All Orders
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track purchase and sales movements with live stock adjustments.
          </p>
        </div>
        {canManage && (
          <Link
            to="/orders/new"
            className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
          >
            Create Order
          </Link>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order number, product, or partner"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading && <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">Loading orders...</div>}
        {error && !loading && <div className="px-6 py-6 text-sm text-rose-600 dark:text-rose-200">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-950 dark:text-slate-500">
            <tr>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Partner</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-slate-100 text-slate-600 dark:border-slate-800 dark:text-slate-300"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{order.createdBy?.name || "System"}</div>
                </td>
                <td className="px-6 py-4 capitalize">{order.type}</td>
                <td className="px-6 py-4">{order.productName}</td>
                <td className="px-6 py-4">{order.partner}</td>
                <td className="px-6 py-4">{order.quantity}</td>
                <td className="px-6 py-4">{formatCurrency(order.totalValue)}</td>
                <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No orders found yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
