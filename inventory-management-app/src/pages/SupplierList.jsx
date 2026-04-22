import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const SupplierList = () => {
  const role = getUser()?.role || "viewer";
  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isValidPhone = (value) => !value || /^[+\d\s()-]{8,20}$/.test(value);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/suppliers");
      const data = response?.data || [];
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    if (!lowered) return suppliers;
    return suppliers.filter((supplier) => {
      return (
        supplier.name?.toLowerCase().includes(lowered) ||
        supplier.email?.toLowerCase().includes(lowered) ||
        supplier._id?.toLowerCase().includes(lowered)
      );
    });
  }, [search, suppliers]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
  };

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
      setFormError("Supplier name is required.");
      return;
    }
    if (!isValidPhone(payload.phone)) {
      setFormError("Enter a valid phone number.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess("");
    try {
      if (editingId) {
        const response = await api.put(`/suppliers/${editingId}`, payload);
        const updated = response?.data;
        setSuppliers((prev) => prev.map((item) => (item._id === editingId ? updated : item)));
      } else {
        const response = await api.post("/suppliers", payload);
        const created = response?.data;
        setSuppliers((prev) => [created, ...prev]);
      }
      setSuccess("Action completed");
      closeForm();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (supplierId) => {
    if (!canDelete) return;
    setConfirmDeleteId(supplierId);
  };

  const handleDelete = async () => {
    if (!canDelete || !confirmDeleteId) return;

    setDeleting(true);
    try {
      setError("");
      setSuccess("");
      await api.delete(`/suppliers/${confirmDeleteId}`);
      setSuppliers((prev) => prev.filter((supplier) => supplier._id !== confirmDeleteId));
      setSuccess("Deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete supplier.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Suppliers</p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Supplier List</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Keep supplier contact information synced with your catalog.
          </p>
        </div>
        <div className="flex gap-3">
          {canManage && (
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
            >
              Add Supplier
            </button>
          )}

        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {editingId ? "Edit supplier" : "New supplier"}
              </p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingId ? "Update supplier details" : "Add supplier details"}
              </h3>
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
                placeholder="Supplier name"
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
                placeholder="orders@company.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Phone
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Address
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, State"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {formError}
            </div>
          )}

          <div className="flex gap-3">
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
              {saving ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Search</label>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by supplier name or email"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading && <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">Loading suppliers...</div>}
        {error && !loading && <div className="px-6 py-6 text-sm text-rose-600 dark:text-rose-200">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-950 dark:text-slate-500">
            <tr>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Address</th>
              {(canManage || canDelete) && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier._id} className="border-t border-slate-100 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{supplier.name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{supplier._id}</div>
                </td>
                <td className="px-6 py-4">{supplier.email || "--"}</td>
                <td className="px-6 py-4">{supplier.phone || "--"}</td>
                <td className="px-6 py-4">{supplier.address || "--"}</td>
                {(canManage || canDelete) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => openEditForm(supplier)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => requestDelete(supplier._id)}
                          className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {!loading && !error && filteredSuppliers.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No suppliers match your search yet.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Are you sure?"
        message="Delete this supplier? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default SupplierList;

