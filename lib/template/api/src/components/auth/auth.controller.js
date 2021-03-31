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
}

module.exports = AuthController;
