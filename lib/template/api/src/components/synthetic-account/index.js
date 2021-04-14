/**
 * Import all of the synthetic account component dependencies and return an intialized synthetic account component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
    rizeProvider,
) => {

    const SyntheticAccountService = require('./synthetic-account.service');
    const PoolService = require('../pool/pool.service');
    const SyntheticAccountController = require('./synthetic-account.controller');
    const SyntheticAccountRouter = require('./synthetic-account.router');

    /* Instantiate the validators */
    const syntheticAccountValidator = require('./synthetic-account.validator');

    /* Instantiate the services */
    const syntheticAccountService = new SyntheticAccountService(dbProvider, rizeProvider);
    const poolService = new PoolService(dbProvider);

    /* Instantiate the controllers */
    const syntheticAccountController = new SyntheticAccountController(syntheticAccountService, poolService);

    /* Instantiate the routers */
    const syntheticAccountRouter = new SyntheticAccountRouter(
        syntheticAccountController,
        authGuard,
        paginationSanitizer,
        syntheticAccountValidator,
    );

    return syntheticAccountRouter;
};
