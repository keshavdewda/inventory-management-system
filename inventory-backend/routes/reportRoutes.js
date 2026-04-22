const express = require("express");
const {
  getInventoryReport,
  getSalesReport,
} = require("../controllers/reportController");
const { authorizeRoles, verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sales", verifyToken, authorizeRoles("admin", "manager", "viewer"), getSalesReport);
router.get(
  "/inventory",
  verifyToken,
  authorizeRoles("admin", "manager", "viewer"),
  getInventoryReport
);

module.exports = router;
