const express = require('express');
const router = express.Router();
const { signup, login, refresh, logout } = require('../controllers/authController');
const { refreshTokenAuth } = require('../middlewares/authentication');

router.post('/signup', signup);

router.post('/login', login);

router.post('/refresh', refreshTokenAuth, refresh);

router.get('/logout', logout);

module.exports = router;