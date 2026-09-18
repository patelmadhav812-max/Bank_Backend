const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.route");
const accountRoutes = require("./routes/account.route");
const transactionRoutes = require("./routes/transaction.route");
//Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bank Backend API is running successfully",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/transactions", transactionRoutes);
module.exports = app;
