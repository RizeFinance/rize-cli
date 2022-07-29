/**
 * Import all of the compliance workflow component dependencies and return an intialized compliance workflow component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    paginationSanitizer,
    dbProvider,
    rizeProvider
) => {

    const ComplianceWorkflowService = require('./compliance-workflow.service');
    const CustomerService = require('../customer/customer.service');
    const ProductService = require('../product/product.service');
    const ComplianceWorkflowController = require('./compliance-workflow.controller');
    const ComplianceWorkflowRouter = require('./compliance-workflow.router');

    /* Instantiate the validators */
    const complianceWorkflowValidator = require('./compliance-workflow.validator');

    /* Instantiate the services */
    const complianceWorkflowService = new ComplianceWorkflowService(rizeProvider);
    const customerService = new CustomerService(dbProvider, rizeProvider);
    const productService = new ProductService(rizeProvider);

    /* Instantiate the controllers */
    const complianceWorkflowController = new ComplianceWorkflowController(complianceWorkflowService, customerService, productService);

    /* Instantiate the routers */
    const complianceWorkflowRouter = new ComplianceWorkflowRouter(
        complianceWorkflowController,
        authGuard,
        paginationSanitizer,
        complianceWorkflowValidator
    );

    return complianceWorkflowRouter;
};
