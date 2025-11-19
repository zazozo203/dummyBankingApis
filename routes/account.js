const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const { transferValidator } = require('../validator/authValidator');
const auth = require('../utils/authMiddleware');

router.post('/transfer',auth,transferValidator, accountController.transferFunds);
router.get('/details',auth, accountController.checkAccountDetails);

module.exports = router;