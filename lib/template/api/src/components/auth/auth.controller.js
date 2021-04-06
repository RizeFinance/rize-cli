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

    async registerUser (username, password) {
        const matchedUser = await this._authService.getUserByEmail(username);
        if (matchedUser) {
            return {
                success: false,
                status: 400,
                data: new Error('Unable to register user')
            };
        }

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
