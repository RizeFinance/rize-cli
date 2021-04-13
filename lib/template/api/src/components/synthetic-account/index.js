/**
 * Import all of the synthetic account component dependencies and return an intialized synthetic account component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
) => {

    const SyntheticAccountService = require('./synthetic-account.service');
    const SyntheticAccountController = require('./synthetic-account.controller');
    const SyntheticAccountRouter = require('./synthetic-account.router');

    /* Instantiate the services */
    const syntheticAccountService = new SyntheticAccountService(dbProvider);

    /* Instantiate the controllers */
    const syntheticAccountController = new SyntheticAccountController(syntheticAccountService);

    /* Instantiate the routers */
    const syntheticAccountRouter = new SyntheticAccountRouter(
        syntheticAccountController,
        authGuard,
        paginationSanitizer
    );

    return syntheticAccountRouter;
};
