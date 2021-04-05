/**
 * This is the controller for auth-related features
 */
class AuthController {
    /**
     * @param {import('./auth.service')} authService
     */
    constructor(authService) {
        /** @ignore @protected */
        this._authService = authService;
    }

    async authenticate(username, password) {
        const tokenResponse = await this._authService.authenticate(username, password);

        return {
            success: true,
            data: tokenResponse
        };
    }
}

module.exports = AuthController;
