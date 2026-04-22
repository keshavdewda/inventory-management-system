import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../utils/auth";

const AddProduct = () => {
  const navigate = useNavigate();
  const role = getUser()?.role || "viewer";
  const canCreate = role === "admin" || role === "manager";

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    supplier: "",
    price: "",
    quantity: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isNumericOnlyName = (value) => /^\d+$/.test(value.trim());

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canCreate) return;

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      supplier: formData.supplier.trim(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
    };

    if (!payload.name || !payload.sku || Number.isNaN(payload.price) || Number.isNaN(payload.quantity)) {
      setError("Name, SKU, price, and quantity are required.");
      return;
    }
    if (payload.price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (payload.quantity < 0) {
      setError("Quantity cannot be negative.");
      return;
    }
    if (isNumericOnlyName(payload.name)) {
      setError("Product name cannot be only numbers.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/products", payload);
      navigate("/products", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">Manager or Admin Access Required</h2>
        <p className="mt-2 text-sm">
          You need elevated permissions to create products. Ask an admin for access.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Products
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Add Product
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create a new item and add it to your catalog.
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
              placeholder="Product name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              SKU
            </label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. PR-1209"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Category
            </label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Electronics"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Supplier
            </label>
            <input
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Supplier name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Price
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Quantity
            </label>
            <input
              name="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
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
            onClick={() => navigate("/products")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
