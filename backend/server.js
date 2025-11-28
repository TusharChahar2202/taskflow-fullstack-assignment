const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes"); 

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tasks", taskRoutes); 

// Basic route to test server
app.get("/", (req, res) => {
  res.json({ message: "TaskFlow API is running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
