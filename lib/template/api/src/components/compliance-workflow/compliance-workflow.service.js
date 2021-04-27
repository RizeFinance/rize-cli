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

    async addCustodialAccountsToDb (custodialAccounts) {
        return await this._dbProvider('custodial_accounts')
            .insert(custodialAccounts);
    }
}

module.exports = ComplianceWorkflowService;
