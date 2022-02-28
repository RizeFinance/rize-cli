const { body, query } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateGetList: [
        query('product_uid').toArray(),
        validationResultHandler
    ],
    validateCreateWorkflow: [
        body('product_uid').notEmpty().withMessage('product_uid is required'),
    ],
    validateBatchAcknowledge: [
        body('documents').toArray(),
        validationResultHandler
    ]
};
