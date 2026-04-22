const Product = require("../models/Product");
const { ensureCategory } = require("./categoryController");
const { ensureSupplier } = require("./supplierController");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const createProduct = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const sku = normalizeText(req.body.sku);
    const category = normalizeText(req.body.category);
    const supplier = normalizeText(req.body.supplier);
    const price = Number(req.body.price);
    const quantity = Number(req.body.quantity);

    if (!name || !sku || !Number.isFinite(price) || !Number.isFinite(quantity)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const existing = await Product.findOne({ sku });
    if (existing) {
      return res.status(400).json({ message: "SKU already exists" });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      supplier,
      price,
      quantity,
    });

    await Promise.all([ensureCategory(category), ensureSupplier(supplier)]);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("supplier").sort({ createdAt: -1 });

    const normalizedProducts = products.map((product) => {
      const plainProduct = product.toObject();
      const supplierValue = plainProduct.supplier;

      const supplier =
        supplierValue && typeof supplierValue === "object"
          ? supplierValue
          : typeof supplierValue === "string" && supplierValue.trim()
          ? { name: supplierValue.trim() }
          : null;

      return {
        ...plainProduct,
        supplier,
      };
    });

    res.json(normalizedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const name = normalizeText(req.body.name);
    const sku = normalizeText(req.body.sku);
    const category = normalizeText(req.body.category);
    const supplier = normalizeText(req.body.supplier);
    const price =
      req.body.price === undefined || req.body.price === null ? null : Number(req.body.price);
    const quantity =
      req.body.quantity === undefined || req.body.quantity === null
        ? null
        : Number(req.body.quantity);

    if (req.body.name !== undefined && !name) {
      return res.status(400).json({ message: "Product name cannot be empty" });
    }

    if (sku && sku !== product.sku) {
      const exists = await Product.findOne({ sku });
      if (exists) {
        return res.status(400).json({ message: "SKU already exists" });
      }
    }

    if (price !== null && !Number.isFinite(price)) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }

    if (price !== null && price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    if (quantity !== null && !Number.isFinite(quantity)) {
      return res.status(400).json({ message: "Quantity must be a valid number" });
    }

    if (quantity !== null && quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.category = category || product.category;
    product.supplier = supplier || product.supplier;
    product.price = price ?? product.price;
    product.quantity = quantity ?? product.quantity;

    const updated = await product.save();
    await Promise.all([ensureCategory(updated.category), ensureSupplier(updated.supplier)]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
