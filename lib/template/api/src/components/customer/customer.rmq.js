/**
 * @param {any} rmqClient
 * @param {import('./customer.service')} customerService
 * @param {any} logger
 */
const subscribeToCustomerEvents = async (
    rmqClient,
    customerService,
    logger
) => {
    const dbUtils = require('../../utils/dbUtils');
    
    /**
     * @param {CustomerStatusChangedEventPayloadDetails} details 
     */
    const customerStatusChanged = async (details) => {
        // Check if the customer is existing in the database
        const existingCustomer = await customerService.getCustomerByExternalUid(details.external_uid);
        // Get updated customer data from Rize
        const rizeCustomer = await customerService.getRizeCustomer(details.customer_uid);
        const dbCustomer = customerService.mapRizeCustomerToDbCustomer(rizeCustomer);
        
        if (!existingCustomer) {
            // Create a new customer
            try {
                await customerService.addCustomerToDb(dbCustomer);
            } catch (err) {
                if (!dbUtils.isDuplicateDbKeyError(err, details.customer_uid)) {
                    throw err;
                }
            }
        } else {
            // Update existing customer in the database
            await customerService.updateCustomerInDb(dbCustomer);
        }
    };

    const listener = (err, msg, ack, nack) => {
        if (!err) {
            msg.readString('UTF-8', (err, body) => {
                try {
                    /** @type {MessageBody} */
                    const message = JSON.parse(body);

                    if (!message) {
                        nack();
                        return;
                    }
                    /** @type {EventType[]} */
                    const EventTypes = ['lock', 'unlock', 'status_change', 'updated', 'kyc_status_change'];
                    const isEvent = EventTypes.includes(message.data.event_type);
                    if (isEvent) {
                        customerStatusChanged(message.data.details)
                            .then(() => {
                                ack();
                            })
                            .catch(e => {
                                logger.error(e);
                                nack();
                            });
                    } else {
                        logger.error(`Unidentified event: ${body}`);
                        nack();
                    }
                } catch (e) {
                    logger.error(e);
                    nack();
                }
            });
        } else {
            logger.error(err);
            nack();
        }
    };

    return rmqClient.subscribeToRizeTopic(
        'customer',
        'customerSubscription',
        listener,
        'client-individual'
    );
};

/**
 * @typedef CustomerStatusChangedEventPayloadDetails
 * @property {string} customer_uid
 * @property {string} external_uid
 * @property {string} new_status
 * @property {string} prior_status
 */

/**
 * @typedef {Object} CustomerEventPayload
 * @property {EventType} event_type
 * @property {any} details
 */

/**
 * @typedef {'lock' | 'unlock' | 'status_change'} EventType
 */

/**
 * @typedef {Object} MessageBody
 * @property {CustomerEventPayload} data
 */

module.exports = subscribeToCustomerEvents;
