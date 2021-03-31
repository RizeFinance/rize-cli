/**
 *
 */

const Authenication = require('./authentication');

class Auth0 extends Authenication {

    async registerUser() {}

    async authenticateUser() {}

    async forgotPassword() {}

    async verifyToken() {}
}

module.exports = Auth0;
