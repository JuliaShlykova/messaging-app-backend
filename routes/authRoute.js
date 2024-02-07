const express = require('express');
const { signup, login, refresh, logout } = require('../controllers/authController');
const { refreshTokenAuth } = require('../middlewares/authentication');

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/refresh', refreshTokenAuth, refresh);

router.post('/logout', logout);

module.exports = router;