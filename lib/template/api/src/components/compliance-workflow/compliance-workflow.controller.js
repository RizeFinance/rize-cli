/**
 * This is the controller for compliance workflow-related features
 */
class ComplianceWorkflowController {
    /**
     * @param {import('./compliance-workflow.service')} complianceWorkflowService
     * @param {import('../customer/customer.service')} customerService
     * @param {import('../product/product.service')} productService
     */
    constructor(complianceWorkflowService, customerService, productService) {
        /** @protected */
        this._complianceWorkflowService = complianceWorkflowService;
        /** @protected */
        this._customerService = customerService;
        /** @protected */
        this._productService = productService;
    }

    async getComplianceWorkflows(customerExternalUid, query) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const complianceWorkflows = await this._complianceWorkflowService.getComplianceWorkflows(customer.uid, query);
        return complianceWorkflows;
    }

    async getComplainceWorkflows(customerExternalUid, query) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const complianceWorkflows = await this._complianceWorkflowService.getComplianceWorkflows(customer.uid, query);
        return complianceWorkflows;
    }

    async renewComplianceWorkflow(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const complianceWorkflow = await this._complianceWorkflowService.renewComplianceWorkflow(customerExternalUid, customer.uid, customer.email);
        return complianceWorkflow;
    }

    async viewLatestComplianceWorkflow(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const complianceWorkflow = await this._complianceWorkflowService.viewLatestComplianceWorkflow(customer.uid);
        return complianceWorkflow;
    }

    async createComplianceWorkflow(customerExternalUid, productUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const product = await this._productService.getProduct(productUid);
        const complianceWorkflow = await this._complianceWorkflowService.createComplianceWorkflow(customer.uid, product.product_compliance_plan_uid);
        return complianceWorkflow;
    }

    async acknowledgeComplianceDocuments(customerExternalUid, data) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        let complianceWorkflow = await this._complianceWorkflowService.viewLatestComplianceWorkflow(customer.uid);
        complianceWorkflow = await this._complianceWorkflowService.acknowledgeComplianceDocuments(
            complianceWorkflow.uid,
            customer.uid,
            data.documents
        );
        return complianceWorkflow;
    }
}

module.exports = ComplianceWorkflowController;
