const userModel = require('../models/userModel');

// User controller
const userController = {
  // Register a new user
  async registerUser(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const userExists = await userModel.getUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const user = await userModel.createUser({ username, email, password });
      
      res.status(201).json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { username, email } = req.body;
      
      // Check if user exists
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const updatedUser = await userModel.updateUser(req.params.id, { 
        username: username || user.username,
        email: email || user.email
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      // Check if user exists
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      await userModel.deleteUser(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userController;