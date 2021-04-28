const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateBatchAcknowledge: [
        body('documents').toArray(),
        validationResultHandler
    ]
};
