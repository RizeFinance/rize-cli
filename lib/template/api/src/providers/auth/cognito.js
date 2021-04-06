const Authenication = require('./authentication');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

class Cognito extends Authenication {
    constructor(config) {
        super();
        
        const poolData = {
            UserPoolId: config.poolId,
            ClientId: config.clientId
        };
        
        /** @ignore @protected */
        this._userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    }

    async authenticateUser(username, password) {
        const userData = {
            Username : username,
            Pool : this._userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        try {
            const tokenResponse = await new Promise ((resolve, reject) => {
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

            const errorList = ['UserNotFoundException', 'LimitExceededException', 'InvalidParameterException'];

            if (errorList.includes(err.name)) {
                throw {
                    statusCode: 400,
                    message: err.message
                };
            } else {
                throw err;
            }
        }
    }

    async validateToken(token) {
        // eslint-disable-next-line
        console.log('Cognito validateToken called!', token);
    }
}

module.exports = Cognito;
