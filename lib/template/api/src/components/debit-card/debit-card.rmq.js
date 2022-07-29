const uuid = require('uuid').v4;
/**
 * @param {any} rmqClient
 * @param {import('./debit-card.controller')} debitCardController
 * @param {any} logger
 */
const subscribeToDebitCardEvents = async (
    rmqClient,
    debitCardService,
    logger,
    poolService,
) => {
    const dbUtils = require('../../utils/dbUtils');
    
    const checkForPoolUid = async (poolUid, customerUid) => {
        let poolUidPromise;

        if (typeof poolUidPromise === 'undefined') {
            poolUidPromise = new Promise(resolve => {
                const threeSeconds = 1000 * 3;
                const interval = setInterval(async () => {
                    const poolUidExists = await poolService.getPoolByUid(
                        poolUid,
                        null,
                        customerUid,
                    );
                    if(poolUidExists) {
                        resolve(poolUidExists);
                        clearInterval(interval);
                    }
                }, threeSeconds);
            });
        }

        return poolUidPromise;
    };

    /**
      @param {DebitCardEventPayloadDetails} details 
     */
    const syncDebitCard = async details => {
        // Check if the debit card exists in the database
        const existingDebitCard = await debitCardService.getDebitCardByUid(
            details.debit_card_uid,
        );

        // Get updated debit card data from Rize
        const rizeDebitCard = await debitCardService.getRizeDebitCard(
            details.debit_card_uid,
        );

        const dbDebitCard =
        debitCardService.mapRizeDebitCardToDbDebitCard(rizeDebitCard);

        if (!existingDebitCard) {
            if (!dbDebitCard.external_uid) {
                dbDebitCard.external_uid = uuid();
            }

            if(rizeDebitCard.status === 'shipped') {
                await debitCardService.addDebitCardToDb(dbDebitCard);
                return;
            }

            if (dbDebitCard.type === 'virtual') {
                const result = await checkForPoolUid(
                    dbDebitCard.pool_uid,
                    dbDebitCard.customer_uid,
                );

                if (result) {
                    try {
                        await debitCardService.addDebitCardToDb(dbDebitCard);
                    } catch (err) {
                        if (!dbUtils.isDuplicateDbKeyError(err, details.customer_uid)) {
                            throw err;
                        }
                    }
                }
            }
        } else {
        // Update existing debit card in the database
            await debitCardService.updateDebitCardInDb(dbDebitCard);
        }
    };

    const listener = (err, msg, ack, nack) => {
        const syncEventTypes = [
            'requested',
            'issued',
            'status_change',
            'updated',
            'reissue_requested',
            'lock',
            'unlock',
            'pin_changed',
            'pin_staging_failed',
            'pin_commit_failed',
        ];

        if (!err) {
            msg.readString('UTF-8', (_err, body) => {
                try {
                    /** @type {MessageBody} */
                    const message = JSON.parse(body);

                    if (!message) {
                        nack();
                        return;
                    }
                    if (syncEventTypes.includes(message.data.event_type)) {
                        syncDebitCard(message.data.details)
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
        'debit_card',
        'debitCardSubscription',
        listener,
        'client-individual'
    );
};

/**
 * @typedef DebitCardEventPayloadDetails
 * @property {string} card_last_four
 * @property {string} customer_uid
 * @property {string} debit_card_uid
 * @property {string} external_uid
 * @property {string} pool_uid
 * @property {string} prior_status
 * @property {string} ready_to_use
 */

/**
 * @typedef DebitCardEventPayload
 * @property {string} event_type
 * @property {any} details
 */


/**
 * @typedef MessageBody
 * @property {DebitCardEventPayload} data
 */

module.exports = subscribeToDebitCardEvents;