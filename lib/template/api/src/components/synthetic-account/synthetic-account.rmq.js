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
    const isDuplicateKeyError = (err, key) => {
        // Code for MySQL: ER_DUP_ENTRY
        // Code for PostgreSQL: 23505
        const isDuplicateError = err.code === 'ER_DUP_ENTRY' || err.code === '23505';

        let isKeyError = false;

        if (isDuplicateError) {
            // Check if the key is the error
            // MySQL
            if (err.sqlMessage && err.sqlMessage.includes(key)) {
                isKeyError = true;
            }
            // PostgreSQL
            if (err.detail && err.detail.includes(key)) {
                isKeyError = true;
            }
        }

        return isDuplicateError && isKeyError;
    };

    /**
     * @param {SyntheticAccountCreatedEventPayloadDetails} details
     */
    const syntheticAccountCreated = async (details) => {
        // Check if the synthetic account already exists in the DB
        const dbSyntheticAccount = await syntheticAccountService.getSyntheticAccountByUid(details.synthetic_account_uid);

        let poolUid;
        let rizeSyntheticAccount;

        if (!dbSyntheticAccount) {
            logger.warn(`RMQ: Synthetic account with uid: ${details.synthetic_account_uid} did not exist in the DB. Adding the new synthetic account.`);

            // Get the latest synthetic account data from Rize
            rizeSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(details.synthetic_account_uid);

            poolUid = rizeSyntheticAccount.pool_uid;
        } else {
            poolUid = dbSyntheticAccount.pool_uid;
        }

        // Check if the pool data already exists in the DB
        let pool = await poolService.getPoolByUid(poolUid);

        if (!pool) {
            // Get pool data from Rize
            pool = await poolService.getRizePool(poolUid);

            try {
                // Add the pool data to DB
                await poolService.addPoolToDb(pool);
            } catch (err) {
                if (isDuplicateKeyError(err, poolUid)) {
                    logger.warn(`RMQ: Duplicate pool uid ${poolUid}. Skipped adding a new pool.`);
                } else {
                    throw err;
                }
            }
        }

        const rizeCustodialAccounts = await custodialAccountService.getRizeCustodialAccounts(
            undefined,
            undefined,
            [pool.owner_customer_uid]
        );

        if (rizeCustodialAccounts.data.length) {
            // Filter by pool UID
            const samePoolCustodialAccounts = rizeCustodialAccounts.data.filter(ca => ca.pool_uid === poolUid);

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
                .map(x => {
                    delete x.account_errors;
                    delete x.account_number;
                    return x;
                });

            if (nonExistingCustodialAccounts.length > 0) {
                await custodialAccountService.addCustodialAccountsToDb(nonExistingCustodialAccounts);
            }
        }

        if (!dbSyntheticAccount) {
            delete rizeSyntheticAccount.account_number;
            delete rizeSyntheticAccount.customer_uid;

            // Add the new synthetic account to DB
            await syntheticAccountService.addSyntheticAccountToDb(rizeSyntheticAccount);
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
                        syntheticAccountCreated(message.data.details)
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
        'synthetic_account',
        'syntheticAccountSubscription',
        listener
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
 * @typedef SyntheticAccountCreatedEventPayload
 * @property {string} event_type
 * @property {TransactionCreatedEventPayloadDetails} details
 */

/**
 * @typedef MessageBody
 * @property {TransactionCreatedEventPayload} data
 */

module.exports = subscribeToSyntheticAccountEvents;