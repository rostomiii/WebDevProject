
import express from "express";

// Create Express application
const app = express();

// Set the port number
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Backend Server is Running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
