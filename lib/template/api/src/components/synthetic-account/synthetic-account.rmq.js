/**
 * @param {any} rmqClient
 * @param {import('@rizefinance/rize-js')} rizeProvider
 * @param {import('./synthetic-account.service')} syntheticAccountService
 * @param {import('../custodial-account/custodial-account.service')} custodialAccountService
 * @param {import('../pool/pool.service')} poolService
 * @param {any} logger
 */
const subscribeToSyntheticAccountEvents = async (
    rmqClient,
    syntheticAccountService,
    custodialAccountService,
    poolService,
    logger
) => {
    const dbUtils = require('../../utils/dbUtils');
    const eachAsync = require('../../utils/eachAsync');

    const createPoolIfNotExisting = async (poolUid) => {
        // Check if the pool data already exists in the DB
        let dbPool = await poolService.getPoolByUid(poolUid);

        if (!dbPool) {
            // Get pool data from Rize
            const rizePool = await poolService.getRizePool(poolUid);
            dbPool = poolService.mapRizePoolToDbPool(rizePool);

            try {
                // Add the pool data to DB
                await poolService.addPoolToDb(dbPool);
            } catch (err) {
                if (!dbUtils.isDuplicateDbKeyError(err, poolUid)) {
                    throw err;
                }
            }
        }

        return dbPool;
    };

    const createPoolCustodialAccountsIfNotExisting = async (pool) => {
        const rizeCustodialAccounts = await custodialAccountService.getRizeCustodialAccounts(
            undefined,
            undefined,
            [pool.owner_customer_uid]
        );

        if (rizeCustodialAccounts.data.length) {
            // Filter by pool UID
            const samePoolCustodialAccounts = rizeCustodialAccounts.data.filter(ca => ca.pool_uid === pool.uid);

            // Get custodial accounts existing in the DB
            const existingCustodialAccounts = await custodialAccountService.getCustodialAccounts(
                undefined,
                undefined,
                undefined,
                samePoolCustodialAccounts.map(x => x.uid)
            );

            const existingCustodialAccountUids = existingCustodialAccounts.data.map(x => x.uid);

            // Add custodial accounts that are not existing in the DB
            const nonExistingCustodialAccounts = samePoolCustodialAccounts
                .filter(x => !existingCustodialAccountUids.includes(x.uid))
                .map(custodialAccountService.mapRizeCustodialAccountToDbCustodialAccount);

            if (nonExistingCustodialAccounts.length > 0) {
                await eachAsync(nonExistingCustodialAccounts, async (custodialAccount) => {
                    try {
                        await custodialAccountService.addCustodialAccountsToDb(custodialAccount);
                    } catch (err) {
                        if (!dbUtils.isDuplicateDbKeyError(err, custodialAccount.uid)) {
                            throw err;
                        }
                    }
                });
            }
        }
    };

    /**
     * @param {SyntheticAccountCreatedEventPayloadDetails} details
     */
    const syntheticAccountCreated = async (details) => {
        // Check if the synthetic account already exists in the DB
        let dbSyntheticAccount = await syntheticAccountService.getSyntheticAccountByUid(details.synthetic_account_uid);

        let poolUid;
        let rizeSyntheticAccount;

        if (!dbSyntheticAccount) {
            // Get the latest synthetic account data from Rize
            rizeSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(details.synthetic_account_uid);

            poolUid = rizeSyntheticAccount.pool_uid;
        } else {
            poolUid = dbSyntheticAccount.pool_uid;
        }

        const pool = await createPoolIfNotExisting(poolUid);

        await createPoolCustodialAccountsIfNotExisting(pool);

        if (!dbSyntheticAccount) {
            // Add the new synthetic account to DB
            dbSyntheticAccount = syntheticAccountService.mapRizeSyntheticAccountToDbSyntheticAccount(rizeSyntheticAccount);
            await syntheticAccountService.addSyntheticAccountToDb(dbSyntheticAccount);
        }
    };

    /**
     * @param {SyntheticAccountStatusChangedEventPayloadDetails} details
     */
    const syntheticAcccountStatusChanged = async (details) => {
        // Check if the synthetic account already exists in the DB
        const dbSyntheticAccount = await syntheticAccountService.getSyntheticAccountByUid(details.synthetic_account_uid);

        // Get the latest synthetic account data from Rize
        const rizeSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(details.synthetic_account_uid);

        let poolUid;

        if (!dbSyntheticAccount) {
            poolUid = rizeSyntheticAccount.pool_uid;
        } else {
            poolUid = dbSyntheticAccount.pool_uid;
        }

        const pool = await createPoolIfNotExisting(poolUid);

        await createPoolCustodialAccountsIfNotExisting(pool);

        const updatedDbSyntheticAccount = syntheticAccountService.mapRizeSyntheticAccountToDbSyntheticAccount(rizeSyntheticAccount);

        if (!dbSyntheticAccount) {
            // Add the new synthetic account to DB
            await syntheticAccountService.addSyntheticAccountToDb(updatedDbSyntheticAccount);
        } else {
            // Update the existing synthetic account in the DB
            await syntheticAccountService.updateSyntheticAccountInDb(updatedDbSyntheticAccount);
        }
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
                        syntheticAccountCreated(message.data.details)
                            .then(() => {
                                ack();
                            })
                            .catch(e => {
                                logger.error(e);
                                nack();
                            });
                    } else if (['status_change', 'updated', 'name_updated'].includes(message.data.event_type)) {
                        syntheticAcccountStatusChanged(message.data.details)
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
        'synthetic_account',
        'syntheticAccountSubscription',
        listener,
        'client-individual'
    );
};

/**
 * @typedef SyntheticAccountCreatedEventPayloadDetails
 * @property {string} extenal_uid
 * @property {string} synthetic_account_category
 * @property {string} synthetic_account_uid
 * @property {string} status
 */

/**
 * @typedef PlaidError
 * @property {string} error_code
 * @property {string} error_message
 * @property {string} error_type
 * @property {string} request_id
 */

/**
 * @typedef SyntheticAccountStatusChangedEventPayloadAdditionalInfo
 * @property {string} message
 * @property {PlaidError} plaid
 */

/**
 * @typedef SyntheticAccountStatusChangedEventPayloadDetails
 * @property {string} external_uid
 * @property {string} synthetic_account_category
 * @property {string} synthetic_account_uid
 * @property {string} new_status
 * @property {string} old_status
 * @property {SyntheticAccountStatusChangedEventPayloadAdditionalInfo} additional_info
 */

/**
 * @typedef SyntheticAccountEventPayload
 * @property {string} event_type
 * @property {any} details
 */

/**
 * @typedef MessageBody
 * @property {SyntheticAccountEventPayload} data
 */

module.exports = subscribeToSyntheticAccountEvents;
