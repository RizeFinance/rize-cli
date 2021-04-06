/**
 * Import all of the auth component dependencies and return an intialized auth component, which is an instance of the expressjs router
 *
 */
module.exports = (
    authProvider,
    rizeProvider,
    dbProvider
) => {

    const CustomerService = require('../customer/customer.service');
    const AuthService = require('./auth.service');
    const AuthController = require('./auth.controller');
    const AuthRouter = require('./auth.router');

    /* Instantiate the validators */
    const authValidator = require('./auth.validator');

    /* Instantiate the services */
    const customerService = new CustomerService(dbProvider, rizeProvider);
    const authService = new AuthService(authProvider, rizeProvider);

    /* Instantiate the controllers */
    const authController = new AuthController(authService, customerService);

    /* Instantiate the routers */
    const authRouter = new AuthRouter(authController, authValidator);

    return authRouter;
};
