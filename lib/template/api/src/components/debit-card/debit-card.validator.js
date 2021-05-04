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
    validateReissue: [
        body('reissue_reason').notEmpty().withMessage('reissue_reason is required'),
        body('reissue_reason').isIn(['damaged', 'lost', 'stolen']).withMessage('reissue_reason is not valid. Allowed values are "damaged", "lost", or "stolen"'),
        validationResultHandler
    ]
};
