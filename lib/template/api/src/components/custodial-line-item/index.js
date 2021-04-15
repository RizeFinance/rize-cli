/**
 * Import all of the custodial line item component dependencies and return an intialized custodial line item component, which is an instance of the expressjs router
 *
 */

module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider
) => {

    const CustodialLineItemService = require('./custodial-line-item.service');
    const CustodialLineItemController = require('./custodial-line-item.controller');
    const CustodialLineItemRouter = require('./custodial-line-item.router');

    const custodialLineItemValidator = require('./custodial-line-item.validator');

    /* Instantiate the services */
    const custodialLineItemService = new CustodialLineItemService(dbProvider);

    /* Instantiate the controllers */
    const custodialLineItemController = new CustodialLineItemController(custodialLineItemService);

    /* Instantiate the routers */
    const custodialLineItemRouter = new CustodialLineItemRouter(
        custodialLineItemController,
        authGuard,
        paginationSanitizer,
        custodialLineItemValidator
    );

    return custodialLineItemRouter;
};
