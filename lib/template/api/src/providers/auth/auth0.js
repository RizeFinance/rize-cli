const AuthenticationClient = require('auth0').AuthenticationClient;
const Authenication = require('./authentication');

class Auth0 extends Authenication {
    constructor(config) {
        super();

        /** @ignore @protected */
        this._config = config;

        /** @ignore @protected */
        this._client = new AuthenticationClient({
            domain: config.domain,
            clientId: config.clientId,
        });
    }

    async authenticateUser(username, password) {
        try {
            const tokenResponse = await this._client.passwordGrant({
                username: username,
                password: password,
                audience: this._config.audience,
                scope: 'offline_access'
            });

            return {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token
            };
        } catch (err) {
            throw {
                statusCode: err.statusCode,
                message: JSON.parse(err.message)
            };
        }
    }

    async registerUser (username, password) {
        // eslint-disable-next-line
        console.log('Auth0 registerUser called!', username, password);
    }

    async forgotPassword (email) {
        // eslint-disable-next-line
        console.log('Auth0 forgotPassword called!', email);
    }

    async validateToken (token) {
        // eslint-disable-next-line
        console.log('Auth0 validateToken called!', token);
    }
}

module.exports = Auth0;
