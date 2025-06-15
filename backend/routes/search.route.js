import express from "express";
import {
  getSearchHistory,
  removeItemFromSearchHistory,
  searchMovie,
  searchPerson,
  searchTv,
  clearAllSearchHistory,
  saveSearchHistory
} from "../controllers/search.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Public search endpoints (don't require auth)
router.get("/person/:query", searchPerson);
router.get("/movie/:query", searchMovie);
router.get("/tv/:query", searchTv);

// Protected history endpoints (require auth)
router.post("/history", protectRoute, saveSearchHistory);
router.get("/history", protectRoute, getSearchHistory);
router.delete("/history/:id", protectRoute, removeItemFromSearchHistory);
router.delete("/history/clear-all", protectRoute, clearAllSearchHistory);

export default router;