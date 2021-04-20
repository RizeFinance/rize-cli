/**
 * Import all of the custodial account component dependencies and return an intialized custodial account component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
    rizeProvider
) => {

    const CustodialAccountService = require('./custodial-account.service');
    const CustodialAccountController = require('./custodial-account.controller');
    const CustodialAccountRouter = require('./custodial-account.router');

    /* Instantiate the services */
    const custodialAccountService = new CustodialAccountService(rizeProvider, dbProvider);

    /* Instantiate the controllers */
    const custodialAccountController = new CustodialAccountController(custodialAccountService);

    /* Instantiate the routers */
    const custodialAccountRouter = new CustodialAccountRouter(
        custodialAccountController,
        authGuard,
        paginationSanitizer
    );

    return custodialAccountRouter;
};
