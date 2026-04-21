const express = require("express");
const router = express.Router();

const { verifyToken, requireAdmin } = require("../middlewares/authMiddleware");
const {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} = require("../controllers/adminOrderController");

router.get("/", verifyToken, requireAdmin, getAdminOrders);
router.put("/:id/status", verifyToken, requireAdmin, updateAdminOrderStatus);
router.put(
  "/:id/payment-status",
  verifyToken,
  requireAdmin,
  updateAdminPaymentStatus
);

module.exports = router;