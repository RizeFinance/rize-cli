const { createLogger, format, transports } = require('winston');
const { combine, timestamp, simple, colorize, errors } = format;
const config = require('../config/config.js');

module.exports = function () {

    const logger = createLogger({
        level: config['sysloglevel'],
        format: combine(
            colorize(),
            errors({ stack: true }),
            timestamp(),
            simple()
        ),
        transports: [new transports.Console()]
    });

    return logger;
};
