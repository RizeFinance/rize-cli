/**
 *
 */

class Authentication {
    /**
     * Gets the access token from the auth provider
     * @param {string} username
     * @param {string} password
     */
    // eslint-disable-next-line
    async authenticateUser(username, password) { throw new Error('Authentication.authenticateUser is not implemented.'); }

    /** Add docs here */
    // eslint-disable-next-line
    async registerUser(username, password) { throw new Error('Authentication.registerUser is not implemented.'); }

    /** Add docs here */
    // eslint-disable-next-line
    async forgotPassword(email) { throw new Error('Authentication.forgotPassword is not implemented.'); }

    /** Add docs here */
    // eslint-disable-next-line
    async validateToken(token) { throw new Error('Authentication.validateToken is not implemented.'); }
}

module.exports = Authentication;
