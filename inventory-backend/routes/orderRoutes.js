const express = require("express");
const { createOrder, getOrders } = require("../controllers/orderController");
const { authorizeRoles, verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "manager", "viewer"), getOrders);
router.post("/", verifyToken, authorizeRoles("admin", "manager"), createOrder);

module.exports = router;
