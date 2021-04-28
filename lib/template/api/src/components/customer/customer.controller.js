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

    async updateCustomer(customerExternalUid, customerEmail, customerDetails) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const latestCustomer = await this._customerService.updateCustomerInRize(customer.uid, customerEmail, customerDetails);

        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(latestCustomer);

        delete dbCustomer.ssn_last_four;
        delete dbCustomer.total_balance;

        await this._customerService.updateCustomerInDb(dbCustomer);
    }

    async verifyIdentity(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const updatedRizeCustomer = await this._customerService.verifyIdentity(customer.uid);
        
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(updatedRizeCustomer);

        await this._customerService.updateCustomerInDb(dbCustomer);
    }
}

module.exports = CustomerController;
