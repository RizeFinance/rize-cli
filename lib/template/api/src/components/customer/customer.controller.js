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

        return {
            success: true,
            data: customer
        };
    }
}

module.exports = CustomerController;
