const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateCreate: [
        body('source_synthetic_account_uid').notEmpty().withMessage('source_synthetic_account_uid is required'),
        body('destination_synthetic_account_uid').notEmpty().withMessage('destination_synthetic_account_uid is required'),
        body('usd_transfer_amount').notEmpty().withMessage('usd_transfer_amount is required'),
        validationResultHandler
    ]
};
