/**
 * This is the service for auth-related features
 */
class AuthService {
    /**
     * @param {import('../../providers/auth').Authentication} authProvider
     * @param {import('@rizefinance/rize-js')} rizeProvider
     */
    constructor(authProvider, rizeProvider) {
        /** @ignore @protected */
        this._authProvider = authProvider;
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
}

module.exports = AuthService;
