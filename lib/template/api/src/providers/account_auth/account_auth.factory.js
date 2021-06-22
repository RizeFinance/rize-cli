/**
 *
 */

const AccountAuth = require('./account_auth');
const Plaid = require('./plaid');

class AccountAuthFactory {
    /**
     * Creates an Account Auth helper
     * @param {'plaid'} provider
     * @param {AccountAuthConfig} config
     * @returns {AccountAuth}
     */
    static create (provider, config) {
        switch (provider) {
            case 'plaid':
                return new Plaid(config);
            default:
                console.warn(`Warning: Unknown Account Auth provider: ${provider}`); //eslint-disable-line
                return new AccountAuth();
        }
    }
}

module.exports = AccountAuthFactory;
