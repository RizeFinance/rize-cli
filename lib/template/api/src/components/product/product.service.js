/**
 * This is the service for product features
 */
class ProductService {
    /**
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(rizeProvider) {
        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    async getProducts () {
        return await this._rizeProvider.product.getList();
    }

    async getProduct (productUid) {
        return await this._rizeProvider.product.get(productUid);
    }
}

module.exports = ProductService;
