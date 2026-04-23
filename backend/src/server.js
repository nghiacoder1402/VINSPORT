const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { connectDB } = require("./db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const extraOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((item) => item.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://vinsportv1-kappa.vercel.app",
  ...extraOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        /^https:\/\/vinsportv1-.*\.vercel\.app$/.test(normalizedOrigin);

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS chặn origin: ${normalizedOrigin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "VinSport backend is running",
    api: "/api",
  });
});

app.use("/api/products", productRoutes);
app.use("/api", authRoutes);
app.use("/api", orderRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route không tồn tại",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    message: err.message || "Lỗi server",
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server đang chạy ở cổng ${PORT}`);
      console.log(`API sẵn sàng tại /api`);
    });
  })
  .catch((err) => {
    console.error("Không thể khởi động server:", err.message);
    process.exit(1);
  });