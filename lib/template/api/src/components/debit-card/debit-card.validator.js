const { query } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateGetList: [
        query('pool_uid').toArray(),
        validationResultHandler
    ]
};
