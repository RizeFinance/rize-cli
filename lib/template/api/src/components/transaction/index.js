/**
 * Import all of the transaction component dependencies and return an intialized transaction component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
    rizeProvider,
    rmqClient,
    logger,
) => {

    const TransactionService = require('./transaction.service');
    const TransactionEventService = require('../transaction-event/transaction-event.service');
    const SyntheticLineItemService = require('../synthetic-line-item/synthetic-line-item.service');
    const CustodialLineItemService = require('../custodial-line-item/custodial-line-item.service');
    const TransactionController = require('./transaction.controller');
    const TransactionRouter = require('./transaction.router');

    /* Instantiate the services */
    const transactionService = new TransactionService(dbProvider, rizeProvider);
    const transactionEventService = new TransactionEventService(dbProvider, rizeProvider);
    const syntheticLineItemService = new SyntheticLineItemService(dbProvider, rizeProvider);
    const custodialLineItemService = new CustodialLineItemService(dbProvider, rizeProvider);

    /* Instantiate the controllers */
    const transactionController = new TransactionController(transactionService);

    /* Instantiate the routers */
    const transactionRouter = new TransactionRouter(
        transactionController,
        authGuard,
        paginationSanitizer
    );

    /* Subscribe to transactions RMQ topic */
    const subscribeToTransactions = require('./transaction.rmq');
    subscribeToTransactions(
        rmqClient,
        transactionService,
        transactionEventService,
        syntheticLineItemService,
        custodialLineItemService,
        logger
    );

    return transactionRouter;
};
