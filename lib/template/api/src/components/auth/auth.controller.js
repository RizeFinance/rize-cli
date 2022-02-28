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

        const response = await this._authService.registerUser(username, password);

        let tokenResponse;
        try {
            tokenResponse = await this._authService.authenticate(username, password);
        } catch (err) {
            if (err.name !== 'UserNotConfirmedException') {
                throw err;
            }
        }

        let workflow;
        let product;
        let rizeCustomer;
        let dbCustomer;

        try {
            rizeCustomer = await this._customerService.createRizeCustomer(response.id, username);   
            product = await this._authService.getRizeProduct(this.DefaultProductUid);
            workflow = await this._authService.createRizeWorkflow(rizeCustomer.uid, product.product_compliance_plan_uid);
            dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(rizeCustomer);

            await this._customerService.addCustomerToDb(dbCustomer);
        } catch (err) {
            return {
                success: false,
                status: err.status,
                data: err.data
            };
        }

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

    async confirmPassword(email, code, password) {
        try {
            await this._authService.confirmPassword(email, code, password);

            return { success: true };
        } catch(err) {
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

            let workflow;
            let product;
            let rizeCustomer;
            let dbCustomer;

            // First time login users need to be init in middleware
            try {
                rizeCustomer = await this._customerService.createRizeCustomer(authResponse.userId, username);   
                product = await this._authService.getRizeProduct(this.DefaultProductUid);
                workflow = await this._authService.createRizeWorkflow(rizeCustomer.uid, product.product_compliance_plan_uid);
                dbCustomer = this._customerService.mapRizeCustomerToDbCustomer(rizeCustomer);

                await this._customerService.addCustomerToDb(dbCustomer);
            } catch (err) {
                return {
                    success: false,
                    status: err.status,
                    data: err.data
                };
            }

            const data = {
                workflow
            };

            if (authResponse && authResponse.accessToken) {
                data.accessToken = authResponse.accessToken;
                data.refreshToken = authResponse.refreshToken;
            }

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
