/**
 * This is the entrypoint to the application programmer interface.
 */

/**
 * Catch and log uncaught exceptions as soon as they happen, log them, then exit with error code 1.
 * Do this before loading anything else.
 */
process.on('uncaughtException', (exception) => {
    // eslint-disable-next-line no-console
    console.error(`An uncaughtException happened:\n${exception}`);
    process.exit(1);
});

const express = require('express');
const os = require('os');

const config = require('./config/config.js');
const logger = require('./utils/logger.js')();

/**
 * Instanitate an ExpressJS webserver.
 * Later on, this should probably be turned into a "core" module that we import into here and inject into the "components".
 */
const app = express();
const server = require('http').Server(app);

// Set the port we are listening to
const listen = (httpServer, port) => {
    return new Promise((resolve) => {
        httpServer.listen(port, () => {
            logger.info(`api-server: listening on ${os.hostname()}:${port}`);
            resolve();
        });
    });
};

// Set the headers
const cors = (expressApp, origin, headers) => {
    return new Promise((resolve) => {
        expressApp.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Headers', headers);
            next();
        });
        resolve();
    });
};

/**
 * Send error code to client side
 */
const clientErrorHandler = (err, req, res, next) => {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' });
    } else {
        next(err);
    }
};

/**
 * The “catch-all” errorHandler function
 */
const errorHandler = (err, req, res, next) => {
    res.sendStatus(500);
    next();
};

/**
 * Use logger to log error
 */
const logErrors = (err, req, res, next) => {
    logger.error(err);
    if (err.response && err.response.data) {
        logger.error(JSON.stringify(err.response.data));
    }
    next(err);
};

/**
 * Catches urls that do not match and return 404
 */
const notFoundErrors = (req, res, next) => {
    res.status(404).send({ error: 'URL Not Found' });
    next();
};

const healthCheck = (req, res) => {
    res.status(200).send({ success: true });
};

/**
 * Initialize the express application
 */
Promise
    .all([
        listen(server, config.port),
        cors(app, config.cors_allow_origin, config.cors_allow_headers),
    ])
    .then(() => {
        /**
         * Init providers
         */
        const Rize = require('@rizefinance/rize-js');
        const rizeProvider = new Rize(config.rize.programId, config.rize.apiSecret);
        const dbProvider = require('./providers/db')(config.database);
        const authProvider = require('./providers/auth/auth.factory').create(config.auth.provider, config.auth);

        /**
         * Init middlewares
         */
        const authGuard = require('./middlewares/authGuard')(authProvider);
        const paginationSanitizer = require('./middlewares/paginationSanitizer');

        /**
         * Import the components. Each component is an instance of an ExpressJS router.
         */
        const authComponent = require('./components/auth')(
            authProvider,
            rizeProvider,
            dbProvider
        );
        const sampleComponent = require('./components/sample')(
            authGuard,
            logger
        );
        const customerComponent = require('./components/customer')(
            authGuard,
            dbProvider,
        );
        const syntheticAccountTypeComponent = require('./components/synthetic-account-type')(
            authGuard,
            paginationSanitizer,
            dbProvider,
        );
        const syntheticAccountComponent = require('./components/synthetic-account')(
            authGuard,
            paginationSanitizer,
            dbProvider,
            rizeProvider,
        );
        const syntheticLineItemComponent = require('./components/synthetic-line-item')(
            authGuard,
            paginationSanitizer,
            dbProvider
        );
        const transactionComponent = require('./components/transaction')(
            authGuard,
            paginationSanitizer,
            dbProvider
        );
        const transactionEventComponent = require('./components/transaction-event')(
            authGuard,
            paginationSanitizer,
            dbProvider
        );
        const custodialAccountComponent = require('./components/custodial-account')(
            authGuard,
            paginationSanitizer,
            dbProvider
        );
        const custodialLineItemComponent = require('./components/custodial-line-item')(
            authGuard,
            paginationSanitizer,
            dbProvider
        );

        /**
         * Bind the components to the express application
         */
        app.use('/health-check', healthCheck);
        app.use('/auth', authComponent);
        app.use('/sample', sampleComponent);
        app.use('/customer', customerComponent);
        app.use('/synthetic_account_types', syntheticAccountTypeComponent);
        app.use('/synthetic_accounts', syntheticAccountComponent);
        app.use('/synthetic_line_items', syntheticLineItemComponent);
        app.use('/transactions', transactionComponent);
        app.use('/transaction_events', transactionEventComponent);
        app.use('/custodial_accounts', custodialAccountComponent);
        app.use('/custodial_line_items', custodialLineItemComponent);

        app.use('*', notFoundErrors);
        app.use(logErrors);
        app.use(clientErrorHandler);
        app.use(errorHandler);
    })
    .catch((reason) => {
        logger.error(reason);
    });
