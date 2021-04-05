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

    async authenticateUser (username, password) {
        // eslint-disable-next-line
        console.log('Auth0 authenticateUser called!', username, password);
    }

    async registerUser (username, password) {
        try {
            const userData = await this._client.database.signUp({
                email: username,
                password: password,
                connection: 'Username-Password-Authentication'
            });

            return {
                id: userData._id,
                email: userData.email
            };
        } catch (err) {
            throw {
                statusCode: err.statusCode,
                message: JSON.parse(err.message)
            };
        }
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
