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

    async renewComplianceWorkflow (externalUid, id, email) {
        return await this._rizeProvider.complianceWorkflow.renew(externalUid, id, email);
    }
}

module.exports = ComplianceWorkflowService;
