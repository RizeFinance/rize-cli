/**
 * @param {any} rmqClient
 * @param {import('./transfer.service')} transferService
 * @param {any} logger
 */
const subscribeToTransferEvents = async (
    rmqClient,
    transferService,
    logger,
) => {
    /**
     * @param {TransferInitiatedEventPayloadDetails} details
     */
    const transferInitiated = async (details) => {
        // Check if the transfer already exists
        const existingTransfer = await transferService.getTransferByUid(details.transfer_uid);

        if (!existingTransfer) {
            const rizeTransfer = await transferService.getRizeTransfer(details.transfer_uid);
            await transferService.addTransferToDb(rizeTransfer);
        }
    };

    const listener = (err, msg, consumptionSuccess, consumptionFailed) => {
        if (!err) {
            try {
                msg.readString('UTF-8', (err, body) => {
                    if (!err) {
                        /** @type {MessageBody} */
                        const message = JSON.parse(body);

                        if (!message) {
                            consumptionFailed();
                            return;
                        }

                        if (message.data.event_type === 'created') {
                            try {
                                transferInitiated(message.data.details);
                                consumptionSuccess();
                            } catch (e) {
                                logger.error(e);
                                consumptionFailed();
                            }
                        }
                        else {
                            logger.error(`Unhandled event_type: ${message.data.event_type}`);
                            consumptionFailed();
                        }
                    } else {
                        logger.error(err);
                        consumptionFailed();
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
        'transfer',
        'transferSubscription',
        listener
    );
};

/**
 * @typedef TransferInitiatedEventPayloadDetails
 * @property {string} customer_external_uid
 * @property {string} customer_uid
 * @property {string} usd_transfer_amount
 * @property {string} transfer_uid
 */

/**
 * @typedef TransferInitiatedEventPayload
 * @property {string} event_type
 * @property {TransferInitiatedEventPayloadDetails} details
 */

/**
 * @typedef MessageBody
 * @property {TransferInitiatedEventPayload} data
 */

module.exports = subscribeToTransferEvents;