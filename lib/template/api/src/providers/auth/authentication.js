/**
 *
 */

class Authentication {
    /**
     * @param {string} username
     * @param {string} password
     */
    // eslint-disable-next-line
    async authenticateUser(username, password) { throw new Error('Authentication.authenticateUser is not implemented.'); }

    /**
     * @param {string} username
     * @param {string} password
     */
    // eslint-disable-next-line
    async registerUser(username, password) { throw new Error('Authentication.registerUser is not implemented.'); }

    /**
     * @param {string} email
     */
    // eslint-disable-next-line
    async forgotPassword(email) { throw new Error('Authentication.forgotPassword is not implemented.'); }

    /**
     * @param {string} email
     * @param {string} code
     * @param {string} password
    */
    // eslint-disable-next-line
    async confirmPassword(email, code, password) { throw new Error('Authentication.confirmPassword is not implemented.')}

    /**
     * @param {string} token
     */
    // eslint-disable-next-line
    async verifyToken(token) { throw new Error('Authentication.verifyToken is not implemented.'); }
}

module.exports = Authentication;
