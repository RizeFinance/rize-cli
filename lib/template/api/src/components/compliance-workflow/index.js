/**
 * Import all of the compliance workflow component dependencies and return an intialized compliance workflow component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    dbProvider,
    rizeProvider
) => {

    const ComplianceWorkflowService = require('./compliance-workflow.service');
    const CustomerService = require('../customer/customer.service');
    const ComplianceWorkflowController = require('./compliance-workflow.controller');
    const ComplianceWorkflowRouter = require('./compliance-workflow.router');

    /* Instantiate the services */
    const complianceWorkflowService = new ComplianceWorkflowService(rizeProvider);
    const customerService = new CustomerService(dbProvider);

    /* Instantiate the controllers */
    const complianceWorkflowController = new ComplianceWorkflowController(complianceWorkflowService, customerService);

    /* Instantiate the routers */
    const complianceWorkflowRouter = new ComplianceWorkflowRouter(
        complianceWorkflowController,
        authGuard
    );

    return complianceWorkflowRouter;
};
