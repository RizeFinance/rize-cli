/**
 * @param {any} rmqClient
 * @param {import('./transaction.service')} transactionService
 * @param {import('../transaction-event/transaction-event.service')} transactionEventService
 * @param {import('../synthetic-account/synthetic-account.service')} syntheticAccountService
 * @param {import('../synthetic-line-item/synthetic-line-item.service')} syntheticLineItemService
 * @param {import('../custodial-line-item/custodial-line-item.service')} custodialLineItemService
 * @param {any} logger
 */
const subscribeToTransactionEvents = async (
    rmqClient,
    transactionService,
    transactionEventService,
    syntheticAccountService,
    syntheticLineItemService,
    custodialLineItemService,
    logger,
) => {
    const dbUtils = require('../../utils/dbUtils');

    const createTransactionIfNotExisting = async (transactionUid) => {
        // Check if the transaction already exists
        let transaction = await transactionService.getTransactionByUid(transactionUid);

        if (!transaction) {
            // Get transaction data from Rize
            transaction = await transactionService.getRizeTransaction(transactionUid);
            delete transaction.transaction_event_uids;
            delete transaction.custodial_account_uids;

            try {
                // Add the transaction data to DB
                await transactionService.addTransactionToDb(transaction);
            } catch (err) {
                if (!dbUtils.isDuplicateDbKeyError(err, transactionUid)) {
                    throw err;
                }
            }
        }

        return transaction;
    };

    /**
     * @param {TransactionCreatedEventPayloadDetails} details
     */
    const transactionCreated = async (details) => {
        await createTransactionIfNotExisting(details.transaction_uid);
    };

    /**
     * @param {TransactionStatusChangedEventPayloadDetails} details
     */
    const transactionStatusChanged = async (details) => {
        // Check if the transaction already exists
        let existingTransaction = await transactionService.getTransactionByUid(details.transaction_uid);

        if (!existingTransaction) {
            existingTransaction = await createTransactionIfNotExisting(details.transaction_uid);
        } else {
            await transactionService.updateTransactionInDb({
                uid: details.transaction_uid,
                status: details.new_status,
                settled_index: details.settled_index
            });
        }

        const eachAsync = async (collection, iterator) => {
            const iter = [];
            for (let i = 0; i < collection.length; ++i) {
                iter.push((async () => {

                    await iterator(collection[i], i);
                })());
            }

            await Promise.all(iter);
        };

        const rizeTransactionEvents = await transactionEventService
            .getRizeTransactionEvents({ transaction_uid: [details.transaction_uid] });
        const rizeSyntheticLineItems = await syntheticLineItemService
            .getRizeSyntheticLineItems({ transaction_uid: [details.transaction_uid] });
        const rizeCustodialLineItems = await custodialLineItemService
            .getRizeCustodialLineItems({ transaction_uid: [details.transaction_uid] });

        await eachAsync(rizeTransactionEvents, async (rizeTransactionEvent) => {
            const exists = await transactionEventService.getTransactionEventByUid(rizeTransactionEvent.uid);
            if (!exists) {
                await transactionEventService.updateTransactionEventInDb(rizeTransactionEvent);
            } else {
                await transactionEventService.addTransactionEventToDb(rizeTransactionEvent);
            }
        });

        await eachAsync(rizeSyntheticLineItems, async (rizeSyntheticLineItem) => {
            const exists = await syntheticLineItemService.getSyntheticLineItemByUid(rizeSyntheticLineItem.uid);
            if (exists) {
                await syntheticLineItemService.updateSyntheticLineItemInDb(rizeSyntheticLineItem);
            } else {
                await syntheticLineItemService.addSyntheticLineItemToDb(rizeSyntheticLineItem);
            }
        });

        await eachAsync(rizeCustodialLineItems, async (rizeCustodialLineItem) => {
            const exists = await custodialLineItemService.getCustodialLineItemByUid(rizeCustodialLineItem.uid);
            if (exists) {
                await custodialLineItemService.updateCustodialLineItemInDb(rizeCustodialLineItem);
            } else {
                await custodialLineItemService.addCustodialLineItemToDb(rizeCustodialLineItem);
            }
        });

        const sourceSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(existingTransaction.source_synthetic_account_uid);
        delete sourceSyntheticAccount.account_number;
        delete sourceSyntheticAccount.customer_uid;
        await syntheticAccountService.updateSyntheticAccountInDb(sourceSyntheticAccount);

        const destinationSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(existingTransaction.destination_synthetic_account_uid);
        delete destinationSyntheticAccount.account_number;
        delete destinationSyntheticAccount.customer_uid;
        await syntheticAccountService.updateSyntheticAccountInDb(destinationSyntheticAccount);
    };

    const listener = (err, msg, ack, nack) => {
        if (!err) {
            try {
                msg.readString('UTF-8', (err, body) => {

                    /** @type {MessageBody} */
                    const message = JSON.parse(body);

                    if (!message) {
                        nack();
                        return;
                    }

                    if (message.data.event_type === 'created') {
                        transactionCreated(message.data.details)
                            .then(() => {
                                ack();
                            })
                            .catch(e => {
                                logger.error(e);
                                nack();
                            });
                    } else if (message.data.event_type === 'status_change') {
                        transactionStatusChanged(message.data.details)
                            .then(() => {
                                ack();
                            })
                            .catch(e => {
                                logger.error(e);
                                nack();
                            });
                    } else {
                        logger.error(`Unhandled event: ${body}`);
                        nack();
                    }
                });
            } catch (e) {
                logger.error(e);
                nack();
            }
        } else {
            logger.error(err);
            nack();
        }
    };

    return rmqClient.subscribeToRizeTopic(
        'transaction',
        'transactionSubscription',
        listener,
        'client-individual'
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
 * @typedef TransactionStatusChangedEventPayloadDetails
 * @property {string} customer_external_uid
 * @property {string} customer_uid
 * @property {string} new_status
 * @property {string} description
 * @property {number} settled_index
 * @property {string} transaction_uid
 */

/**
 * @typedef TransactionCreatedEventPayload
 * @property {string} event_type
 * @property {TransactionCreatedEventPayloadDetails} details
 */

/**
 * @typedef TransactionStatusChangedEventPayload
 * @property {string} event_type
 * @property {TransactionStatusChangedEventPayloadDetails} details
 */

/**
 * @typedef MessageBody
 * @property {TransactionCreatedEventPayload} data
 */

module.exports = subscribeToTransactionEvents;
