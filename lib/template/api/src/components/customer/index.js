/**
 * Import all of the customer component dependencies and return an intialized customer component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authGuard,
    dbProvider,
) => {

    const CustomerService = require('../customer/customer.service');
    const CustomerController = require('./customer.controller');
    const CustomerRouter = require('./customer.router');

    /* Instantiate the services */
    const customerService = new CustomerService(dbProvider);

    /* Instantiate the controllers */
    const customerController = new CustomerController(customerService);

    /* Instantiate the routers */
    const customerRouter = new CustomerRouter(customerController, authGuard);

    return customerRouter;
};
