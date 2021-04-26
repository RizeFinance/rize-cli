/**
 * Import all of the debit card component dependencies and return an intialized debit card component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider
) => {

    const DebitCardService = require('./debit-card.service');
    const DebitCardController = require('./debit-card.controller');
    const DebitCardRouter = require('./debit-card.router');

    /* Instantiate the validators */
    const debitCardValidator = require('./debit-card.validator');

    /* Instantiate the services */
    const debitCardService = new DebitCardService(dbProvider);

    /* Instantiate the controllers */
    const debitCardController = new DebitCardController(debitCardService);

    /* Instantiate the routers */
    const debitCardRouter = new DebitCardRouter(
        debitCardController,
        authGuard,
        paginationSanitizer,
        debitCardValidator
    );

    return debitCardRouter;
};
