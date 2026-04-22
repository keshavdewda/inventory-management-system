import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import { formatCurrencyValue, useAppCurrency } from "../utils/currency";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  supplier: "",
  price: "",
  quantity: "",
};

const toNumber = (value) => {
  if (value === "") return "";
  const parsed = Number(value);
  return Number.isNaN(parsed) ? "" : parsed;
};

const normalizeSupplier = (supplier) => {
  if (supplier && typeof supplier === "object") return supplier;
  if (typeof supplier === "string" && supplier.trim()) {
    return { name: supplier.trim() };
  }
  return null;
};

const normalizeProduct = (product) => ({
  ...product,
  supplier: normalizeSupplier(product?.supplier),
});
const isNumericOnlyName = (value) => /^\d+$/.test(value.trim());

const ProductList = () => {
  const currency = useAppCurrency();
  const formatPrice = (value) =>
    formatCurrencyValue(value, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const role = getUser()?.role || "viewer";
  const canCreate = role === "admin" || role === "manager";
  const canEdit = canCreate;
  const canDelete = role === "admin";

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/products");
      const data = response?.data?.products || response?.data || [];
      setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set();
    products.forEach((product) => {
      if (product?.category) unique.add(product.category);
    });
    return ["All", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !loweredSearch ||
        product?.name?.toLowerCase?.().includes(loweredSearch) ||
        product?.sku?.toLowerCase?.().includes(loweredSearch) ||
        product?._id?.toLowerCase?.().includes(loweredSearch);

      const matchesFilter = filter === "All" || product.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, products]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingId(product?._id || null);
    setFormData({
      name: product?.name || "",
      sku: product?.sku || "",
      category: product?.category || "",
      supplier: product?.supplier?.name || "",
      price: product?.price ?? "",
      quantity: product?.quantity ?? "",
    });
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canCreate && !canEdit) return;

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      supplier: formData.supplier.trim(),
      price: toNumber(formData.price),
      quantity: toNumber(formData.quantity),
    };

    if (!payload.name || !payload.sku || payload.price === "" || payload.quantity === "") {
      setFormError("Name, SKU, price, and quantity are required.");
      return;
    }
    if (payload.price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }
    if (payload.quantity < 0) {
      setFormError("Quantity cannot be negative.");
      return;
    }
    if (isNumericOnlyName(payload.name)) {
      setFormError("Product name cannot be only numbers.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess("");
    try {
      if (editingId) {
        const response = await api.put(`/products/${editingId}`, payload);
        const updated = normalizeProduct(response?.data);
        setProducts((prev) =>
          prev.map((item) => (item._id === editingId ? updated : item))
        );
      } else {
        const response = await api.post("/products", payload);
        const created = normalizeProduct(response?.data);
        setProducts((prev) => [created, ...prev]);
      }
      setSuccess("Action completed");
      closeForm();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (productId) => {
    if (!canDelete) return;
    setConfirmDeleteId(productId);
  };

  const handleDelete = async () => {
    if (!canDelete || !confirmDeleteId) return;

    setDeleting(true);
    try {
      setError("");
      setSuccess("");
      await api.delete(`/products/${confirmDeleteId}`);
      setProducts((prev) => prev.filter((item) => item._id !== confirmDeleteId));
      setSuccess("Deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const addSampleData = async () => {
    if (!canCreate) return;
    setSampleLoading(true);
    setError("");
    const samples = [
      {
        name: "Smart Sensor",
        sku: "SKU-1001",
        category: "Electronics",
        supplier: "Nova Supply",
        price: 129.99,
        quantity: 45,
      },
      {
        name: "Warehouse Tote",
        sku: "SKU-1002",
        category: "Packaging",
        supplier: "Atlas Co.",
        price: 18.5,
        quantity: 210,
      },
      {
        name: "Cold Chain Label",
        sku: "SKU-1003",
        category: "Labels",
        supplier: "Polar Print",
        price: 2.75,
        quantity: 540,
      },
    ];

    for (const item of samples) {
      try {
        await api.post("/products", item);
      } catch {
        // Ignore duplicates or validation errors for sample data
      }
    }

    await fetchProducts();
    setSampleLoading(false);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Products
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Product List
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            View and manage the full catalog in one place.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openCreateForm}
            className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
          >
            Add Product
          </button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {editingId ? "Edit product" : "New product"}
              </p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingId ? "Update product details" : "Create a new product"}
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
                onChange={handleFormChange}
                placeholder="Product name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              SKU
              <input
                name="sku"
                value={formData.sku}
                onChange={handleFormChange}
                placeholder="SKU-1203"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Category
              <input
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                placeholder="Electronics"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Supplier
              <input
                name="supplier"
                value={formData.supplier}
                onChange={handleFormChange}
                placeholder="Supplier name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Price
              <input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={handleFormChange}
                placeholder="0.00"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Quantity
              <input
                name="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleFormChange}
                placeholder="0"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
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
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or SKU"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Filter
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {canCreate && products.length === 0 && (
          <button
            type="button"
            onClick={addSampleData}
            disabled={sampleLoading}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {sampleLoading ? "Adding samples..." : "Load Sample Products"}
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading && (
          <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">
            Loading products...
          </div>
        )}
        {error && !loading && (
          <div className="px-6 py-6 text-sm text-rose-600 dark:text-rose-200">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-950 dark:text-slate-500">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              {(canEdit || canDelete) && (
                <th className="px-6 py-4 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product._id || product.sku}
                className="border-t border-slate-100 text-slate-600 dark:border-slate-800 dark:text-slate-300"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {product.name || "Unnamed"}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {product.sku || product._id}
                  </div>
                </td>
                <td className="px-6 py-4">{product.category || "-"}</td>
                <td className="px-6 py-4">{product.supplier?.name || "N/A"}</td>
                <td className="px-6 py-4">{product.quantity ?? "-"}</td>
                <td className="px-6 py-4">
                  {typeof product.price === "number"
                    ? formatPrice(product.price)
                    : product.price || "--"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      product.quantity <= 10
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    }`}
                  >
                    {product.quantity <= 10 ? "Low Stock" : "Active"}
                  </span>
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => requestDelete(product._id)}
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

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No products match your search.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Are you sure?"
        message="Delete this product? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default ProductList;

