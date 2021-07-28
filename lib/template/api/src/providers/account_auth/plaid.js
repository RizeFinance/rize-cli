const plaid = require('plaid');
const AccountAuth = require('./account_auth');

class Plaid extends AccountAuth {
    constructor(config) {
        super();

        /** @ignore @protected */
        this._config = config;

        const mapEnv = {
            staging: plaid.environments.sandbox,
            release: plaid.environments.production
        };

        /** @ignore @protected */
        this._client = new plaid.Client({
            clientID: config.clientId,
            secret: config.secret,
            env: mapEnv[config.env],
        });
    }

    async getLinkToken() {
        try {
            const reponse = await this._client.createLinkToken({
                user: { client_user_id: 'rize-prototype-app' },
                client_name: 'rize-prototype',
                products: ['auth', 'transactions'],
                country_codes: ['US'],
                language: 'en',
                account_filters: {
                    depository: {
                        account_subtypes: ['checking'],
                    },
                },
            });

            return reponse;
        } catch (err) {
            throw {
                statusCode: err.statusCode,
                message: JSON.parse(err.message)
            };
        }
    }

    async getProcessorToken(publicToken, accountId) {
        try {
            const exchangePublicTokenResponse = await this._client.exchangePublicToken(
                publicToken,
            );
        
            const accessToken = exchangePublicTokenResponse.access_token;

            // Create a processor token for a specific account id.
            const processorTokenResponse = await this._client.createProcessorToken(
                accessToken,
                accountId,
                'rize',
            );

            return processorTokenResponse.processor_token;

        } catch (err) {
            throw {
                statusCode: err.statusCode,
                message: err.message
            };
        }
    }
}

module.exports = Plaid;
