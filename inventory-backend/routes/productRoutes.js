const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "manager"),
  createProduct
);
router.get("/", verifyToken, authorizeRoles("admin", "manager", "viewer"), getProducts);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "manager"),
  updateProduct
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteProduct
);

module.exports = router;
