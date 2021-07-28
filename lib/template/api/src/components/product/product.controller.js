/**
 * This is the controller for product features
 */
class ProductController {
    /**
     * @param {import('./product.service')} productService
     */
    constructor(productService) {
        /** @protected */
        this._productService = productService;
    }

    async getProducts() {
        const products = await this._productService.getProducts();
        
        return products;
    }
}

module.exports = ProductController;
