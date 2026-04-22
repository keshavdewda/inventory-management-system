import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../utils/auth";

const AddSupplier = () => {
  const navigate = useNavigate();
  const role = getUser()?.role || "viewer";
  const canManage = role === "admin" || role === "manager";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isValidPhone = (value) => !value || /^[+\d\s()-]{8,20}$/.test(value);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    if (!payload.name) {
      setError("Supplier name is required.");
      return;
    }
    if (!isValidPhone(payload.phone)) {
      setError("Enter a valid phone number.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/suppliers", payload);
      navigate("/suppliers", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create supplier.");
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">Manager or Admin Access Required</h2>
        <p className="mt-2 text-sm">
          Only managers and admins can add suppliers.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Suppliers
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Add Supplier
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add a new supplier and store their contact details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Supplier name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="supplier@email.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, City, State"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/suppliers")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSupplier;
