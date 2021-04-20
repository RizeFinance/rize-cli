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

    /**
     * @param {TransferStatusChangedEventPayloadDetails} details
     */
    const transferStatusChanged = async (details) => {
        // Check if the transfer already exists
        const existingTransfer = await transferService.getTransferByUid(details.transfer_uid);

        if (!existingTransfer) {
            logger.error(`Transfer with Uid:${details.transfer_uid} does not exist in db.`);
        } else {
            await transferService.updateTransferInDb({
                uid: details.transfer_uid,
                status: details.new_status
            });
        }
    };

    const listener = (err, msg, consumptionSuccess, consumptionFailed) => {
        if (!err) {
            msg.readString('UTF-8', (err, body) => {
                /** @type {MessageBody} */
                const message = JSON.parse(body);

                if (!message) {
                    consumptionFailed();
                    return;
                }

                if (message.data.event_type === 'created') {
                    transferInitiated(message.data.details);
                }

                if (message.data.event_type === 'status_change') {
                    transferStatusChanged(message.data.details);
                }
            });
            consumptionSuccess();
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
 * @typedef TransferStatusChangedEventPayloadDetails
 * @property {string} customer_external_uid
 * @property {string} customer_uid
 * @property {string} new_status
 * @property {string} transfer_uid
 */

/**
 * @typedef TransferInitiatedEventPayloadDetails
 * @property {string} customer_external_uid
 * @property {string} customer_uid
 * @property {string} usd_transfer_amount
 * @property {string} transfer_uid
 */

/**
 * @typedef TransferStatusChangedEventPayload
 * @property {string} event_type
 * @property {TransferStatusChangedEventPayloadDetails} details
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
