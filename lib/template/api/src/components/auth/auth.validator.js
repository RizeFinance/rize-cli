const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateRegister: [
        body('username').isEmail().withMessage('username should be a valid email'),
        body('username').notEmpty().withMessage('username is required'),
        body('password').notEmpty().withMessage('password is required'),
        body('password').isStrongPassword({
            minLength: 10,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }).withMessage('password should be at least 10 characters and contains at least one uppercase letter, one lowercase letter, one number, and one special character'),
        validationResultHandler
    ],
    validateAuthenticate: [
        body('username').notEmpty().withMessage('username is required'),
        body('password').notEmpty().withMessage('password is required'),
        validationResultHandler
    ],
    validateForgotPassword: [
        body('email').notEmpty().withMessage('email is required'),
        body('email').isEmail().withMessage('email is invalid'),
        validationResultHandler
    ],
    validateConfirmPassword: [
        body('email').notEmpty().withMessage('email is required'),
        body('email').isEmail().withMessage('email is invalid'),
        body('code').notEmpty().withMessage('code is required'),
        body('password').notEmpty().withMessage('password is required'),
        validationResultHandler
    ],
    validateSetPassword: [
        body('username').notEmpty().withMessage('username is required'),
        body('username').isEmail().withMessage('username is invalid'),
        body('old_password').notEmpty().withMessage('old password is required'),
        body('new_password').notEmpty().withMessage('new password is required'),
        body('new_password').isStrongPassword({
            minLength: 10,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }).withMessage('new password should be at least 10 characters and contains at least one uppercase letter, one lowercase letter, one number, and one special character'),
        validationResultHandler
    ]
};
