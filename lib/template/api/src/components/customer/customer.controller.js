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

        const customerDetailsToSave = {
            uid: latestCustomer.uid,
            ...latestCustomer.details,
            ...latestCustomer.details.address
        }
        delete customerDetailsToSave.address
        delete customerDetailsToSave.ssn_last_four

        return await this._customerService.updateCustomerInDb(customerDetailsToSave);
    }
}

module.exports = CustomerController;
