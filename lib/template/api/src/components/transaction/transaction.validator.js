const { query } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateGetList: [
        query('synthetic_account_uid').toArray(),
        validationResultHandler
    ]
};
