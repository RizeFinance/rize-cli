/**
 * @param {any} rmqClient
 * @param {import('./transaction.service')} transactionService
 * @param {any} logger
 */
const subscribeToSyntheticAccountEvents = async (
    rmqClient,
    transactionService,
    logger,
) => {
    /**
     * @param {TransactionCreatedEventPayloadDetails} details 
     */
    const transactionCreated = async (details) => {
        // Check if the transaction already exists
        const existingTransaction = await transactionService.getTransactionByUid(details.transaction_uid);

        if (!existingTransaction) {
            const rizeTransaction = await transactionService.getRizeTransaction(details.transaction_uid);

            delete rizeTransaction.transaction_event_uids;
            delete rizeTransaction.custodial_account_uids;
            
            await transactionService.addTransactionToDb(rizeTransaction);
        }
    };
    
    const listener = (err, msg, consumptionSuccess, consumptionFailed) => {
        if (!err) {
            try {
                msg.readString('UTF-8', (err, body) => {

                    /** @type {MessageBody} */
                    const message = JSON.parse(body);
    
                    if (!message) {
                        consumptionFailed();
                        return;
                    }
    
                    if (message.data.event_type === 'created') {
                        transactionCreated(message.data.details)
                            .then(() => {
                                consumptionSuccess();
                            })
                            .catch(e => {
                                logger.error(e);
                                consumptionFailed();                
                            });
                    }
                });
            } catch (e) {
                logger.error(e);
                consumptionFailed();
            }
        } else {
            logger.error(err);
            consumptionFailed();
        }
    };

    return rmqClient.subscribe(
        'transaction',
        'transactionSubscription',
        listener
    );
};

/**
 * @typedef TransactionCreatedEventPayloadDetails
 * @property {string} customer_external_uid
 * @property {string} customer_uid
 * @property {string} description
 * @property {string} destination_synthetic_account_uid
 * @property {string} source_synthetic_account_uid
 * @property {string} transaction_uid
 * @property {string} type
 * @property {string} us_dollar_amount
 */

/**
 * @typedef TransactionCreatedEventPayload
 * @property {string} event_type
 * @property {TransactionCreatedEventPayloadDetails} details
 */

/**
 * @typedef MessageBody
 * @property {TransactionCreatedEventPayload} data
 */

module.exports = subscribeToSyntheticAccountEvents;