const { body } = require('express-validator');
const validationResultHandler = require('../../middlewares/validationResultHandler');

module.exports = {
    validateCreateCustomer: [
        body('email').notEmpty().withMessage('Email is required'),
        body('customer_type').notEmpty().withMessage('Customer Type is required'),
        body('product_uid').notEmpty().withMessage('Product Uid is required'),
    ],
    validateProfileAnswers: [
        body('answers').toArray(),
        validationResultHandler
    ]
};
