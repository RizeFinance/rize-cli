/**
 * This is the service for customer-related features
 */
class CustomerService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor (dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getRizeCustomer (rize_uid) {
        return await this._rizeProvider.customer.get(rize_uid);
    }

    async getCustomerByEmail (email) {
        return await this._dbProvider('customers').where('email', email);
    }

    async createCustomer (uid, rize_uid, program_uid, pool_uids, email, status, total_balance, created_at) {
        return await this._dbProvider('customers').insert({
            uid,
            rize_uid,
            program_uid,
            pool_uids,
            email,
            status,
            total_balance,
            created_at
        });
    }
}

module.exports = CustomerService;
