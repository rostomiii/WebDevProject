import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import songRoutes from "./routes/songRoutes.js";


await connectDB();



// Create Express application
const app = express();

// Set the port number
const PORT = process.env.PORT || 3000;

// Middleware to read JSON data
app.use(express.json());
app.use("/api/songs", songRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Backend Server is Running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
