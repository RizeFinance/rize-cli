/**
 * @param {any} rmqClient
 * @param {import('./debit-card.controller')} debitCardController
 * @param {any} logger
 */
const subscribeToDebitCardEvents = async (
    rmqClient,
    debitCardService,
    logger
) => {
    const dbUtils = require('../../utils/dbUtils');
    
    /**
     * @param {DebitCardEventPayloadDetails} details 
     */
    const syncDebitCard = async (details) => {
        // Check if the debit card exists in the database
        const existingDebitCard = await debitCardService.getDebitCardByUid(details.debit_card_uid);
        // Get updated debit card data from Rize
        const rizeDebitCard = await debitCardService.getRizeDebitCard(details.debit_card_uid);
        const dbDebitCard = debitCardService.mapRizeDebitCardToDbDebitCard(rizeDebitCard);
        
        if (!existingDebitCard) {
            // Create a new debit card
            try {
                await debitCardService.addDebitCardToDb(dbDebitCard);
            } catch (err) {
                if (!dbUtils.isDuplicateDbKeyError(err, details.customer_uid)) {
                    throw err;
                }
            }
        } else {
            // Update existing debit card in the database
            await debitCardService.updateDebitCardInDb(dbDebitCard);
        }
    };

    const listener = (err, msg, ack, nack) => {
        const syncEventTypes = ['requested', 'issued', 'status_change', 'reissue_requested'];

        if (!err) {
            try {
                msg.readString('UTF-8', (err, body) => {

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