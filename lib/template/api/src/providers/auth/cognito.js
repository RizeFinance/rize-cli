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
        const attributeList = [];

        const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: 'email',
            Value: username
        });

        attributeList.push(attributeEmail);

        try {
            const response = await new Promise ((resolve, reject) => {
                this._userPool.signUp(username, password, attributeList, null, (err, results) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve({
                            id: results.userSub
                        });
                    }
                });
            });

            return response;
        } catch(err) {
            if (err.name === 'UsernameExistsException' || err.name === 'InvalidParameterException') {
                throw {
                    statusCode: 400,
                    message: err.message
                };
            } else {
                throw err;
            }
        }
    }

    async forgotPassword(email) {
        const userData = {
            Username: email,
            Pool: this._userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        try {
            const response = await new Promise ((resolve, reject) => {
                cognitoUser.forgotPassword({
                    onSuccess: () => {
                        resolve({
                            success: true
                        });
                    },
                    onFailure: (err) => {
                        reject(err);
                    }
                });
            });

            return response;
        } catch(err) {
            const errorList = ['UserNotFoundException', 'InvalidParameterException'];

            if(err.name === 'LimitExceededException') {
                throw {
                    statusCode: 429,
                    message: err.message
                };
            } else if(errorList.includes(err.name)) {
                throw {
                    statusCode: 400,
                    message: err.message
                };
            } else {
                throw err;
            }
        }
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
