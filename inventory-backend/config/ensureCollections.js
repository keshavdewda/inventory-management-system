const Category = require("../models/Category");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Setting = require("../models/Setting");
const Supplier = require("../models/Supplier");
const User = require("../models/User");

const ensureModelCollection = async (Model) => {
  try {
    await Model.createCollection();
  } catch (error) {
    if (error?.codeName !== "NamespaceExists") {
      throw error;
    }
  }
};

const ensureCollections = async () => {
  await Promise.all([
    ensureModelCollection(User),
    ensureModelCollection(Product),
    ensureModelCollection(Supplier),
    ensureModelCollection(Category),
    ensureModelCollection(Order),
    ensureModelCollection(Setting),
  ]);
};

module.exports = ensureCollections;
