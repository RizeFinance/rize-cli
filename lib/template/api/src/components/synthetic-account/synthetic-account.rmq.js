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
    rizeProvider,
    syntheticAccountService,
    custodialAccountService,
    poolService,
    logger
) => {
    const syntheticAccountCreated  = async (details) => {
        let custodialAccounts;
        const syntheticAccount = await syntheticAccountService.getSyntheticAccountByUid(details.synthetic_account_uid);

        if(!syntheticAccount) {
            logger.warn(`Synthetic account with uid: ${details.synthetic_account_uid} does not exist on the DB`);
        } else {
            const pools = await poolService.getPoolByUid(syntheticAccount.pool_uid);

            custodialAccounts = await rizeProvider.custodialAccount.getList({ pool_uid: pools });
        }
        
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
    };

    const listener = (err, msg, consumptionSuccess, consumptionFailed) => {
        if (!err) {
            msg.readString('UTF-8', (err, body) => {

                const message = JSON.parse(body);

                if(!message) {
                    consumptionFailed();
                    return;
                }
                
                if(message.data.event_type === 'created') {
                    syntheticAccountCreated(message.data.details);
                }

            });
            consumptionSuccess();
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

module.exports = subscribeToSyntheticAccountEvents;