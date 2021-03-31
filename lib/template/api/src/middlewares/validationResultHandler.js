const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array({ onlyFirstError: true }) });
    } else {
        next();
    }
};
