const Product = require("../models/Product");
const Supplier = require("../models/Supplier");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const isValidPhone = (value) => !value || /^[+\d\s()-]{8,20}$/.test(value);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findSupplierByName = async (name) => {
  const normalized = normalizeText(name);
  if (!normalized) {
    return null;
  }

  return Supplier.findOne({
    name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
  });
};

const ensureSupplier = async (name) => {
  const normalized = normalizeText(name);
  if (!normalized) {
    return null;
  }

  const existing = await findSupplierByName(normalized);
  if (existing) {
    return existing;
  }

  return Supplier.create({ name: normalized });
};

const syncSuppliersFromProducts = async () => {
  const distinctSuppliers = await Product.distinct("supplier", {
    supplier: { $type: "string", $ne: "" },
  });

  for (const supplierName of distinctSuppliers) {
    await ensureSupplier(supplierName);
  }
};

const getSuppliers = async (req, res) => {
  try {
    await syncSuppliersFromProducts();
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

const createSupplier = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email).toLowerCase();
    const phone = normalizeText(req.body.phone);
    const address = normalizeText(req.body.address);

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Phone number format is invalid" });
    }

    const existing = await findSupplierByName(name);
    if (existing) {
      return res.status(400).json({ message: "Supplier already exists" });
    }

    const supplier = await Supplier.create({ name, email, phone, address });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to create supplier" });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email).toLowerCase();
    const phone = normalizeText(req.body.phone);
    const address = normalizeText(req.body.address);

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Phone number format is invalid" });
    }

    const duplicate = await findSupplierByName(name);
    if (duplicate && String(duplicate._id) !== String(supplier._id)) {
      return res.status(400).json({ message: "Supplier already exists" });
    }

    const previousName = supplier.name;
    supplier.name = name;
    supplier.email = email;
    supplier.phone = phone;
    supplier.address = address;
    await supplier.save();

    if (previousName.toLowerCase() !== name.toLowerCase()) {
      await Product.updateMany(
        { supplier: { $regex: `^${escapeRegex(previousName)}$`, $options: "i" } },
        { $set: { supplier: name } }
      );
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to update supplier" });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await Product.updateMany(
      { supplier: { $regex: `^${escapeRegex(supplier.name)}$`, $options: "i" } },
      { $set: { supplier: "" } }
    );

    await supplier.deleteOne();
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supplier" });
  }
};

module.exports = {
  createSupplier,
  deleteSupplier,
  ensureSupplier,
  getSuppliers,
  updateSupplier,
};
