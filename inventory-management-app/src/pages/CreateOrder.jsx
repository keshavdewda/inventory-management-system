import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../utils/auth";
import { formatCurrencyValue, useAppCurrency } from "../utils/currency";

const CreateOrder = () => {
  const navigate = useNavigate();
  const role = getUser()?.role || "viewer";
  const canManage = role === "admin" || role === "manager";
  const currency = useAppCurrency();
  const formatPrice = (value) =>
    formatCurrencyValue(value, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [formData, setFormData] = useState({
    type: "purchase",
    productId: "",
    quantity: "",
    partner: "",
    notes: "",
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      setError("");
      try {
        const [productsResponse, suppliersResponse] = await Promise.all([
          api.get("/products"),
          api.get("/suppliers"),
        ]);
        setProducts(Array.isArray(productsResponse?.data) ? productsResponse.data : []);
        setSuppliers(Array.isArray(suppliersResponse?.data) ? suppliersResponse.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load order options.");
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === formData.productId),
    [formData.productId, products]
  );
  const selectedProductStock = Number(selectedProduct?.quantity) || 0;
  const enteredQuantity = Number(formData.quantity);
  const salesValidationMessage = useMemo(() => {
    if (formData.type !== "sales" || !formData.productId) return "";
    if (selectedProductStock <= 0) return "Out of stock";
    if (Number.isFinite(enteredQuantity) && enteredQuantity > selectedProductStock) {
      return "Cannot sell more than available stock";
    }
    return "";
  }, [enteredQuantity, formData.productId, formData.type, selectedProductStock]);
  const isBaseInvalid =
    !formData.productId ||
    !formData.partner.trim() ||
    !Number.isFinite(enteredQuantity) ||
    enteredQuantity <= 0;
  const isSubmitDisabled = saving || isBaseInvalid || Boolean(salesValidationMessage);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) return;
    if (salesValidationMessage) return;

    const payload = {
      type: formData.type,
      productId: formData.productId,
      quantity: Number(formData.quantity),
      partner: formData.partner.trim(),
      notes: formData.notes.trim(),
    };

    if (!payload.productId || !payload.partner || !Number.isFinite(payload.quantity) || payload.quantity <= 0) {
      setError("Product, partner, and a valid quantity are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/orders", payload);
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create order.");
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <h2 className="text-2xl font-semibold">Manager or Admin Access Required</h2>
        <p className="mt-2 text-sm">Only managers and admins can create orders.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Orders</p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Create Order</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create a purchase or sales order and update stock automatically.
        </p>
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading products and suppliers...
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Add at least one product before creating an order.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Order Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="purchase">Purchase</option>
                <option value="sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Product</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Quantity</label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
              {salesValidationMessage && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{salesValidationMessage}</p>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {formData.type === "purchase" ? "Supplier" : "Customer"}
              </label>
              <input
                list="partner-options"
                name="partner"
                value={formData.partner}
                onChange={handleChange}
                placeholder={formData.type === "purchase" ? "Supplier name" : "Customer name"}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
              <datalist id="partner-options">
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier.name} />
                ))}
              </datalist>
            </div>
          </div>

          {selectedProduct && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-slate-900 dark:text-white">{selectedProduct.name}</span>
                <span>Stock: {selectedProduct.quantity}</span>
                <span>Price: {formatPrice(selectedProduct.price || 0)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Add delivery notes or special instructions"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Submitting..." : "Submit Order"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateOrder;
