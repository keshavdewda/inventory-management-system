const Category = require("../models/Category");
const Product = require("../models/Product");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findCategoryByName = async (name) => {
  const normalized = normalizeText(name);
  if (!normalized) {
    return null;
  }

  return Category.findOne({
    name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
  });
};

const ensureCategory = async (name) => {
  const normalized = normalizeText(name);
  if (!normalized) {
    return null;
  }

  const existing = await findCategoryByName(normalized);
  if (existing) {
    return existing;
  }

  return Category.create({ name: normalized });
};

const syncCategoriesFromProducts = async () => {
  const distinctCategories = await Product.distinct("category", {
    category: { $type: "string", $ne: "" },
  });

  for (const categoryName of distinctCategories) {
    await ensureCategory(categoryName);
  }
};

const getCategories = async (req, res) => {
  try {
    await syncCategoriesFromProducts();
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const description = normalizeText(req.body.description);

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await findCategoryByName(name);
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const name = normalizeText(req.body.name);
    const description = normalizeText(req.body.description);

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const duplicate = await findCategoryByName(name);
    if (duplicate && String(duplicate._id) !== String(category._id)) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const previousName = category.name;
    category.name = name;
    category.description = description;
    await category.save();

    if (previousName.toLowerCase() !== name.toLowerCase()) {
      await Product.updateMany(
        { category: { $regex: `^${escapeRegex(previousName)}$`, $options: "i" } },
        { $set: { category: name } }
      );
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Product.updateMany(
      { category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" } },
      { $set: { category: "" } }
    );

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};

module.exports = {
  createCategory,
  deleteCategory,
  ensureCategory,
  getCategories,
  updateCategory,
};
