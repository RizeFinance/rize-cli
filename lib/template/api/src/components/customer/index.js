/**
 * Import all of the customer component dependencies and return an intialized customer component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    dbProvider,
    rizeProvider,
    rmqClient,
    logger,
) => {

    const CustomerService = require('./customer.service');
    const CustomerController = require('./customer.controller');
    const CustomerRouter = require('./customer.router');

    const ProductService = require('../product/product.service');
    const ComplianceWorkflowService = require('../compliance-workflow/compliance-workflow.service');

    /* Instantiate the validators */
    const customerValidator = require('./customer.validator');

    /* Instantiate the services */
    const customerService = new CustomerService(dbProvider, rizeProvider);
    const productService = new ProductService(rizeProvider);
    const complianceWorkflowService = new ComplianceWorkflowService(rizeProvider);

    /* Instantiate the controllers */
    const customerController = new CustomerController(customerService, productService, complianceWorkflowService);

    /* Instantiate the routers */
    const customerRouter = new CustomerRouter(customerController, authGuard, customerValidator);

    /* Subscribe to customer RMQ topic */
    require('./customer.rmq')(
        rmqClient,
        customerService,
        logger
    );

    return customerRouter;
};
