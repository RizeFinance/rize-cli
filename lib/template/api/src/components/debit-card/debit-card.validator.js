const { body, query } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateGetList: [
        query('pool_uid').toArray(),
        validationResultHandler
    ],
    validateLock: [
        body('reason').notEmpty().withMessage('reason is required'),
        validationResultHandler
    ],
    validateReIssueReason: [
        body('reissue_reason').notEmpty().withMessage('reissue_reason is required'),
        body('reissue_reason').isIn(['damaged', 'lost', 'stolen']).withMessage('reissue_reason value does not valid'),
        validationResultHandler
    ]
};
