import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";

// ES modules compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // ✅ Moved up
const PORT = process.env.PORT || 5000;

// Routes
import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import tvRoutes from "./routes/tv.route.js";
import searchRoutes from "./routes/search.route.js";
import userRoutes from './routes/user.js'; // ✅ Keep this

// Configs
import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Route handlers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", movieRoutes);
app.use("/api/v1/tv", tvRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/user", userRoutes); // ✅ Must come *after* app is defined

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something broke!' });
});

// Serve static frontend (if in production)
if (ENV_VARS.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${ENV_VARS.NODE_ENV} mode on port ${PORT}`);
  connectDB().catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
});
