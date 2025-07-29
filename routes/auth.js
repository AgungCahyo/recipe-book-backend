const express = require('express');
const router = express.Router();
const { loginWithGoogle } = require('../controllers/authController');
const authenticateUser = require('../middleware/authenticateUser');

router.post('/google',authenticateUser, loginWithGoogle);

module.exports = router;
