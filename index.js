//backend/index.js
const express = require('express');
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


// 🔧 Test endpoint
app.post('/test', (req, res) => {
  res.json({ status: 'ok', body: req.body });
});

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Recipe Book API is running...");
});

// ✅ Route setup
const ingredientRoutes = require("./routes/ingredients");
app.use("/api", ingredientRoutes); // contains /users/:userId/ingredients

const recipeRoutes = require("./routes/recipes");
app.use("/api", recipeRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

// 🚀 Launch
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
