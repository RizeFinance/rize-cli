/**
 * This is the controller for compliance workflow-related features
 */
class ComplianceWorkflowController {
    /**
     * @param {import('./compliance-workflow.service')} complianceWorkflowService
     */
    constructor(complianceWorkflowService) {
        /** @protected */
        this._complianceWorkflowService = complianceWorkflowService;
    }

    async getCustomer(complianceWorkflowExternalUid) {
        const complianceWorkflow = await this._complianceWorkflowService.getCustomerByExternalUid(complianceWorkflowExternalUid);
        return complianceWorkflow;
    }
}

module.exports = ComplianceWorkflowController;
