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
        try {
            const response = await this._authService.registerUser(username, password);

            return {
                success: true,
                data: response
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

    async forgotPassword (email) {
        try {
            await this._authService.forgotPassword(email);

            return {
                success: true
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
