import db from '../config/db.js';

// Utility function for error handling
const handleDbError = (error, res) => {
  console.error("Database error:", {
    message: error.message,
    code: error.code,
    sqlState: error.sqlState,
    sql: error.sql
  });

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: "Item already exists" });
  }
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(500).json({ error: "Database operation failed" });
};

// Watchlist Controllers
export const addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { media_type } = req.body;
    const userId = req.user.id;

    if (!media_type) {
      return res.status(400).json({ error: "Media type is required" });
    }

    const [result] = await db.query(
      `INSERT INTO user_watchlist (user_id, movie_id, media_type) 
       VALUES (?, ?, ?)`,
      [userId, movieId, media_type]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to add to watchlist" });
    }

    return res.status(201).json({ message: 'Added to watchlist' });
  } catch (error) {
    return handleDbError(error, res);
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      `DELETE FROM user_watchlist 
       WHERE user_id = ? AND movie_id = ?`,
      [userId, movieId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in watchlist" });
    }

    return res.status(200).json({ message: 'Removed from watchlist' });
  } catch (error) {
    return handleDbError(error, res);
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [watchlist] = await db.query(
      `SELECT movie_id, media_type 
       FROM user_watchlist 
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({ 
      watchlist: watchlist.map(item => ({
        id: item.movie_id,
        type: item.media_type
      }))
    });
  } catch (error) {
    return handleDbError(error, res);
  }
};

// Likes/Favorites Controllers
export const addToLikes = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { media_type } = req.body;
    const userId = req.user.id;

    if (!media_type) {
      return res.status(400).json({ error: "Media type is required" });
    }

    const [result] = await db.query(
      `INSERT INTO user_likes (user_id, movie_id, media_type) 
       VALUES (?, ?, ?)`,
      [userId, movieId, media_type]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to add to favorites" });
    }

    return res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    return handleDbError(error, res);
  }
};

export const removeFromLikes = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      `DELETE FROM user_likes 
       WHERE user_id = ? AND movie_id = ?`,
      [userId, movieId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in favorites" });
    }

    return res.status(200).json({ message: 'Removed from favorites' });
  } catch (error) {
    return handleDbError(error, res);
  }
};

export const getLikes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [likes] = await db.query(
      `SELECT movie_id, media_type 
       FROM user_likes 
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({ 
      likes: likes.map(item => ({
        id: item.movie_id,
        type: item.media_type
      }))
    });
  } catch (error) {
    return handleDbError(error, res);
  }
};