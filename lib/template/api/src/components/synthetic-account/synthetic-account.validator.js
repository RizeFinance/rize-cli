const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateCreate: [
        body('name').notEmpty().withMessage('name is required'),
        body('pool_uid').notEmpty().withMessage('pool_uid is required'),
        body('synthetic_account_type_uid').notEmpty().withMessage('synthetic_account_type_uid is required'),
        validationResultHandler
    ],
    validateUpdate: [
        body('name').notEmpty().withMessage('name is required'),
        validationResultHandler
    ],
};
