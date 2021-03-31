/**
 *
 */

const Authenication = require('./authentication');

class Cognito extends Authenication {
    constructor (config) {
        super();
        // eslint-disable-next-line
        console.log('Cognito is being instanciated.', config);
    }

    async authenticateUser (username, password) {
        // eslint-disable-next-line
        console.log('Cognito authenticateUser called!', username, password);
    }

    async registerUser (username, password) {
        // eslint-disable-next-line
        console.log('Cognito registerUser called!', username, password);
    }

    async forgotPassword (email) {
        // eslint-disable-next-line
        console.log('Cognito forgotPassword called!', email);
    }

    async validateToken (token) {
        // eslint-disable-next-line
        console.log('Cognito validateToken called!', token);
    }
}

module.exports = Cognito;
