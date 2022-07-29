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
    const eachAsync = require('../../utils/eachAsync');

    const findOrCreateAccounts = async (transaction) => {
        const sourceSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(transaction.source_synthetic_account_uid);
        const dbSourceSyntheticAccount = syntheticAccountService.mapRizeSyntheticAccountToDbSyntheticAccount(sourceSyntheticAccount);
        if (dbSourceSyntheticAccount) {
            await syntheticAccountService.updateSyntheticAccountInDb(dbSourceSyntheticAccount);
        } else {
            await syntheticAccountService.addSyntheticAccountToDb(dbSourceSyntheticAccount);
        }

        const destinationSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(transaction.destination_synthetic_account_uid);
        const dbDestinationSyntheticAccount = syntheticAccountService.mapRizeSyntheticAccountToDbSyntheticAccount(destinationSyntheticAccount);

        if (dbDestinationSyntheticAccount) {
            await syntheticAccountService.updateSyntheticAccountInDb(dbDestinationSyntheticAccount);
        } else {
            await syntheticAccountService.addSyntheticAccountToDb(dbDestinationSyntheticAccount);
        }
    };

    const createTransactionIfNotExisting = async (transactionUid) => {
        // Check if the transaction already exists
        let dbTransaction = await transactionService.getTransactionByUid(transactionUid);

        if (!dbTransaction) {
            // Get transaction data from Rize
            const rizeTransaction = await transactionService.getRizeTransaction(transactionUid);
            dbTransaction = transactionService.mapRizeTransactionToDbTransaction(rizeTransaction);

            try {
                // Add the transaction data to DB
                await findOrCreateAccounts(rizeTransaction);
                await transactionService.addTransactionToDb(dbTransaction);
            } catch (err) {
                if (!dbUtils.isDuplicateDbKeyError(err, transactionUid)) {
                    throw err;
                }
            }
        }

        return dbTransaction;
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
        await createTransactionIfNotExisting(details.transaction_uid);

        // Update the transaction
        const rizeTransaction = await transactionService.getRizeTransaction(details.transaction_uid);
        const dbTransaction = transactionService.mapRizeTransactionToDbTransaction(rizeTransaction);
        await transactionService.updateTransactionInDb(dbTransaction);

        await findOrCreateAccounts(rizeTransaction);

        // Get entities related to the transaction (Transaction Events, Synthetic Line Items, and Custodial Line Items)
        const [rizeTransactionEvents, rizeSyntheticLineItems, rizeCustodialLineItems] = await Promise.all([
            transactionEventService.getRizeTransactionEvents({ transaction_uid: [details.transaction_uid] }),
            syntheticLineItemService.getRizeSyntheticLineItems({ transaction_uid: [details.transaction_uid] }),
            custodialLineItemService.getRizeCustodialLineItems({ transaction_uid: [details.transaction_uid] })
        ]);

        // Insert or update Transaction Events
        await eachAsync(rizeTransactionEvents.data, async (rizeTransactionEvent) => {
            const exists = await transactionEventService.getTransactionEventByUid(rizeTransactionEvent.uid);
            const dbTransactionEvent = transactionEventService.mapRizeTransactionEventToDbTransactionEvent(rizeTransactionEvent);

            if (exists) {
                await transactionEventService.updateTransactionEventInDb(dbTransactionEvent);
            } else {
                try {
                    await transactionEventService.addTransactionEventToDb(dbTransactionEvent);
                } catch (err) {
                    if (!dbUtils.isDuplicateDbKeyError(err, dbTransactionEvent.uid)) {
                        throw err;
                    }
                }
            }
        });

        // Insert or update Synthetic Line Items
        await eachAsync(rizeSyntheticLineItems.data, async (rizeSyntheticLineItem) => {
            const exists = await syntheticLineItemService.getSyntheticLineItemByUid(rizeSyntheticLineItem.uid);
            const dbSyntheticLineItem = syntheticLineItemService.mapRizeSyntheticLineItemToDbSyntheticLineItem(rizeSyntheticLineItem);

            if (exists) {
                await syntheticLineItemService.updateSyntheticLineItemInDb(dbSyntheticLineItem);
            } else {
                try {
                    await syntheticLineItemService.addSyntheticLineItemToDb(dbSyntheticLineItem);
                } catch (err) {
                    if (!dbUtils.isDuplicateDbKeyError(err, dbSyntheticLineItem.uid)) {
                        throw err;
                    }
                }
            }
        });

        // Insert or update Custodial Line Items
        await eachAsync(rizeCustodialLineItems.data, async (rizeCustodialLineItem) => {
            const exists = await custodialLineItemService.getCustodialLineItemByUid(rizeCustodialLineItem.uid);
            const dbCustodialLineItem = custodialLineItemService.mapRizeCustodialLineItemToDbCustodialLineItem(rizeCustodialLineItem);

            if (exists) {
                await custodialLineItemService.updateCustodialLineItemInDb(dbCustodialLineItem);
            } else {
                try {
                    await custodialLineItemService.addCustodialLineItemToDb(dbCustodialLineItem);
                } catch (err) {
                    if (!dbUtils.isDuplicateDbKeyError(err, dbCustodialLineItem.uid)) {
                        throw err;
                    }
                }
            }
        });
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

                    if (message.data.event_type === 'created') {
                        transactionCreated(message.data.details)
                            .then(() => {
                                ack();
                            })
                            .catch(e => {
                                logger.error(e);
                                nack();
                            });
                    } else if (['status_change', 'updated'].includes(message.data.event_type)) {
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
 * @typedef TransactionEventPayload
 * @property {string} event_type
 * @property {any} details
 */

/**
 * @typedef MessageBody
 * @property {TransactionEventPayload} data
 */

module.exports = subscribeToTransactionEvents;
