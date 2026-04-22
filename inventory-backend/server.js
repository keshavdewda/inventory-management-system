const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const ensureCollections = require("./config/ensureCollections");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await ensureCollections();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
