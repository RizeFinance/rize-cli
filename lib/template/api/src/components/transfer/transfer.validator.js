const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateCreate: [
        body('source_synthetic_account_uid').notEmpty().withMessage('source_synthetic_account_uid is required'),
        body('destination_synthetic_account_uid').notEmpty().withMessage('destination_synthetic_account_uid is required'),
        body('destination_synthetic_account_uid')
            .if((value, { req }) => {
                if (value === req.body.source_synthetic_account_uid) {
                    throw 'destination_synthetic_account_uid should not be the same as source_synthetic_account_uid';
                }
            }),
        body('usd_transfer_amount').notEmpty().withMessage('usd_transfer_amount is required'),
        body('usd_transfer_amount').isNumeric().withMessage('usd_transfer_amount should be a number'),
        body('usd_transfer_amount').isFloat({ gt: 0 }).withMessage('usd_transfer_amount should be a positive number'),
        validationResultHandler
    ]
};
