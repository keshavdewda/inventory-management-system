import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "manager",
};

const UserList = () => {
  const currentUser = getUser();
  const role = currentUser?.role || "viewer";
  const isAdmin = role === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/users");
        const data = response?.data?.users || response?.data || [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const openForm = () => {
    setFormOpen(true);
    setFormData(emptyForm);
    setFormError("");
    setSuccess("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError("");
  };

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
      setFormError("Name, email, and password are required.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess("");
    try {
      const response = await api.post("/users", payload);
      const created = response?.data;
      setUsers((prev) => [created, ...prev]);
      setSuccess("Action completed");
      closeForm();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (userId) => {
    if (!isAdmin) return;
    setConfirmDeleteId(userId);
  };

  const handleDelete = async () => {
    if (!isAdmin || !confirmDeleteId) return;

    setDeleting(true);
    try {
      setError("");
      setSuccess("");
      await api.delete(`/users/${confirmDeleteId}`);
      setUsers((prev) =>
        prev.filter((user) => user._id !== confirmDeleteId && user.id !== confirmDeleteId)
      );
      setSuccess("Deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">Admin access required</h2>
        <p className="mt-2 text-sm">
          Only administrators can manage users. Switch to an admin account to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Users</p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">User Management</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create, view, and remove users with role-based access.
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
        >
          Add User
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">New user</p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Invite a teammate</h3>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@company.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Password
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Temporary password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Role
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {formError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={closeForm}
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
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading && <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">Loading users...</div>}
        {error && !loading && <div className="px-6 py-6 text-sm text-rose-600 dark:text-rose-200">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-950 dark:text-slate-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = (user._id || user.id) === currentUser?.id;
              return (
                <tr key={user._id || user.id} className="border-t border-slate-100 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{user._id || user.id}</div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => requestDelete(user._id || user.id)}
                      disabled={isCurrentUser}
                      className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCurrentUser ? "Current User" : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {!loading && !error && users.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No users available yet.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Are you sure?"
        message="Delete this user? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default UserList;
