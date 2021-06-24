/**
 * This is the controller for auth-related features
 */
class AuthController {
    /**
     * @param {import('./auth.service')} authService
     * @param {import('../customer/customer.service')} customerService
     */
    constructor(authService, customerService) {
        /** @protected */
        this._authService = authService;

        /** @protected */
        this._customerService = customerService;
    }

    async registerUser (username, password) {
        const matchedUsers = await this._customerService.getCustomerByEmail(username);
        if (matchedUsers.length) {
            return {
                success: false,
                status: 400,
                data: { message: 'Unable to register user' }
            };
        }

        const response = await this._authService.registerUser(username, password);

        let tokenResponse;
        try {
            tokenResponse = await this._authService.authenticate(username, password);
        } catch (err) {
            if (err.name !== 'UserNotConfirmedException') {
                throw err;
            }
        }

        const workflow = await this._authService.createRizeWorkflow(response.id, username);
        const rizeCustomer = await this._customerService.getRizeCustomer(workflow.customer.uid);
        const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(rizeCustomer);

        await this._customerService.addCustomerToDb(dbCustomer);

        const data = {
            workflow
        };

        if (tokenResponse && tokenResponse.accessToken) {
            data.accessToken = tokenResponse.accessToken;
            data.refreshToken = tokenResponse.refreshToken;
        }

        return {
            success: true,
            data
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
            } else {
                throw err;
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
            } else {
                throw err;
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

            const matchedUsers = await this._customerService.getCustomerByEmail(username);

            if (matchedUsers.length && authResponse.accessToken) {
                return {
                    success: true,
                    data: authResponse
                };
            }

            // First time login users need to be init in middleware
            const workflow = await this._authService.createRizeWorkflow(authResponse.userId, username);
            const rizeCustomer = await this._customerService.getRizeCustomer(workflow.customer.uid);
            const dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(rizeCustomer);

            await this._customerService.addCustomerToDb(dbCustomer);

            return {
                success: true,
                data: authResponse
            };
            
        } catch (err) {
            let status = 500;

            if ('statusCode' in err) {
                status = err.statusCode;
                delete err.statusCode;
            } else {
                throw err;
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
