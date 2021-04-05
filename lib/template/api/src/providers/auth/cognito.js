const Authenication = require('./authentication');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

class Cognito extends Authenication {
    constructor(config) {
        super();
        // eslint-disable-next-line
        console.log('Cognito is being instanciated.', config);

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

        let attributeList = []

        var dataEmail = {
            Name: 'email',
            Value: username,
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeEmail);

        try {
            const tokenResponse = await new Promise ((resolve, reject) => {
                this._userPool.signUp(username, password, attributeList, null, (err, results) => {
                    if(err) {
                        reject(err);
                    }
                    resolve({
                        success: true,
                    });
                });
            });
        } catch(err) {
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

    async forgotPassword(email) {
        // eslint-disable-next-line
        console.log('Cognito forgotPassword called!', email);
    }

    async validateToken(token) {
        // eslint-disable-next-line
        console.log('Cognito validateToken called!', token);
    }
}

module.exports = Cognito;
