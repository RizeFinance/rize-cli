const { query } = require('express-validator');

module.exports = [
    query('limit').toInt(),
    query('offset').toInt(),
];