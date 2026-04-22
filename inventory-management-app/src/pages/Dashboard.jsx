import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import Counter from "../components/Counter";
import api from "../services/api";
import { getUser } from "../utils/auth";
import {
  formatCurrencyValue,
  getCurrencySymbol,
  useAppCurrency,
} from "../utils/currency";

const formatDateTime = (value) => {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const SalesTooltip = ({ active, payload, label, formatCurrency }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload || {};

  return (
    <div className="max-w-[160px] rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30">
      <p className="text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{formatCurrency(data.revenue)}</p>
      <p className="text-slate-500 dark:text-slate-400">{data.orders || 0} orders</p>
    </div>
  );
};

const Dashboard = () => {
  const user = getUser();
  const displayName = user?.name || user?.email || "User";
  const currency = useAppCurrency();
  const currencySymbol = getCurrencySymbol(currency);
  const formatCurrency = (value) =>
    formatCurrencyValue(value, currency, { maximumFractionDigits: 0 });

  const [dashboard, setDashboard] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [dashboardResponse, salesResponse] = await Promise.all([
          api.get("/dashboard"),
          api.get("/reports/sales"),
        ]);
        setDashboard(dashboardResponse?.data || null);
        setSalesReport(salesResponse?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const summary = dashboard?.summary || {};
  const salesSummary = salesReport?.summary || {};
  const chartData = useMemo(
    () =>
      (salesReport?.chart || []).map((point) => ({
        ...point,
        revenue: Number(point?.revenue) || 0,
        orders: Number(point?.orders) || 0,
      })),
    [salesReport?.chart]
  );
  const hasSalesData = chartData.length > 0;
  const latestMonthLabel = chartData[chartData.length - 1]?.label || "This month";
  const salesPeriodLabel = useMemo(() => {
    if (!chartData.length) return "No sales data";
    if (chartData.length === 1) return latestMonthLabel;
    return `Last ${chartData.length} months`;
  }, [chartData.length, latestMonthLabel]);

  const revenueAxis = useMemo(() => {
    const maxRevenue = chartData.reduce((max, point) => Math.max(max, point.revenue), 0);

    if (maxRevenue <= 0) {
      return { yMax: 1000, ticks: [0, 250, 500, 750, 1000] };
    }

    const roughStep = maxRevenue / 5;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalized = roughStep / magnitude;

    let multiplier = 1;
    if (normalized <= 1) multiplier = 1;
    else if (normalized <= 2) multiplier = 2;
    else if (normalized <= 5) multiplier = 5;
    else multiplier = 10;

    const step = multiplier * magnitude;
    const yMax = Math.ceil(maxRevenue / step) * step;
    const ticks = [];

    for (let tick = 0; tick <= yMax; tick += step) {
      ticks.push(tick);
    }

    return { yMax, ticks };
  }, [chartData]);

  const formatAxisCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);

  const stats = useMemo(
    () => [
      {
        label: "Revenue",
        value: Math.round(salesSummary.totalRevenue || summary.totalSales || 0),
        prefix: currencySymbol,
        note:
          hasSalesData && chartData.length === 1
            ? `${salesPeriodLabel} performance`
            : hasSalesData
              ? salesPeriodLabel
              : "No sales data yet",
        gradient: "from-cyan-500/20 via-cyan-400/5 to-transparent",
      },
      {
        label: "Orders",
        value: summary.totalOrders ?? 0,
        note: "Total tracked",
        gradient: "from-blue-500/20 via-blue-400/5 to-transparent",
      },
      {
        label: "Products",
        value: summary.totalProducts ?? 0,
        note: "Active catalog",
        gradient: "from-indigo-500/20 via-indigo-400/5 to-transparent",
      },
      {
        label: "Low Stock",
        value: summary.lowStockItems ?? 0,
        note: "Need attention",
        gradient: "from-rose-500/15 via-rose-400/5 to-transparent",
      },
    ],
    [
      currencySymbol,
      chartData.length,
      hasSalesData,
      salesPeriodLabel,
      salesSummary.totalRevenue,
      summary.lowStockItems,
      summary.totalOrders,
      summary.totalProducts,
      summary.totalSales,
    ]
  );

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="polish-card polish-transition relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/85"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-500/20" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/20" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Overview</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
              Welcome back, {displayName}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {dashboard?.companyName || "Inventory workspace"} performance and activity, updated live.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2 text-right dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Average Order</p>
            <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">{formatCurrency(salesSummary.averageOrderValue || 0)}</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          Loading dashboard insights...
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {error}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                key={stat.label}
                className="polish-card polish-transition group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl hover:shadow-cyan-500/10 dark:border-slate-800/80 dark:bg-slate-900/85 dark:hover:shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,255,200,0.15)]"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-[2rem] font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                    {stat.prefix ? stat.prefix : ""}
                    <Counter value={Number(stat.value) || 0} />
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{stat.note}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="polish-card polish-transition rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/85"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Sales Performance</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {hasSalesData
                      ? chartData.length === 1
                        ? `Monthly revenue trend for ${salesPeriodLabel}`
                        : `Monthly revenue trend for ${salesPeriodLabel.toLowerCase()}`
                      : "No sales data available"}
                  </p>
                </div>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                  {chartData.length || 0} data points
                </span>
              </div>

              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Revenue includes only sales orders (not purchases)
              </p>

              {!hasSalesData ? (
                <div className="flex h-[235px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No sales data available
                </div>
              ) : (
                <div
                  className="h-[235px] w-full select-none"
                  style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <ResponsiveContainer width="100%" height="100%" style={{ outline: "none" }}>
                    <BarChart
                      data={chartData}
                      barSize={28}
                      barCategoryGap="30%"
                      margin={{ top: 6, right: 8, left: -10, bottom: 0 }}
                      onMouseDown={() => {}}
                      onMouseMove={() => {}}
                      onMouseUp={() => {}}
                    >
                      <defs>
                        <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.75} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.24} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[0, revenueAxis.yMax]}
                        ticks={revenueAxis.ticks}
                        allowDecimals={false}
                        tickFormatter={formatAxisCurrency}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                        tickMargin={4}
                      />
                      <Tooltip
                        trigger="hover"
                        cursor={false}
                        content={<SalesTooltip formatCurrency={formatCurrency} />}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="url(#salesBarGradient)"
                        radius={[6, 6, 0, 0]}
                        minPointSize={4}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="polish-card polish-transition rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/85"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Recent Activity</h3>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Live
                </span>
              </div>

              <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {(dashboard?.recentActivity || []).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="polish-transition rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition hover:border-cyan-200 hover:bg-cyan-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-500/10 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,255,200,0.15)]"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(item.createdAt)}</p>
                  </div>
                ))}

                {(dashboard?.recentActivity || []).length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    Activity will appear here once products and orders start moving.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
