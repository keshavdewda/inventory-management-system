import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import ConfirmDialog from "../components/ConfirmDialog";

const ProductCategories = () => {
  const role = getUser()?.role || "viewer";
  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/categories");
        const data = response?.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.name.localeCompare(right.name)),
    [categories]
  );

  const handleAddCategory = async (event) => {
    event.preventDefault();
    if (!canManage || !newCategory.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/categories", { name: newCategory.trim() });
      setCategories((prev) => [...prev, response.data]);
      setNewCategory("");
      setSuccess("Action completed");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteCategory = (id) => {
    if (!canDelete) return;
    setConfirmDeleteId(id);
  };

  const handleDeleteCategory = async () => {
    if (!canDelete || !confirmDeleteId) return;

    setDeleting(true);
    try {
      setError("");
      setSuccess("");
      await api.delete(`/categories/${confirmDeleteId}`);
      setCategories((prev) => prev.filter((category) => category._id !== confirmDeleteId));
      setSuccess("Deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingId(category._id);
    setEditingValue(category.name);
  };

  const handleSaveCategory = async (id) => {
    if (!canManage || !editingValue.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.put(`/categories/${id}`, { name: editingValue.trim() });
      const updated = response?.data;
      setCategories((prev) => prev.map((category) => (category._id === id ? updated : category)));
      setEditingId(null);
      setEditingValue("");
      setSuccess("Action completed");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Products</p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Categories</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Organize the catalog with reusable categories that stay synced with products.
        </p>
      </div>

      {canManage && (
        <form onSubmit={handleAddCategory} className="mt-8 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-[220px] flex-1">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Create Category</label>
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="e.g. Electronics"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Add Category"}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 text-xs uppercase tracking-[0.3em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
          Category List
        </div>
        {loading ? (
          <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">Loading categories...</div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedCategories.map((category) => (
              <li key={category._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                {editingId === category._id ? (
                  <input
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{category.name}</span>
                )}

                {(canManage || canDelete) && (
                  <div className="flex gap-2">
                    {editingId === category._id ? (
                      <button
                        type="button"
                        onClick={() => handleSaveCategory(category._id)}
                        className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                      >
                        Save
                      </button>
                    ) : (
                      canManage && (
                        <button
                          type="button"
                          onClick={() => handleEditCategory(category)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          Edit
                        </button>
                      )
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => requestDeleteCategory(category._id)}
                        className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
            {sortedCategories.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No categories created yet.
              </li>
            )}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Are you sure?"
        message="Delete this category? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDeleteCategory}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default ProductCategories;
