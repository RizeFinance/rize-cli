/**
 * Import all of the document dependencies and return an intialized document component, which is an instance of the expressjs router
 */
module.exports = (
    authGuard,
    dbProvider,
    rizeProvider
) => {

    const DocumentService = require('./document.service');
    const CustomerService = require('../customer/customer.service');
    const DocumentController = require('./document.controller');
    const DocumentRouter = require('./document.router');

    /* Instantiate the services */
    const documentService = new DocumentService(rizeProvider);
    const customerService = new CustomerService(dbProvider, rizeProvider);

    /* Instantiate the controllers */
    const documentController = new DocumentController(documentService, customerService);

    /* Instantiate the routers */
    const documentRouter = new DocumentRouter(
        documentController,
        authGuard
    );

    return documentRouter;
};
