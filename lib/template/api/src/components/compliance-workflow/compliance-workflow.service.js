/**
 * This is the service for compliance workflow-related features
 */
class ComplianceWorkflowService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @protected */
        this._dbProvider = dbProvider;

        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    async viewLatest (id) {
        return await this._rizeProvider.complianceWorkflow.viewLatest(id);
    }

    async renewComplianceWorkflow (externalUid, id, email) {
        return await this._rizeProvider.complianceWorkflow.renew(externalUid, id, email);
    }
}

module.exports = ComplianceWorkflowService;
