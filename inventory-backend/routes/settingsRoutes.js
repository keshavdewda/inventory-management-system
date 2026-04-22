const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { authorizeRoles, verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "manager", "viewer"), getSettings);
router.put("/", verifyToken, authorizeRoles("admin"), updateSettings);

module.exports = router;
