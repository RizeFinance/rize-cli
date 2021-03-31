/**
 *
 */

const Authenication = require('./authentication');

class Auth0 extends Authenication {
    constructor (config) {
        super();
        // eslint-disable-next-line
        console.log('Auth0 is being instanciated.', config);
    }

    async authenticateUser (username, password) {
        // eslint-disable-next-line
        console.log('Auth0 authenticateUser called!', username, password);
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
