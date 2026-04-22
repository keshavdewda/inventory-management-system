import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../utils/auth";

const AddUser = () => {
  const navigate = useNavigate();
  const role = getUser()?.role || "viewer";
  const isAdmin = role === "admin";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError("Name, email, and password are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/users", payload);
      navigate("/users", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">Admin Access Required</h2>
        <p className="mt-2 text-sm">
          Only administrators can create users. Switch to an admin account to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Users
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Add User
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create new users and assign a role.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@company.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Temporary password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
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
            onClick={() => navigate("/users")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
