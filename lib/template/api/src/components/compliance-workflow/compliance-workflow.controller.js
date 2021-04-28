/**
 * This is the controller for compliance workflow-related features
 */
class ComplianceWorkflowController {
    /**
     * @param {import('./compliance-workflow.service')} complianceWorkflowService
     * @param {import('../customer/customer.service')} customerService
     */
    constructor(complianceWorkflowService, customerService) {
        /** @protected */
        this._complianceWorkflowService = complianceWorkflowService;
        /** @protected */
        this._customerService = customerService;
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

    async batchAcknowledgeDocuments(customerExternalUid, data) {
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
