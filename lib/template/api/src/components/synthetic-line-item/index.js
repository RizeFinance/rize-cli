/**
 * Import all of the synthetic line items component dependencies and return an intialized synthetic line items component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider
) => {

    const SyntheticLineItemService = require('./synthetic-line-item.service');
    const SyntheticLineItemController = require('./synthetic-line-item.controller');
    const SyntheticLineItemRouter = require('./synthetic-line-item.router');

    /* Instantiate the validators */
    const syntheticLineItemValidator = require('./synthetic-line-item.validator');

    /* Instantiate the services */
    const syntheticLineItemService = new SyntheticLineItemService(dbProvider);

    /* Instantiate the controllers */
    const syntheticLineItemController = new SyntheticLineItemController(syntheticLineItemService);

    /* Instantiate the routers */
    const syntheticLineItemRouter = new SyntheticLineItemRouter(
        syntheticLineItemController,
        authGuard,
        paginationSanitizer,
        syntheticLineItemValidator
    );

    return syntheticLineItemRouter;
};
