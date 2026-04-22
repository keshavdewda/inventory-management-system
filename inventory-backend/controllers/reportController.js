const Order = require("../models/Order");
const Product = require("../models/Product");

const getMonthLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" });

const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const getSalesReport = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const maxWindowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const earliestSalesOrder = await Order.findOne({ type: "sales" })
      .sort({ createdAt: 1 })
      .select("createdAt")
      .lean();

    const earliestSalesMonthStart = earliestSalesOrder
      ? new Date(
          new Date(earliestSalesOrder.createdAt).getFullYear(),
          new Date(earliestSalesOrder.createdAt).getMonth(),
          1
        )
      : null;

    const windowStart = !earliestSalesMonthStart
      ? currentMonthStart
      : earliestSalesMonthStart > maxWindowStart
        ? earliestSalesMonthStart
        : maxWindowStart;

    const windowEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1);

    const monthStarts = [];
    for (
      let cursor = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1);
      cursor <= currentMonthStart;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    ) {
      monthStarts.push(new Date(cursor));
    }

    const monthlySales = await Order.aggregate([
      {
        $match: {
          type: "sales",
          createdAt: {
            $gte: windowStart,
            $lt: windowEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: { $ifNull: ["$totalValue", 0] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyMap = new Map(
      monthlySales.map((item) => [
        `${item._id.year}-${item._id.month}`,
        {
          revenue: Number((item.revenue || 0).toFixed(2)),
          orders: item.orders || 0,
        },
      ])
    );

    const chart = monthStarts.map((monthDate) => {
      const key = getMonthKey(monthDate);
      const monthData = monthlyMap.get(key) || { revenue: 0, orders: 0 };
      const monthLabel = getMonthLabel(monthDate.getFullYear(), monthDate.getMonth() + 1);

      return {
        month: monthLabel,
        label: monthLabel,
        revenue: monthData.revenue,
        orders: monthData.orders,
      };
    });

    const totalRevenue = Number(
      chart.reduce((sum, monthData) => sum + (monthData.revenue || 0), 0).toFixed(2)
    );
    const totalOrders = chart.reduce((sum, monthData) => sum + (monthData.orders || 0), 0);

    const topCategoryData = await Order.aggregate([
      {
        $match: {
          type: "sales",
          createdAt: {
            $gte: windowStart,
            $lt: windowEnd,
          },
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$categorySnapshot", "Uncategorized"] },
          revenue: { $sum: { $ifNull: ["$totalValue", 0] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
    ]);

    const topCategory = topCategoryData[0]?._id || "No sales yet";

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        topCategory,
      },
      chart,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales report" });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ quantity: 1 }).lean();
    const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockItems = products
      .filter((product) => product.quantity <= 10)
      .map((product) => ({
        ...product,
        reorderLevel: 10,
      }));

    res.json({
      summary: {
        totalProducts: products.length,
        totalUnits,
        lowStockCount: lowStockItems.length,
        outOfStockCount: products.filter((product) => product.quantity === 0).length,
      },
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory report" });
  }
};

module.exports = {
  getInventoryReport,
  getSalesReport,
};
