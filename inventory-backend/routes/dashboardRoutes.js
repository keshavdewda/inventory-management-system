const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { authorizeRoles, verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "manager", "viewer"), getDashboardSummary);

module.exports = router;
