import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js'; // 👈 named import
import {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
    addToLikes,        
    removeFromLikes,   
    getLikes           
  } from '../controllers/userController.js';

const router = express.Router();

router.post('/watchlist/:movieId', protectRoute, addToWatchlist); // 👈 use protectRoute
router.delete('/watchlist/:movieId', protectRoute, removeFromWatchlist);
router.get('/watchlist', protectRoute, getWatchlist);

router.post('/likes/:movieId', protectRoute, addToLikes);
router.delete('/likes/:movieId', protectRoute, removeFromLikes);
router.get('/likes', protectRoute, getLikes);

export default router;
