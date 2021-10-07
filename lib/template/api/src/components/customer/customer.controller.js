/**
 * This is the controller for customer-related features
 */
class CustomerController {
    /**
     * @param {import('./customer.service')} customerService
     */
    constructor(customerService) {
        /** @protected */
        this._customerService = customerService;
    }

    async getCustomer(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const rizeCustomer = await this._customerService.getRizeCustomer(customer.uid);       
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(rizeCustomer);

        return dbCustomer;
    }

    async updateCustomer(customerExternalUid, customerEmail, customerDetails) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const latestCustomer = await this._customerService.updateCustomerInRize(customer.uid, customerEmail, customerDetails);

        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(latestCustomer);

        await this._customerService.updateCustomerInDb(dbCustomer);
    }

    async answerProfileQuestions(customerExternalUid, data) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);

        await this._customerService.answerProfileQuestions(customer.uid, data.answers);
    }

    async getCustomerProducts(customerExternalUid, limit = 100, offset = 0) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const customerProducts = await this._customerService.getCustomerProducts(
            customer.uid,
            limit,
            offset
        );
        return customerProducts;
    }

    async createCustomerProduct(customerExternalUid, productUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        
        await this._customerService.createCustomerProduct(customer.uid, productUid);
    }
}

module.exports = CustomerController;
