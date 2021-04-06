const Authenication = require('./authentication');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
global.fetch = require('node-fetch');

class Cognito extends Authenication {
    constructor(config) {
        super();

        const poolData = {
            UserPoolId: config.poolId,
            ClientId: config.clientId
        };

        /** @ignore @protected */
        this._userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        
        /** @ignore @protected */
        this._config = config;
    }

    async authenticateUser(username, password) {
        const userData = {
            Username: username,
            Pool: this._userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        try {
            const tokenResponse = await new Promise((resolve, reject) => {
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function (result) {
                        resolve({
                            accessToken: result.getAccessToken().getJwtToken(),
                            refreshToken: result.getRefreshToken().getToken()
                        });
                    },
                    onFailure: function (err) {
                        reject(err);
                    }
                });
            });

            return tokenResponse;
        } catch (err) {
            if (err.name === 'NotAuthorizedException') {
                throw {
                    statusCode: 403,
                    message: err.message
                };
            } else {
                throw err;
            }
        }
    }

    async registerUser(username, password) {
        // eslint-disable-next-line
        console.log('Cognito registerUser called!', username, password);
    }

    async forgotPassword(email) {
        // eslint-disable-next-line
        console.log('Cognito forgotPassword called!', email);
    }

    async verifyToken(token) {
        const promiseRequest = promisify(request);

        try {
            const response = await promiseRequest({
                url: `https://cognito-idp.${this._config.poolRegion}.amazonaws.com/${this._config.poolId}/.well-known/jwks.json`,
                json: true
            });

            if (response.statusCode === 200) {
                const pems = {};
                const keys = response.body['keys'];
                for (let i = 0; i < keys.length; i++) {
                    //Convert each key to PEM
                    const key_id = keys[i].kid;
                    const modulus = keys[i].n;
                    const exponent = keys[i].e;
                    const key_type = keys[i].kty;
                    const jwk = { kty: key_type, n: modulus, e: exponent };
                    const pem = jwkToPem(jwk);
                    pems[key_id] = pem;
                }
                //validate the token
                const decodedJwt = jwt.decode(token, { complete: true });
                if (!decodedJwt) {
                    return undefined;
                }

                const kid = decodedJwt.header.kid;
                const pem = pems[kid];
                if (!pem) {
                    return undefined;
                }

                const verify = promisify(jwt.verify);

                try {
                    const payload = await verify(token, pem);
                    return payload;
                } catch (err) {
                    return undefined;
                }
            } else {
                throw new Error('Error! Unable to download JWKs');
            }
        } catch (err) {
            throw new Error('Error! Unable to download JWKs', err);
        }
    }
}

module.exports = Cognito;
