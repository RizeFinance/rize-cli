const { query } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateGetList: [
        query('transaction_uid').toArray(),
        validationResultHandler
    ]
};
