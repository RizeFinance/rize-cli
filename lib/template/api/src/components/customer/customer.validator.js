const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateProfileAnswers: [
        body('answers').toArray(),
        validationResultHandler
    ]
};
