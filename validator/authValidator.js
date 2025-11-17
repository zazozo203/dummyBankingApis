const { check,body } = require('express-validator');

exports.registerValidator = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];



exports.loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];


exports.transferValidator = [
 
  body('receiverAccountId')
    .trim()
    .notEmpty().withMessage('receiverAccountId is required')
    .isString().withMessage('receiverAccountId must be a string')
    .custom((value, { req }) => {
      if (value === req.body.senderAccountId) {
        throw new Error('senderAccountId and receiverAccountId cannot be the same');
      }
      return true;
    }),

  body('amount')
    .notEmpty().withMessage('amount is required')
    .isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
];