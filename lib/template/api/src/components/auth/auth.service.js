/**
 * This is the service for customer-related features
 */
class AuthService {
    /**
     * @param {import('../../providers/auth').Authentication} authProvider
     */
    constructor (authProvider) {
        /** @ignore @protected */
        this._authProvider = authProvider;
    }

    async authenticate(username, password) {
        return await this._authProvider.authenticateUser(username, password);
    }
}

module.exports = AuthService;
