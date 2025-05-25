const express = require('express');
const userController = require('../controllers/userController');

const userModel = require("../models/user.model.pg");
const entityModel = require("../models/entity.model.pg");
const addtFeaturesModel = require("../models/additional_features.model.pg");
const systemFeaturesModel = require("../models/system_features.model.pg");

const router = express.Router();

// Routes
// router.post('/', userController.registerUser);
// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

module.exports = router;