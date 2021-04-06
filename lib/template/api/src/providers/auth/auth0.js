const AuthenticationClient = require('auth0').AuthenticationClient;
const Authenication = require('./authentication');
const jwks = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

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

    async registerUser(username, password) {
        try {
            const userData = await this._client.database.signUp({
                email: username,
                password: password,
                connection: 'Username-Password-Authentication'
            });

            return {
                id: `auth0|${userData._id}`
            };
        } catch (err) {
            throw {
                statusCode: err.statusCode,
                message: JSON.parse(err.message)
            };
        }
    }

    async forgotPassword(email) {
        // eslint-disable-next-line
        console.log('Auth0 forgotPassword called!', email);
    }

    async verifyToken(token) {
        const client = jwks({
            jwksUri: `https://${this._config.domain}/.well-known/jwks.json`
        });

        const getKey = (header, callback) => {
            client.getSigningKey(header.kid, function (err, key) {
                const signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
            });
        };

        const verify = promisify(jwt.verify);

        try {
            const decoded = await verify(token, getKey, {
                audience: this._config.audience,
                issuer: `https://${this._config.domain}/`,
                algorithms: ['RS256']
            });

            return decoded;
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                return undefined;
            } else {
                throw err;
            }
        }
    }
}

module.exports = Auth0;
