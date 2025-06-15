import { User } from "../models/user.model.js";
import { fetchFromTMDB } from "../services/tmdb.service.js";
import db from '../config/db.js';

// SEARCH HISTORY FUNCTIONS
export async function saveSearchHistory(req, res) {
  try {
    console.log('Saving search history for user:', req.user?.id); // Debug
    
    const { title, search_type, query, img_url } = req.body;
    
    if (!req.user?.id || !title || !search_type || !query) {
      console.error('Missing required fields:', { 
        user: req.user?.id,
        title,
        search_type,
        query
      });
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    const [result] = await db.query(
      `INSERT INTO search_history 
       (user_id, title, search_type, query, img_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, title, search_type, query, img_url || null]
    );

    console.log('Search saved with ID:', result.insertId); // Debug
    res.status(201).json({ 
      success: true,
      insertedId: result.insertId // For debugging
    });
  } catch (error) {
    console.error("Error saving search history:", {
      message: error.message,
      sqlError: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to save search history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get Search History (Updated)
export async function getSearchHistory(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [results] = await db.query(
      `SELECT 
        id,
        title,
        search_type,
        query,
        img_url as image,
        DATE_FORMAT(created_at, '%W, %M %e %Y %l:%i %p') as formatted_date
       FROM search_history 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ 
      success: true, 
      data: results  // Changed from 'history' to 'data' for consistency
    });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

// SEARCH FUNCTIONS
export async function searchPerson(req, res) {
  const { query } = req.params;
  try {
    console.log(`Person search for: ${query} by user:`, req.user?.id);
    
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=1`
    );

    if (!response.results || response.results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No results found" 
      });
    }

    const [result] = await db.query(
      'INSERT INTO search_history (user_id, title, search_type, img_url, query) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        response.results[0].name,
        'person',
        response.results[0].profile_path,
        query
      ]
    );

    console.log('Person search saved with ID:', result.insertId);
    res.status(200).json({ 
      success: true, 
      results: response.results,
      savedId: result.insertId
    });
  } catch (error) {
    console.error("Search person error:", {
      message: error.message,
      sqlError: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to search people",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function searchMovie(req, res) {
  const { query } = req.params;
  try {
    console.log(`Movie search for: ${query} by user:`, req.user?.id);
    
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`
    );

    if (!response.results || response.results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No movies found" 
      });
    }

    const [result] = await db.query(
      `INSERT INTO search_history 
       (user_id, title, search_type, img_url, query) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        response.results[0].title || 'Unknown',
        'movie',
        response.results[0].poster_path,
        query
      ]
    );

    console.log('Movie search saved with ID:', result.insertId);
    res.status(200).json({ 
      success: true, 
      results: response.results,
      savedId: result.insertId
    });
  } catch (error) {
    console.error('Movie search error:', {
      message: error.message,
      sqlError: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to search movies",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function searchTv(req, res) {
  const { query } = req.params;
  try {
    console.log(`TV search for: ${query} by user:`, req.user?.id);
    
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/tv?query=${query}&include_adult=false&language=en-US&page=1`
    );

    if (!response.results || response.results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No TV shows found" 
      });
    }

    const [result] = await db.query(
      `INSERT INTO search_history 
       (user_id, title, search_type, img_url, query) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        response.results[0].name,
        'tv',
        response.results[0].poster_path,
        query
      ]
    );

    console.log('TV search saved with ID:', result.insertId);
    res.status(200).json({ 
      success: true, 
      results: response.results,
      savedId: result.insertId
    });
  } catch (error) {
    console.error('TV search error:', {
      message: error.message,
      sqlError: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to search TV shows",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// HISTORY MANAGEMENT
export async function removeItemFromSearchHistory(req, res) {
  const { id } = req.params;
  try {
    console.log(`Deleting history item ${id} for user:`, req.user?.id);
    
    const [result] = await db.query(
      'DELETE FROM search_history WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      console.error('Item not found or not owned by user');
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    console.log(`Deleted ${result.affectedRows} items`);
    res.status(200).json({ 
      success: true, 
      message: "Item removed",
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error("Delete error:", {
      message: error.message,
      sqlError: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete item",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function clearAllSearchHistory(req, res) {
  try {
    console.log('Clearing all history for user:', req.user?.id);
    
    const [result] = await db.query(
      'DELETE FROM search_history WHERE user_id = ?',
      [req.user.id]
    );
    
    console.log(`Cleared ${result.affectedRows} items`);
    res.status(200).json({ 
      success: true, 
      message: "History cleared",
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error("Clear history error:", {
      message: error.message,
      sqlError: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to clear history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}