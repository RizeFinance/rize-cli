/**
 * Import all of the synthetic account component dependencies and return an intialized synthetic account component, which is an instance of the expressjs router
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

    const SyntheticAccountService = require('./synthetic-account.service');
    const PoolService = require('../pool/pool.service');
    const CustodialAccountService = require('../custodial-account/custodial-account.service');
    const SyntheticAccountController = require('./synthetic-account.controller');
    const SyntheticAccountRouter = require('./synthetic-account.router');

    /* Instantiate the validators */
    const syntheticAccountValidator = require('./synthetic-account.validator');

    /* Instantiate the services */
    const syntheticAccountService = new SyntheticAccountService(dbProvider, rizeProvider);
    const poolService = new PoolService(dbProvider, rizeProvider);
    const custodialAccountService = new CustodialAccountService(rizeProvider, dbProvider);

    /* Instantiate the controllers */
    const syntheticAccountController = new SyntheticAccountController(syntheticAccountService, poolService);

    /* Instantiate the routers */
    const syntheticAccountRouter = new SyntheticAccountRouter(
        syntheticAccountController,
        authGuard,
        paginationSanitizer,
        syntheticAccountValidator,
    );

    /* Subscribe to synthetic accounts RMQ topic */
    require('./synthetic-account.rmq')(
        rmqClient,
        syntheticAccountService,
        custodialAccountService,
        poolService,
        logger
    );

    return syntheticAccountRouter;
};
