/**
 * This is the controller for customer-related features
 */
class CustomerController {
    /**
     * @param {import('./customer.service')} customerService
     */
    constructor(customerService) {
        /** @ignore @protected */
        this._customerService = customerService;
    }

    async getCustomer(customerUid) {
        const customer = await this._customerService.getCustomerByUid(customerUid);

        return {
            success: true,
            data: customer
        };
    }
}

module.exports = CustomerController;
