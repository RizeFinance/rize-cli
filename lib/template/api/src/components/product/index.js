/**
 * Import all of the product dependencies and return an intialized product component, which is an instance of the expressjs router
 */
module.exports = (
    authGuard,
    rizeProvider
) => {

    const ProductService = require('./product.service');
    const ProductController = require('./product.controller');
    const ProductRouter = require('./product.router');

    /* Instantiate the services */
    const productService = new ProductService(rizeProvider);

    /* Instantiate the controllers */
    const productController = new ProductController(productService);

    /* Instantiate the routers */
    const productRouter = new ProductRouter(
        productController,
        authGuard
    );

    return productRouter;
};
