/**
 * This is the service for customer-related features
 */
class AuthService {
    /**
     * @param {import('../../providers/auth')} authProvider
     */
    constructor (authProvider) {
        this._authProvider = authProvider;
    }
}

module.exports = AuthService;
