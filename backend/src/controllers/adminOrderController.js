const { sql, poolPromise } = require("../db");

function normalizePaymentMethod(value) {
  const method = String(value || "").toLowerCase();
  if (method === "bank") return "banking";
  if (method === "cod") return "cod";
  if (method === "momo") return "momo";
  return method || "cod";
}

function normalizePaymentStatus(value) {
  const status = String(value || "").toLowerCase();
  if (status === "pending" || status === "paid" || status === "failed") {
    return status;
  }
  return "pending";
}

function normalizeOrderStatus(value) {
  const status = String(value || "").toLowerCase();
  if (
    ["pending", "confirmed", "shipping", "completed", "cancelled"].includes(
      status
    )
  ) {
    return status;
  }
  return "pending";
}

const getAdminOrders = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        o.order_id,
        o.order_date,
        o.status AS order_status,
        o.total_amount,
        u.name AS customer_name,
        u.phone AS customer_phone,
        ship.address AS shipping_address,
        pay.method AS payment_method,
        pay.status AS payment_status
      FROM Orders o
      INNER JOIN Users u ON o.user_id = u.user_id
      OUTER APPLY (
        SELECT TOP 1 address, status
        FROM Shipping
        WHERE order_id = o.order_id
        ORDER BY shipping_id DESC
      ) ship
      OUTER APPLY (
        SELECT TOP 1 method, status
        FROM Payments
        WHERE order_id = o.order_id
        ORDER BY payment_id DESC
      ) pay
      ORDER BY o.order_id DESC
    `);

    const orders = result.recordset.map((row) => ({
      id: String(row.order_id),
      order_id: row.order_id,
      customerName: row.customer_name || "Khách hàng",
      phone: row.customer_phone || "",
      address: row.shipping_address || "",
      totalAmount: Number(row.total_amount) || 0,
      paymentMethod: normalizePaymentMethod(row.payment_method),
      paymentStatus: normalizePaymentStatus(row.payment_status),
      orderStatus: normalizeOrderStatus(row.order_status),
      createdAt: row.order_date,
    }));

    return res.json(orders);
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return res.status(500).json({
      message:
        error?.originalError?.info?.message ||
        error.message ||
        "Không thể lấy danh sách đơn hàng",
    });
  }
};

const updateAdminOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const normalizedStatus = normalizeOrderStatus(status);

    if (
      !["pending", "confirmed", "shipping", "completed", "cancelled"].includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({ message: "Trạng thái đơn hàng không hợp lệ" });
    }

    const pool = await poolPromise;

    const existed = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT TOP 1 order_id
        FROM Orders
        WHERE order_id = @orderId
      `);

    if (existed.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const dbStatus =
      normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

    await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("status", sql.NVarChar(50), dbStatus)
      .query(`
        UPDATE Orders
        SET status = @status
        WHERE order_id = @orderId
      `);

    return res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      id: String(orderId),
      status: normalizedStatus,
    });
  } catch (error) {
    console.error("PUT /api/admin/orders/:id/status error:", error);
    return res.status(500).json({
      message:
        error?.originalError?.info?.message ||
        error.message ||
        "Không cập nhật được trạng thái đơn hàng",
    });
  }
};

const updateAdminPaymentStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const normalizedStatus = normalizePaymentStatus(status);

    if (!["pending", "paid", "failed"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Trạng thái thanh toán không hợp lệ" });
    }

    const pool = await poolPromise;

    const existed = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT TOP 1 payment_id
        FROM Payments
        WHERE order_id = @orderId
        ORDER BY payment_id DESC
      `);

    if (existed.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin thanh toán" });
    }

    const paymentId = existed.recordset[0].payment_id;
    const dbStatus =
      normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

    await pool
      .request()
      .input("paymentId", sql.Int, paymentId)
      .input("status", sql.NVarChar(50), dbStatus)
      .query(`
        UPDATE Payments
        SET status = @status
        WHERE payment_id = @paymentId
      `);

    return res.json({
      message: "Cập nhật trạng thái thanh toán thành công",
      id: String(orderId),
      status: normalizedStatus,
    });
  } catch (error) {
    console.error("PUT /api/admin/orders/:id/payment-status error:", error);
    return res.status(500).json({
      message:
        error?.originalError?.info?.message ||
        error.message ||
        "Không cập nhật được trạng thái thanh toán",
    });
  }
};

module.exports = {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
};