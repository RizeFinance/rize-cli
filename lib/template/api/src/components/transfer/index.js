/**
 * Import all of the transfer component dependencies and return an intialized transfer component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
    rizeProvider,
) => {

    const SyntheticAccountService = require('../synthetic-account/synthetic-account.service');
    const TransferService = require('./transfer.service');
    const TransferController = require('./transfer.controller');
    const TransferRouter = require('./transfer.router');

    /* Instantiate the validators */
    const transferValidator = require('./transfer.validator');

    /* Instantiate the services */
    const transferService = new TransferService(dbProvider, rizeProvider);
    const syntheticAccountService = new SyntheticAccountService(dbProvider);

    /* Instantiate the controllers */
    const transferController = new TransferController(transferService, syntheticAccountService);

    /* Instantiate the routers */
    const transferRouter = new TransferRouter(
        transferController,
        authGuard,
        paginationSanitizer,
        transferValidator,
    );

    return transferRouter;
};
