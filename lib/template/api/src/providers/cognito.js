/**
 *
 */

const Authenication = require('./authentication');

class Cognito extends Authenication {

    async registerUser() {}

    async authenticateUser() {}

    async forgotPassword() {}

    async verifyToken() {}
}

module.exports = Cognito;
