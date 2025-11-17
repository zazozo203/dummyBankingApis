const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { registerValidator, loginValidator } = require('../validator/authValidator');
// const auth = require('../utils/authMiddleware');


router.post('/register',registerValidator, authController.register);
router.post('/login',loginValidator, authController.login);


module.exports = router;