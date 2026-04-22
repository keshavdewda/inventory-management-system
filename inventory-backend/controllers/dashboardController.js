const Order = require("../models/Order");
const Product = require("../models/Product");
const Setting = require("../models/Setting");
const Supplier = require("../models/Supplier");

const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalProducts,
      totalSuppliers,
      totalOrders,
      lowStockItems,
      inventoryUnitsResult,
      totalSalesResult,
      recentOrders,
      recentProducts,
      settings,
    ] = await Promise.all([
      Product.countDocuments(),
      Supplier.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ quantity: { $lte: 10 } }),
      Product.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
      Order.aggregate([
        { $match: { type: "sales" } },
        { $group: { _id: null, total: { $sum: "$totalValue" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find().sort({ createdAt: -1 }).limit(3).lean(),
      Setting.findOne({ key: "global" }).lean(),
    ]);

    const recentActivity = [
      ...recentOrders.map((order) => ({
        id: order._id,
        type: "order",
        createdAt: order.createdAt,
        message: `${order.type === "purchase" ? "Purchase" : "Sales"} order ${order.orderNumber} for ${order.productName}`,
      })),
      ...recentProducts.map((product) => ({
        id: product._id,
        type: "product",
        createdAt: product.createdAt,
        message: `Product ${product.name} added to catalog`,
      })),
    ]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 6);

    res.json({
      companyName: settings?.companyName || "Nova Inventory Co.",
      summary: {
        totalProducts,
        totalSuppliers,
        totalOrders,
        lowStockItems,
        inventoryUnits: inventoryUnitsResult[0]?.total || 0,
        totalSales: totalSalesResult[0]?.total || 0,
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};

module.exports = {
  getDashboardSummary,
};


