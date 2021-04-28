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
            'uid',
            'external_uid',
            'program_uid',
            'email',
            'status',
            'kyc_status',
            'total_balance',
            'created_at',
            'locked_at',
            'lock_reason'
        ];
        const customerDetailsKeys = [
            'first_name',
            'middle_name',
            'last_name',
            'suffix',
            'phone',
            'ssn_last_four',
            'dob',
        ];
        const customerAddressKeys = [
            'street1',
            'street2',
            'city',
            'state',
            'postal_code',
        ];

        const dbCustomer = !rizeCustomer ? undefined : {};

        for (let key in rizeCustomer) {
            if (customerKeys.includes(key)){
                dbCustomer[key] = rizeCustomer[key];
            }

            if (key === 'details') {
                for (let detailsKey in rizeCustomer.details) {
                    if (customerDetailsKeys.includes(detailsKey)) {
                        dbCustomer[detailsKey] = rizeCustomer.details[detailsKey];
                    }

                    if (detailsKey === 'address') {
                        for (let addressKey in rizeCustomer.details.address) {
                            if (customerAddressKeys.includes(addressKey)) {
                                dbCustomer[addressKey] = rizeCustomer.details.address[addressKey];
                            }
                        }
                    }
                }
            }
        }

        return dbCustomer;
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

    async createCustomer(customer) {
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

    async verifyIdentity(customerUid) {
        return await this._rizeProvider.customer.verifyIdentity(customerUid);
    }
}

module.exports = CustomerService;
