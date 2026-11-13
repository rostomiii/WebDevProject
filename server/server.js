import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/songRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.send("Daytime Radio backend is running!"));
app.use(userRoutes);
app.use(authRoutes);
app.use("/api/songs", songRoutes);

app.use((err, _req, res, _next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Valid Bearer token required" });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 3000;
try {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
} catch (err) {
  console.error("Server startup failed:", err.message);
  process.exit(1);
}
