const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateRegister: [
        body('username').notEmpty().withMessage('username is required'),
        body('password').notEmpty().withMessage('password is required'),
        validationResultHandler
    ]
};
