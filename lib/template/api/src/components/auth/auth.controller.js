/**
 * This is the controller for auth-related features
 */
class AuthController {
    /**
     * @param {import('./auth.service')} authService
     * @param {import('../customer/customer.service')} customerService
     * @param {process.env.RIZE_DEFAULT_PRODUCT_UID} defaultProductUid
     */
    constructor(authService, customerService, defaultProductUid) {
        /** @protected */
        this._authService = authService;

        /** @protected */
        this._customerService = customerService;

        /** @protected */
        this.DefaultProductUid = defaultProductUid;
    }

    async registerUser (username, password) {
        const matchedUsers = await this._customerService.getCustomerByEmail(username);
        if (matchedUsers.length) {
            return {
                success: false,
                status: 400,
                message: 'User already exists.'
            };
        }

        try {
            await this._authService.registerUser(username, password);
        } catch (err) {
            return {
                success: false,
                status: 400,
                message: err.message
            };
        }

        return {
            success: true
        };
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

    async confirmPassword(email, code, password) {
        try {
            await this._authService.confirmPassword(email, code, password);

            return { success: true };
        } catch(err) {
            let status = 400;
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

    async setPassword (username, old_password, new_password) {
        try {
            const authResponse = await this._authService.setPassword(username, old_password, new_password);

            return {
                success: true,
                data: authResponse
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
