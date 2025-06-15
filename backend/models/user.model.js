import pool from '../config/db.js';

export class User {
  static async create({ username, email, password, image }) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, image) VALUES (?, ?, ?, ?)',
        [username, email, password, image]
      );
      return { id: result.insertId, username, email, image };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Or handle it appropriately
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, image FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async addToSearchHistory(userId, searchItem) {
    try {
      await pool.execute(
        'INSERT INTO search_history (user_id, item_id, image, title, search_type) VALUES (?, ?, ?, ?, ?)',
        [userId, searchItem.id, searchItem.image, searchItem.title, searchItem.searchType]
      );
    } catch (error) {
      console.error('Error adding to search history:', error);
      throw error;
    }
  }

  static async getSearchHistory(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  }

  static async removeFromSearchHistory(userId, itemId) {
    try {
      await pool.execute(
        'DELETE FROM search_history WHERE user_id = ? AND item_id = ?',
        [userId, itemId]
      );
    } catch (error) {
      console.error('Error removing from search history:', error);
      throw error;
    }
  }
}