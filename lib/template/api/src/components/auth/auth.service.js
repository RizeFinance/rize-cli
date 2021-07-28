/**
 * This is the service for auth-related features
 */
class AuthService {
    /**
     * @param {import('../../providers/auth').Authentication} authProvider
     * @param {import('@rizefinance/rize-js')} rizeProvider
     */
    constructor(authProvider, rizeProvider) {
        /** @protected */
        this._authProvider = authProvider;

        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    async registerUser(username, password) {
        return await this._authProvider.registerUser(username, password);
    }

    async forgotPassword (email) {
        return await this._authProvider.forgotPassword(email);
    }

    async setPassword (username, old_password, new_password) {
        return await this._authProvider.setPassword(username, old_password, new_password);
    }

    async authenticate(username, password) {
        return await this._authProvider.authenticateUser(username, password);
    }

    async getRizeProduct(id) {
        return await this._rizeProvider.product.get(id);
    }

    async createRizeWorkflow(id, email) {
        return await this._rizeProvider.complianceWorkflow.create(id, email);
    }
}

module.exports = AuthService;
