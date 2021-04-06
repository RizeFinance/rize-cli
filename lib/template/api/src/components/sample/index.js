/**
 * Import all of the sample component dependencies and return an intialized sample component, which is an instance of the expressjs router
 *
 */
module.exports = (authGuard, logger) => {

    const SampleRouter = require('./sample.router');

    /* Instantiate the routers */
    const sampleRouter = new SampleRouter(authGuard, logger);

    return sampleRouter;
};
