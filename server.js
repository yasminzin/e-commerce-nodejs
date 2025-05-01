const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const brandsRoutes = require("./routes/brands");
const categoriesRoutes = require("./routes/categories");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const AppError = require("./utils/appError");

const app = express();

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected successfully to mongodb");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// Middlewares
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "*",
//   })
// );

// Routes
// app.use("/users", usersRoutes);
// app.use("/products", productsRoutes);
// app.use("/brands", brandsRoutes);
// app.use("/categories", categoriesRoutes);
// app.use("/cart", cartRoutes);
// app.use("/orders", ordersRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ status: "fail", message: "File size exceeds 20MB limit" });
    }
    return res.status(400).json({ status: "fail", message: error.message });
  }
  res.status(error.statusCode || 500).json({
    status: "fail",
    message: error.message || "server error, try again later.",
  });
});

// 404 Middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "route not found",
  });
});

app.get("/", (req, res) => {
  res.send("Hello from my E-commerce Website!");
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
