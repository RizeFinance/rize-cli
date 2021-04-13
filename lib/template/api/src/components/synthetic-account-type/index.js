/**
 * Import all of the synthetic account type component dependencies and return an intialized synthetic account type component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
) => {

    const SyntheticAccountTypeService = require('./synthetic-account-type.service');
    const SyntheticAccountTypeController = require('./synthetic-account-type.controller');
    const SyntheticAccountTypeRouter = require('./synthetic-account-type.router');

    /* Instantiate the services */
    const syntheticAccountTypeService = new SyntheticAccountTypeService(dbProvider);

    /* Instantiate the controllers */
    const syntheticAccountTypeController = new SyntheticAccountTypeController(syntheticAccountTypeService);

    /* Instantiate the routers */
    const syntheticAccountTypeRouter = new SyntheticAccountTypeRouter(
        syntheticAccountTypeController,
        authGuard,
        paginationSanitizer
    );

    return syntheticAccountTypeRouter;
};
