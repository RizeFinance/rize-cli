/**
 * This is the service for compliance workflow-related features
 */
class ComplianceWorkflowService {
    /**
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(rizeProvider) {
        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    async getComplianceWorkflows (customerUid, query) {
        return await this._rizeProvider.complianceWorkflow.getList({ customer_uid: [customerUid], ...query });
    }

    async renewComplianceWorkflow (externalUid, id, email) {
        return await this._rizeProvider.complianceWorkflow.renew(externalUid, id, email);
    }

    async viewLatestComplianceWorkflow (customerUid) {
        return await this._rizeProvider.complianceWorkflow.viewLatest(customerUid);
    }

    async createComplianceWorkflow (customerUid, productCompliancePlanUid) {
        return await this._rizeProvider.complianceWorkflow.create(customerUid, productCompliancePlanUid);
    }

    async acknowledgeComplianceDocuments (complianceWorkflowUid, customerUid, documents) {
        return await this._rizeProvider.complianceWorkflow.acknowledgeComplianceDocuments(complianceWorkflowUid, customerUid, documents);
    }
}

module.exports = ComplianceWorkflowService;
