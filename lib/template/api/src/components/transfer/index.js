/**
 * Import all of the transfer component dependencies and return an intialized transfer component, which is an instance of the expressjs router
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

    const SyntheticAccountService = require('../synthetic-account/synthetic-account.service');
    const CustomerService = require('../customer/customer.service');
    const TransferService = require('./transfer.service');
    const TransactionService = require('../transaction/transaction.service');
    const TransferController = require('./transfer.controller');
    const TransferRouter = require('./transfer.router');

    /* Instantiate the validators */
    const transferValidator = require('./transfer.validator');

    /* Instantiate the services */
    const transferService = new TransferService(dbProvider, rizeProvider);
    const syntheticAccountService = new SyntheticAccountService(dbProvider, rizeProvider);
    const customerService = new CustomerService(dbProvider);
    const transactionService = new TransactionService(dbProvider, rizeProvider);

    /* Instantiate the controllers */
    const transferController = new TransferController(transferService, syntheticAccountService, customerService, transactionService);

    /* Instantiate the routers */
    const transferRouter = new TransferRouter(
        transferController,
        authGuard,
        paginationSanitizer,
        transferValidator,
    );

    /* Subscribe to transfer RMQ topic */
    const subscribeToTransfer = require('./transfer.rmq');
    subscribeToTransfer(
        rmqClient,
        transferService,
        logger
    );

    return transferRouter;
};
