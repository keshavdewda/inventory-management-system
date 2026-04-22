const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Category = require("../models/Category");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Setting = require("../models/Setting");
const Supplier = require("../models/Supplier");
const User = require("../models/User");

const categories = ["Electronics", "Clothing", "Automotive", "Office Supplies"];

const suppliers = [
  {
    name: "TechWorld Distributors",
    phone: "+91 98765 43210",
    email: "sales@techworld.in",
    address: "Nehru Place, New Delhi",
  },
  {
    name: "Fashion Hub India",
    phone: "+91 91234 56780",
    email: "contact@fashionhub.in",
    address: "MG Road, Bengaluru",
  },
  {
    name: "AutoParts India",
    phone: "+91 99887 76655",
    email: "orders@autopartsindia.in",
    address: "Industrial Area, Pune",
  },
  {
    name: "OfficeMart Suppliers",
    phone: "+91 90909 09090",
    email: "support@officemart.in",
    address: "Salt Lake, Kolkata",
  },
];

const products = [
  { name: "Laptop Dell Inspiron", sku: "ELE-LAP-001", category: "Electronics", supplier: "TechWorld Distributors", price: 55000, quantity: 15 },
  { name: "Mechanical Keyboard", sku: "ELE-KEY-002", category: "Electronics", supplier: "TechWorld Distributors", price: 2500, quantity: 8 },
  { name: "Wireless Mouse", sku: "ELE-MOU-003", category: "Electronics", supplier: "TechWorld Distributors", price: 800, quantity: 25 },
  { name: "Cotton T-Shirt", sku: "CLO-TSH-004", category: "Clothing", supplier: "Fashion Hub India", price: 600, quantity: 40 },
  { name: "Denim Jeans", sku: "CLO-JEA-005", category: "Clothing", supplier: "Fashion Hub India", price: 2000, quantity: 12 },
  { name: "Car Tyre (MRF)", sku: "AUT-TYR-006", category: "Automotive", supplier: "AutoParts India", price: 4500, quantity: 20 },
  { name: "Engine Oil 1L", sku: "AUT-OIL-007", category: "Automotive", supplier: "AutoParts India", price: 700, quantity: 5 },
  { name: "A4 Paper Pack", sku: "OFF-PAP-008", category: "Office Supplies", supplier: "OfficeMart Suppliers", price: 300, quantity: 50 },
  { name: "Office Chair", sku: "OFF-CHR-009", category: "Office Supplies", supplier: "OfficeMart Suppliers", price: 7000, quantity: 3 },
];

const monthDate = (monthsAgo, day) => {
  const base = new Date();
  return new Date(base.getFullYear(), base.getMonth() - monthsAgo, day, 12, 0, 0, 0);
};

const orders = [
  // Nov 2025 target: 25,000
  { type: "purchase", productName: "Mechanical Keyboard", quantity: 10, partner: "TechWorld Distributors", createdAt: monthDate(5, 3), notes: "Keyboard restock" },
  { type: "sales", productName: "Car Tyre (MRF)", quantity: 2, partner: "Speedline Garage", createdAt: monthDate(5, 6), notes: "Automotive wholesale" },
  { type: "sales", productName: "Mechanical Keyboard", quantity: 4, partner: "Metro Workspaces", createdAt: monthDate(5, 12), notes: "Office setup accessories" },
  { type: "sales", productName: "Denim Jeans", quantity: 3, partner: "Urban Wear Store", createdAt: monthDate(5, 21), notes: "Retail clothing sale" },

  // Dec 2025 target: 32,000
  { type: "purchase", productName: "Denim Jeans", quantity: 12, partner: "Fashion Hub India", createdAt: monthDate(4, 2), notes: "Jeans stock refill" },
  { type: "sales", productName: "Car Tyre (MRF)", quantity: 4, partner: "DrivePro Service", createdAt: monthDate(4, 8), notes: "Tyre lot sale" },
  { type: "sales", productName: "Mechanical Keyboard", quantity: 4, partner: "CodeCrafters Pvt Ltd", createdAt: monthDate(4, 15), notes: "Keyboard batch sale" },
  { type: "sales", productName: "Denim Jeans", quantity: 2, partner: "Fashion Avenue", createdAt: monthDate(4, 24), notes: "Apparel sale" },

  // Jan 2026 target: 28,000
  { type: "sales", productName: "Car Tyre (MRF)", quantity: 2, partner: "Rapid Auto Works", createdAt: monthDate(3, 5), notes: "Automotive order" },
  { type: "sales", productName: "Mechanical Keyboard", quantity: 4, partner: "Startup Nest", createdAt: monthDate(3, 11), notes: "Workspace accessories" },
  { type: "sales", productName: "Denim Jeans", quantity: 3, partner: "District Outlet", createdAt: monthDate(3, 19), notes: "Clothing sale" },
  { type: "sales", productName: "Cotton T-Shirt", quantity: 5, partner: "Campus Mart", createdAt: monthDate(3, 26), notes: "Seasonal apparel" },

  // Feb 2026 target: 35,000
  { type: "purchase", productName: "Mechanical Keyboard", quantity: 10, partner: "TechWorld Distributors", createdAt: monthDate(2, 2), notes: "Keyboard replenishment" },
  { type: "sales", productName: "Car Tyre (MRF)", quantity: 2, partner: "WheelCare Center", createdAt: monthDate(2, 7), notes: "Tyre sale" },
  { type: "sales", productName: "Mechanical Keyboard", quantity: 6, partner: "NorthPoint Offices", createdAt: monthDate(2, 13), notes: "Bulk keyboard dispatch" },
  { type: "sales", productName: "Denim Jeans", quantity: 4, partner: "Moda Street", createdAt: monthDate(2, 20), notes: "Denim restock order" },
  { type: "sales", productName: "Cotton T-Shirt", quantity: 5, partner: "Daily Basics Store", createdAt: monthDate(2, 27), notes: "T-shirt order" },

  // Mar 2026 target: 40,000
  { type: "sales", productName: "Car Tyre (MRF)", quantity: 4, partner: "AutoFix Hub", createdAt: monthDate(1, 6), notes: "Tyre inventory sale" },
  { type: "sales", productName: "Mechanical Keyboard", quantity: 4, partner: "DevTower Systems", createdAt: monthDate(1, 12), notes: "Accessory sale" },
  { type: "sales", productName: "Denim Jeans", quantity: 4, partner: "Urban Closet", createdAt: monthDate(1, 18), notes: "Denim order" },
  { type: "sales", productName: "Wireless Mouse", quantity: 5, partner: "IT Depot", createdAt: monthDate(1, 25), notes: "Mouse sale" },

  // Apr 2026 target: 44,500 (current month)
  { type: "sales", productName: "Car Tyre (MRF)", quantity: 3, partner: "Prime Auto Line", createdAt: monthDate(0, 4), notes: "Tyre order" },
  { type: "sales", productName: "Mechanical Keyboard", quantity: 5, partner: "Nimbus Workspaces", createdAt: monthDate(0, 9), notes: "Keyboard order" },
  { type: "sales", productName: "Denim Jeans", quantity: 6, partner: "Style Bazaar", createdAt: monthDate(0, 14), notes: "Clothing sale" },
  { type: "sales", productName: "Engine Oil 1L", quantity: 5, partner: "MotorLab Garage", createdAt: monthDate(0, 19), notes: "Lubricant sale" },
  { type: "sales", productName: "A4 Paper Pack", quantity: 10, partner: "Office Needs Co", createdAt: monthDate(0, 24), notes: "Stationery order" },
];

const makeOrderNumber = (() => {
  let counter = 1;
  return () => `ORD-DEMO-${String(counter++).padStart(4, "0")}`;
})();

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user =
    (await User.findOne({ role: "admin" })) ||
    (await User.findOne({ role: "manager" })) ||
    (await User.findOne({ role: "viewer" }));

  if (!user) {
    throw new Error("No users found. Seed users first so createdBy can be assigned.");
  }

  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
    Supplier.deleteMany({}),
    Category.deleteMany({}),
  ]);

  await Setting.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        companyName: "Nova Inventory System",
        currency: "INR",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await Category.insertMany(categories.map((name) => ({ name })));
  await Supplier.insertMany(suppliers);

  const createdProducts = await Product.insertMany(products);
  const productMap = new Map(createdProducts.map((item) => [item.name, item]));

  for (const entry of orders) {
    const product = productMap.get(entry.productName);
    if (!product) {
      throw new Error(`Product not found for order: ${entry.productName}`);
    }

    if (entry.type === "sales") {
      if (product.quantity <= 0) {
        throw new Error(`Out of stock for sales order: ${product.name}`);
      }
      if (entry.quantity > product.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      product.quantity -= entry.quantity;
    } else {
      product.quantity += entry.quantity;
    }

    if (product.quantity < 0) {
      throw new Error(`Negative stock generated for ${product.name}`);
    }

    await product.save();

    const status = entry.type === "purchase" ? "received" : "processing";
    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      type: entry.type,
      product: product._id,
      productName: product.name,
      categorySnapshot: product.category || "",
      supplierSnapshot: product.supplier || "",
      partner: entry.partner,
      quantity: entry.quantity,
      status,
      notes: entry.notes,
      unitPrice: product.price,
      totalValue: Number((product.price * entry.quantity).toFixed(2)),
      createdBy: user._id,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
    });

    await Order.updateOne(
      { _id: order._id },
      { $set: { createdAt: entry.createdAt, updatedAt: entry.createdAt } }
    );
  }

  const monthlySales = await Order.aggregate([
    { $match: { type: "sales" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalValue" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const revenueValues = monthlySales.map((item) => item.revenue || 0);
  const avgRevenue = revenueValues.length
    ? revenueValues.reduce((sum, value) => sum + value, 0) / revenueValues.length
    : 0;
  const hasSpike = revenueValues.some((value) => avgRevenue > 0 && value > avgRevenue * 3);

  const summary = {
    usersKept: await User.countDocuments(),
    categories: await Category.countDocuments(),
    suppliers: await Supplier.countDocuments(),
    products: await Product.countDocuments(),
    orders: await Order.countDocuments(),
    salesRevenue: revenueValues.reduce((sum, value) => sum + value, 0),
    monthlySales: monthlySales.map((row) => ({
      month: new Date(row._id.year, row._id.month - 1, 1).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      }),
      revenue: row.revenue,
    })),
    hasSpikeGreaterThan3xAverage: hasSpike,
    lowStockItems: await Product.find({ quantity: { $lte: 10 } }, { name: 1, quantity: 1, _id: 0 }).lean(),
  };

  console.log("Demo seed complete:");
  console.log(JSON.stringify(summary, null, 2));
}

run()
  .catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
