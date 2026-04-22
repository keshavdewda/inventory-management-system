const express = require("express");
const {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} = require("../controllers/supplierController");
const { authorizeRoles, verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "manager", "viewer"), getSuppliers);
router.post("/", verifyToken, authorizeRoles("admin", "manager"), createSupplier);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateSupplier);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteSupplier);

module.exports = router;
