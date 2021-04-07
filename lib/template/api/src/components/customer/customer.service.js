/**
 * This is the service for customer-related features
 */
class CustomerService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getRizeCustomer(rize_uid) {
        return await this._rizeProvider.customer.get(rize_uid);
    }

    async getCustomerByEmail(email) {
        return await this._dbProvider('customers').where('email', email);
    }

    async getCustomerByUid(uid) {
        return await this._dbProvider('customers')
            .where({ uid })
            .first();
    }

    async createCustomer(customer) {
        return await this._dbProvider('customers').insert(customer);
    }
}

module.exports = CustomerService;
