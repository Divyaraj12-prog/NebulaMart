const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const validators = require('../middlewares/validator.middleware');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Basic /auth/register handler for tests
router.post('/register', validators.registerValidator, authController.registerUser);

// login
router.post('/login', validators.loginValidator, authController.loginUser);

//Me 
router.get('/me',authMiddleware.getCurrentUser,authController.getCurrentUser);

// Logout route
router.get('/logout',authMiddleware.getCurrentUser,authController.logoutUser);

// Get user addresses
router.get('/users/me/addresses', authMiddleware.getCurrentUser, authController.getUserAddresses);

// Add new address
router.post('/users/me/addresses', validators.addUserAddressValidator, authMiddleware.getCurrentUser, authController.addUserAddress);

// Delete address
router.delete('/users/me/addresses/:addressId', authMiddleware.getCurrentUser, authController.deleteUserAddress);

module.exports = router;
