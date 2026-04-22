const Order = require("../models/Order");
const Product = require("../models/Product");
const { ensureSupplier } = require("./supplierController");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const generateOrderNumber = () => {
  const suffix = `${Date.now()}`.slice(-8);
  const randomPart = `${Math.floor(Math.random() * 900) + 100}`;
  return `ORD-${suffix}${randomPart}`;
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("product", "name sku");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const createOrder = async (req, res) => {
  try {
    const incomingType = normalizeText(req.body.type).toLowerCase();
    const isPurchaseOrder = incomingType === "purchase";
    const isSaleOrder = incomingType === "sale" || incomingType === "sales";
    const type = isSaleOrder ? "sales" : incomingType;
    const productId = normalizeText(req.body.productId);
    const partner = normalizeText(req.body.partner);
    const notes = normalizeText(req.body.notes);
    const requestedStatus = normalizeText(req.body.status).toLowerCase();
    const quantity = Number(req.body.quantity);

    if (!isPurchaseOrder && !isSaleOrder) {
      return res.status(400).json({ message: "Order type must be purchase or sales" });
    }

    if (!productId || !partner || !Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Product, partner, and a valid quantity are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (isSaleOrder && product.quantity <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }

    if (isSaleOrder && quantity > product.quantity) {
      return res.status(400).json({
        message: "Insufficient stock. Cannot complete sale.",
      });
    }

    product.quantity = isSaleOrder ? product.quantity - quantity : product.quantity + quantity;
    if (product.quantity < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    await product.save();

    if (isPurchaseOrder) {
      await ensureSupplier(partner);
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      type,
      product: product._id,
      productName: product.name,
      categorySnapshot: product.category || "",
      supplierSnapshot: product.supplier || "",
      partner,
      quantity,
      status: requestedStatus || (isPurchaseOrder ? "received" : "processing"),
      notes,
      unitPrice: product.price,
      totalValue: Number((product.price * quantity).toFixed(2)),
      createdBy: req.user._id,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("createdBy", "name email role")
      .populate("product", "name sku");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order" });
  }
};

module.exports = {
  createOrder,
  getOrders,
};
