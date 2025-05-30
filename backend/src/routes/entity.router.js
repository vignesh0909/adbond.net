const express = require('express');
const router = express.Router();
const pgConnection = require("../models/entity.model.pg").pool;

// Routes
// router.post('/', userController.registerUser);
// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

module.exports = router;