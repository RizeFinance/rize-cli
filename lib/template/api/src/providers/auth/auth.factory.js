/**
 *
 */

const Authentication = require('./authentication');
const Auth0 = require('./auth0');
const Cognito = require('./cognito');

class AuthFactory {
    /**
     * Creates an Authentication helper
     * @param {'auth0' | 'cognito'} provider
     * @param {AuthenticationConfig} config
     * @returns {Authentication}
     */
    static create (provider, config) {
        switch (provider) {
            case 'auth0':
                return new Auth0(config);
            case 'cognito':
                return new Cognito(config);
            default:
                console.warn(`Warning: Unknown Authentication provider: ${provider}`); //eslint-disable-line
                return new Authentication();
        }
    }
}

module.exports = AuthFactory;
