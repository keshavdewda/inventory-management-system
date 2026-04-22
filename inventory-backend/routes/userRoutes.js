const express = require("express");
const {
  createUser,
  getUsers,
  deleteUser,
} = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("admin"), createUser);
router.get("/", verifyToken, authorizeRoles("admin"), getUsers);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

module.exports = router;
