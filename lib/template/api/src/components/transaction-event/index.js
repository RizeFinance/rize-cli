/**
 * Import all of the synthetic account type component dependencies and return an intialized synthetic account type component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
) => {

    const TransactionEventService = require('./transaction-event.service');
    const TransactionEventController = require('./transaction-event.controller');
    const TransactionEventRouter = require('./transaction-event.router');

    /* Instantiate the validators */
    const transactionEventValidator = require('./transaction-event.validator');

    /* Instantiate the services */
    const transactionEventService = new TransactionEventService(dbProvider);

    /* Instantiate the controllers */
    const transactionEventController = new TransactionEventController(transactionEventService);

    /* Instantiate the routers */
    const transactionEventRouter = new TransactionEventRouter(
        transactionEventController,
        authGuard,
        paginationSanitizer,
        transactionEventValidator
    );

    return transactionEventRouter;
};
