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

    async registerUser (username, password) {
        return await this._authProvider.registerUser(username, password);
    }

    async forgotPassword (email) {
        return await this._authProvider.forgotPassword(email);
    }
}

module.exports = AuthService;
