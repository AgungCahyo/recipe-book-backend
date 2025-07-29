const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authenticateUser = require('../middleware/authenticateUser');
const { createUser, getUser, deleteUser } = require('../controllers/usersController');

router.use(authenticateUser);

router.post('/', createUser);

router.get('/:userId', getUser);

router.delete('/:userId', deleteUser);

module.exports = router;
