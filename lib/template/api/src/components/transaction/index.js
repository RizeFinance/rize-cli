/**
 * Import all of the transaction component dependencies and return an intialized transaction component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
) => {

    const TransactionService = require('./transaction.service');
    const TransactionController = require('./transaction.controller');
    const TransactionRouter = require('./transaction.router');

    /* Instantiate the services */
    const transactionService = new TransactionService(dbProvider);

    /* Instantiate the controllers */
    const transactionController = new TransactionController(transactionService);

    /* Instantiate the routers */
    const transactionRouter = new TransactionRouter(
        transactionController,
        authGuard,
        paginationSanitizer
    );

    return transactionRouter;
};
