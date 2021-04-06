/**
 * This is the service for customer-related features
 */
class AuthService {
    /**
     * @param {import('../../providers/auth').Authentication} authProvider
     */
    constructor(authProvider, dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._authProvider = authProvider;
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async registerUser(username, password) {
        return await this._authProvider.registerUser(username, password);
    }

    async authenticate(username, password) {
        return await this._authProvider.authenticateUser(username, password);
    }

    async createRizeWorkflow(id, email) {
        return await this._rizeProvider.complianceWorkflow.create(id, email);
    }

    async getRizeCustomer(rize_uid) {
        return await this._rizeProvider.customer.get(rize_uid);
    }

    async getUserByEmail(email) {
        return await this._dbProvider('customers').where('email', email);
    }

    async createUser(uid, rize_uid, program_uid, pool_uids, email, status, total_balance, created_at) {
        return await this._dbProvider('customers').insert({
            uid,
            rize_uid,
            program_uid,
            pool_uids,
            email,
            status,
            total_balance,
            created_at
        });
    }
}

module.exports = AuthService;
