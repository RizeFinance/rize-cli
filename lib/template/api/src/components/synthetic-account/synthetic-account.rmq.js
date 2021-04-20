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

    /**
     * @param {SyntheticAccountEventPayload} payload
     * 
     */
    const syntheticAccountEvent  = async (payload) => {
        const { details, event_type } = payload;
        // Check if the synthetic account already exists in the DB
        const syntheticAccount = await syntheticAccountService.getSyntheticAccountByUid(details.synthetic_account_uid);
        
        let poolUid;
        let fetchedSyntheticAccount;
        if(!syntheticAccount) {
            logger.warn(`RMQ: Warning. Synthetic account with uid: ${details.synthetic_account_uid} did not exist in the DB. Adding the new synthetic account.`);

            // Get the latest synthetic account data from Rize
            fetchedSyntheticAccount = await syntheticAccountService.getRizeSyntheticAccount(details.synthetic_account_uid);

            poolUid = fetchedSyntheticAccount.pool_uid;
        }

        // Check if the pool data already exists in the DB
        let pool = await poolService.getPoolByUid(poolUid);
        
        if (!pool) {
            // Get pool data from Rize
            pool = await poolService.getRizePool(poolUid);

            // Add the pool data to DB
            poolService.addPoolToDb(pool);
        }
    
        const custodialAccounts = await custodialAccountService.getRizeCustodialAccount({ customer_uid: pool.owner_customer_uid });

        if(custodialAccounts.data.length) {
            const samePoolCustodialAccounts = custodialAccounts.data.filter(ca => {
                if(ca.pool_uid === syntheticAccount.pool_uid) {
                    delete ca.account_errors;
                    delete ca.account_number;
                    return ca;
                }
            });

            if(samePoolCustodialAccounts && samePoolCustodialAccounts.length) {
                await custodialAccountService.addCustodialAccountsToDb(samePoolCustodialAccounts);
            }
        }

        // Add the new synthetic account to DB
        delete fetchedSyntheticAccount.account_number;
        if(event_type === 'created') {
            await syntheticAccountService.addSyntheticAccountToDb(fetchedSyntheticAccount);
        } else {
            await syntheticAccountService.updateSyntheticAccountInDb(fetchedSyntheticAccount);
        }
    };

    const listener = (err, msg, consumptionSuccess, consumptionFailed) => {
        if (!err) {
            try {
                msg.readString('UTF-8', (err, body) => {

                    /** @type {MessageBody} */
                    const message = JSON.parse(body);
    
                    if(!message) {
                        consumptionFailed();
                        return;
                    }
                    
                    syntheticAccountEvent(message.data.details, message.data.event_type)
                        .then(() => {
                            consumptionSuccess();
                        })
                        .catch(e => {
                            logger.error(e);
                            consumptionFailed();
                        });
                });
            } catch(e) {
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
 * @typedef SyntheticAccountEventPayloadDetails
 * @property {string} extenal_uid
 * @property {string} synthetic_account_category
 * @property {string} synthetic_account_uid
 * @property {string} status
 * @property {string?} new_status
 * @property {string?} old_status
 */

/**
 * @typedef SyntheticAccountEventPayload
 * @property {string} event_type
 * @property {SyntheticAccountEventPayloadDetails} details
 */

/**
 * @typedef MessageBody
 * @property {SyntheticAccountEventPayload} data
 */

module.exports = subscribeToSyntheticAccountEvents;