/**
 * This is the controller for auth-related features
 */
class AuthController {
    /**
     * @param {import('./auth.service')} authService
     */
    constructor (authService) {
        this._authService = authService;
    }

    async registerUser (username, password) {
        const response = await this._authService.registerUser(username, password);

        return {
            success: true,
            data: response
        };
    }
}

module.exports = AuthController;
