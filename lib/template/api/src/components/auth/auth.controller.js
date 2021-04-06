/**
 * This is the controller for auth-related features
 */
class AuthController {
    /**
     * @param {import('./auth.service')} authService
     * @param {import('../customer/customer.service')} customerService
     */
    constructor(authService, customerService) {
        /** @ignore @protected */
        this._authService = authService;
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
        const tokenResponse = await this._authService.authenticate(username, password);
        const workflow = await this._authService.createRizeWorkflow(response.id, username);
        const customer = await this._customerService.getRizeCustomer(workflow.customer.uid);
        await this._customerService.createCustomer({
            uid: response.id,
            rize_uid: workflow.uid,
            program_uid: customer.program_uid,
            pool_uids: JSON.stringify(customer.pool_uids),
            email: customer.email,
            status: customer.status,
            total_balance: customer.total_balance,
            created_at: customer.created_at
        });

        return {
            success: true,
            data: {
                id: response.id,
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken,
                workflow
            }
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
}

module.exports = AuthController;
