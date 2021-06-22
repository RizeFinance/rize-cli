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
     * @param {string} username
     * @param {string} old_password
     * @param {string} new_password
     */
    // eslint-disable-next-line
    async setPassword(username, old_password, new_password) { throw new Error('Authentication.setPassword is not implemented.'); }

    /**
     * @param {string} token
     */
    // eslint-disable-next-line
    async verifyToken(token) { throw new Error('Authentication.verifyToken is not implemented.'); }
}

module.exports = Authentication;
