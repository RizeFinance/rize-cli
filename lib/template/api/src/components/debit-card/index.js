/**
 * Import all of the debit card component dependencies and return an intialized debit card component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
    rizeProvider,
    rmqClient,
    logger
) => {

    const DebitCardService = require('./debit-card.service');
    const DebitCardController = require('./debit-card.controller');
    const DebitCardRouter = require('./debit-card.router');
    const PoolService = require('../pool/pool.service');

    /* Instantiate the validators */
    const debitCardValidator = require('./debit-card.validator');

    /* Instantiate the services */
    const debitCardService = new DebitCardService(dbProvider, rizeProvider);
    const poolService = new PoolService(dbProvider, rizeProvider);

    /* Instantiate the controllers */
    const debitCardController = new DebitCardController(debitCardService, poolService);

    /* Instantiate the routers */
    const debitCardRouter = new DebitCardRouter(
        debitCardController,
        authGuard,
        paginationSanitizer,
        debitCardValidator
    );

    /* Subscribe to debit card RMQ topic */
    const subscribeToDebitCards = require('./debit-card.rmq');
    subscribeToDebitCards(
        rmqClient,
        debitCardService,
        logger
    );

    return debitCardRouter;
};
