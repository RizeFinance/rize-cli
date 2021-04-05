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
        try {
            const tokenResponse = await this._authService.authenticate(username, password);   

            return {
                success: true,
                data: tokenResponse
            };
        } catch (err) {
            let status = 500;

            if ('statusCode' in err) {
                status = err.statusCode;
                delete err.statusCode;
            }

            return {
                success: false,
                status: status,
                data: err
            };
        }
    }
}

module.exports = AuthController;
