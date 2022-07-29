/**
 * This is the controller for customer-related features
 */
class CustomerController {
    /**
     * @param {import('./customer.service')} customerService
     * @param {import('../product/product.service')} productService
     * @param {import('./compliance-workflow.service')} complianceWorkflowService
     */
    constructor(customerService, productService, complianceWorkflowService) {
        /** @protected */
        this._customerService = customerService;

        /** @protected */
        this._productService = productService;

        /** @protected */
        this._complianceWorkflowService = complianceWorkflowService;
    }

    async getCustomer(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const latestCustomer = await this._customerService.getRizeCustomer(customer.uid);
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(latestCustomer);
        
        return dbCustomer;
    }

    async createCustomerWithWorkflow(customerExternalUid, customerEmail, customerType, productUid) {
        // Create Customer
        const customer = await this._customerService.createRizeCustomer(customerExternalUid, customerEmail, customerType);
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(customer);
        await this._customerService.addCustomerToDb(dbCustomer);

        // Find Product
        const product = await this._productService.getProduct(productUid);

        // Create Workflow
        const newWorkflow = await this._complianceWorkflowService.createComplianceWorkflow(customer.uid, product.product_compliance_plan_uid);

        return { customer: dbCustomer, workflow: newWorkflow };
    }

    async updateCustomer(customerExternalUid, customerEmail, customerDetails) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const latestCustomer = await this._customerService.updateCustomerInRize(customer.uid, customerEmail, customerDetails);
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(latestCustomer);
        await this._customerService.updateCustomerInDb(dbCustomer);

        return dbCustomer;
    }

    async answerProfileQuestions(customerExternalUid, data) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const answers = await this._customerService.answerProfileQuestions(customer.uid, data.answers);

        return answers;
    }

    async getCustomerProducts(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const customerProducts = await this._customerService.getCustomerProducts(customer.uid);

        return customerProducts;
    }

    async createCustomerProduct(customerExternalUid, productUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const newCustomerProduct = await this._customerService.createCustomerProduct(customer.uid, productUid);

        return newCustomerProduct;
    }

    async verifyCustomer(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const verifiedResponse = await this._customerService.verifyCustomer(customer.uid);

        return verifiedResponse;
    }
}

module.exports = CustomerController;
