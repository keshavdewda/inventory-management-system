const express = require("express");
const {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} = require("../controllers/categoryController");
const { authorizeRoles, verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "manager", "viewer"), getCategories);
router.post("/", verifyToken, authorizeRoles("admin", "manager"), createCategory);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateCategory);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteCategory);

module.exports = router;
