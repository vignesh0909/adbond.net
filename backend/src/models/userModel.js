const { query } = require('../config/db');

// User model with PostgreSQL
const userModel = {
  // Create a new user
  async createUser({ username, email, password }) {
    try {
      const result = await query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, password]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const result = await query('SELECT * FROM users WHERE user_id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user by ID: ${error.message}`);
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user by email: ${error.message}`);
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const result = await query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting all users: ${error.message}`);
    }
  },

  // Update user
  async updateUser(id, userData) {
    const { username, email } = userData;
    try {
      const result = await query(
        'UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *',
        [username, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const result = await query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },
};

module.exports = userModel;