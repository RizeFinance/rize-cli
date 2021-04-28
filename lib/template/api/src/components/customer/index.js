/**
 * Import all of the customer component dependencies and return an intialized customer component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    dbProvider,
    rizeProvider,
) => {

    const CustomerService = require('./customer.service');
    const CustomerController = require('./customer.controller');
    const CustomerRouter = require('./customer.router');

    /* Instantiate the services */
    const customerService = new CustomerService(dbProvider, rizeProvider);

    /* Instantiate the controllers */
    const customerController = new CustomerController(customerService);

    /* Instantiate the routers */
    const customerRouter = new CustomerRouter(customerController, authGuard);

    return customerRouter;
};
