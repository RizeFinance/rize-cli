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
        return customer;
    }

    async verifyIdentity(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const updatedRizeCustomer = await this._customerService.verifyIdentity(customer.uid);
        
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(updatedRizeCustomer);

        await this._customerService.updateCustomerInDb(dbCustomer);
    }
}

module.exports = CustomerController;
