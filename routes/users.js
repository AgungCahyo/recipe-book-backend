const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const { createUser, getUser, deleteUser, getProfile, updateUser } = require('../controllers/usersController');

router.use(authenticateUser);

router.post('/', createUser);

router.get('/me', getProfile);

router.get('/:userId', getUser);

router.put('/:userId', updateUser)

router.delete('/:userId', deleteUser);

module.exports = router;
