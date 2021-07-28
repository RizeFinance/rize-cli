const mapObject = require('../../utils/mapObject');

/**
 * This is the service for customer-related features
 */
class CustomerService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @protected */
        this._dbProvider = dbProvider;

        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    mapRizeCustomerToDbCustomer(rizeCustomer) {
        const customerKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'external_uid', from: 'external_uid' },
            { to: 'program_uid', from: 'program_uid' },
            { to: 'email', from: 'email' },
            { to: 'status', from: 'status' },
            { to: 'kyc_status', from: 'kyc_status' },
            { to: 'total_balance', from: 'total_balance' },
            { to: 'created_at', from: 'created_at' },
            { to: 'locked_at', from: 'locked_at' },
            { to: 'lock_reason', from: 'lock_reason' },
            { to: 'first_name', from: 'details.first_name' },
            { to: 'middle_name', from: 'details.middle_name' },
            { to: 'last_name', from: 'details.last_name' },
            { to: 'suffix', from: 'details.suffix' },
            { to: 'phone', from: 'details.phone' },
            { to: 'dob', from: 'details.dob' },
            { to: 'street1', from: 'details.address.street1' },
            { to: 'street2', from: 'details.address.street2' },
            { to: 'city', from: 'details.address.city' },
            { to: 'state', from: 'details.address.state' },
            { to: 'postal_code', from: 'details.address.postal_code' },
        ];

        return mapObject(rizeCustomer, customerKeys);
    }

    async createRizeCustomer(external_uid, email) {
        return await this._rizeProvider.customer.create(external_uid, email);
    }

    async getRizeCustomer(external_uid) {
        return await this._rizeProvider.customer.get(external_uid);
    }

    async getCustomerByEmail(email) {
        return await this._dbProvider('customers').where('email', email);
    }

    async getCustomerByExternalUid(externalUid) {
        const customer = await this._dbProvider('customers')
            .where({ external_uid: externalUid })
            .first();

        if (customer) {
            customer.details = {
                'first_name': customer.first_name,
                'middle_name': customer.middle_name,
                'last_name': customer.last_name,
                'suffix': customer.suffix,
                'phone': customer.phone,
                'dob': customer.dob,
                address: {
                    'street1': customer.street1,
                    'street2': customer.street2,
                    'city': customer.city,
                    'state': customer.state,
                    'postal_code': customer.postal_code
                }
            };

            delete customer.first_name;
            delete customer.middle_name;
            delete customer.last_name;
            delete customer.suffix;
            delete customer.phone;
            delete customer.dob;
            delete customer.street1;
            delete customer.street2;
            delete customer.city;
            delete customer.state;
            delete customer.postal_code;
        }

        return customer;
    }

    async addCustomerToDb(customer) {
        return await this._dbProvider('customers').insert(customer);
    }

    async updateCustomerInDb(customer) {
        return await this._dbProvider('customers')
            .where({ uid: customer.uid })
            .update(customer);
    }

    async updateCustomerInRize(customerUid, customerEmail, customerDetails) {
        return await this._rizeProvider.customer.update(customerUid, customerEmail, customerDetails);
    }

    async createCustomerProduct(customerUid, productUid) {
        return await this._rizeProvider.customerProduct.create(customerUid, productUid);
    }

    async answerProfileQuestions(customerUid, answers) {
        return await this._rizeProvider.customerProduct.updateProfileAnswers(customerUid, answers);
    }
}

module.exports = CustomerService;
