const { query } = require('express-validator');

module.exports = [
    query('limit').default(100).toInt(),
    query('offset').default(0).toInt(),
];