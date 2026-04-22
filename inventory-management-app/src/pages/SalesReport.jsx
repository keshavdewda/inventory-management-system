import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";
import {
  formatCompactCurrencyValue,
  formatCurrencyValue,
  useAppCurrency,
} from "../utils/currency";

const SalesTooltip = ({ active, payload, label, formatCurrency }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload || {};

  return (
    <div className="max-w-[160px] rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30">
      <p className="font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
        {formatCurrency(point.revenue)}
      </p>
      <p className="text-slate-500 dark:text-slate-400">{point.orders || 0} orders</p>
    </div>
  );
};

const SalesReport = () => {
  const currency = useAppCurrency();
  const formatCurrency = (value) =>
    formatCurrencyValue(value, currency, { maximumFractionDigits: 0 });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/reports/sales");
        setReport(response?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load sales report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const chart = report?.chart || [];
  const summary = report?.summary || {};
  const hasSalesData = chart.length > 0;
  const latestMonthLabel = chart[chart.length - 1]?.label || "This month";
  const periodLabel = useMemo(() => {
    if (!chart.length) return "No sales data";
    if (chart.length === 1) return latestMonthLabel;
    return `Last ${chart.length} months`;
  }, [chart.length, latestMonthLabel]);

  const averageMonthlyRevenue = useMemo(() => {
    if (!chart.length) return 0;
    const total = chart.reduce((sum, item) => sum + (item.revenue || 0), 0);
    return total / chart.length;
  }, [chart]);

  return (
    <div className="w-full space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Reports</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sales Report</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Revenue and order trends from actual sales activity.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading sales report...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 dark:border-slate-800 dark:bg-slate-900/85 dark:hover:shadow-cyan-500/20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-cyan-400/5 to-transparent" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(summary.totalRevenue)}
              </h3>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900/85 dark:hover:shadow-blue-500/20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/15 via-blue-400/5 to-transparent" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Sales Orders</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {summary.totalOrders || 0}
              </h3>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/85 dark:hover:shadow-indigo-500/20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-indigo-400/5 to-transparent" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Top Category</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {summary.topCategory || "--"}
              </h3>
              <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Avg order {formatCurrency(summary.averageOrderValue || 0)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Revenue Trend</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {hasSalesData
                    ? chart.length === 1
                      ? `${periodLabel} performance with monthly order volume.`
                      : `${periodLabel} performance with monthly order volume.`
                    : "No sales data available"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Monthly Avg</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatCurrency(averageMonthlyRevenue)}
                </p>
              </div>
            </div>

            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Revenue includes only sales orders (not purchases)
            </p>

            {!hasSalesData ? (
              <div className="flex h-[240px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 sm:h-[300px]">
                No sales data available
              </div>
            ) : (
              <div
                className="h-[240px] w-full select-none sm:h-[300px]"
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ResponsiveContainer width="100%" height="100%" style={{ outline: "none" }}>
                  <ComposedChart
                    data={chart}
                    margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
                    barCategoryGap="26%"
                    onMouseDown={() => {}}
                    onMouseMove={() => {}}
                    onMouseUp={() => {}}
                  >
                    <defs>
                      <linearGradient id="salesReportBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.96} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.76} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.16} vertical={false} />

                    <XAxis
                      dataKey="label"
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      interval="preserveStartEnd"
                    />

                    <YAxis
                      yAxisId="revenue"
                      tickFormatter={(value) => formatCompactCurrencyValue(value, currency)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      width={60}
                      tickMargin={4}
                    />

                    <YAxis yAxisId="orders" orientation="right" hide />

                    <Tooltip
                      cursor={false}
                      content={<SalesTooltip formatCurrency={formatCurrency} />}
                    />

                    <Bar
                      yAxisId="revenue"
                      dataKey="revenue"
                      fill="url(#salesReportBarGradient)"
                      radius={[8, 8, 0, 0]}
                      barSize={32}
                      minPointSize={4}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />

                    <Line
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.7}
                      dot={false}
                      activeDot={false}
                      isAnimationActive
                      animationDuration={950}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReport;
