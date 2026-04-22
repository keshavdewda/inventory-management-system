import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import { setAppCurrency } from "../utils/currency";

const Settings = () => {
  const role = getUser()?.role || "viewer";
  const isAdmin = role === "admin";

  const [formData, setFormData] = useState({
    companyName: "Nova Inventory Co.",
    currency: "INR",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/settings");
        const data = response?.data;
        if (data) {
          const nextCurrency = data.currency || "INR";
          setFormData({
            companyName: data.companyName || "Nova Inventory Co.",
            currency: nextCurrency,
          });
          setAppCurrency(nextCurrency);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.put("/settings", {
        companyName: formData.companyName,
        currency: formData.currency,
      });
      const data = response?.data;

      setFormData({
        companyName: data.companyName,
        currency: data.currency,
      });
      setAppCurrency(data.currency || formData.currency);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Settings</p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">System Configuration</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Update company information and currency preferences.</p>
      </div>

      {loading ? (
        <div className="mt-8 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading settings...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <div className="grid gap-6">
              {!isAdmin && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  Only admins can save changes. You can still view the current settings.
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Company Name</label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company name"
                  disabled={!isAdmin}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}
              {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{success}</div>}

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!isAdmin || saving}
                  className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings Info</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <p>Update your company name and currency preferences.</p>
                <p>These settings affect how data is displayed across the dashboard.</p>
                <p>Currency will impact sales and reports.</p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
