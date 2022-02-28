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
    const dbUtils = require('../../utils/dbUtils');

    const createTransferIfNotExisting = async (transferUid) => {
        // Check if the transfer already exists
        let dbTransfer = await transferService.getTransferByUid(transferUid);

        if (!dbTransfer) {
            // Get transfer data from Rize
            const rizeTransfer = await transferService.getRizeTransfer(transferUid);
            dbTransfer = transferService.mapRizeTransferToDbTransfer(rizeTransfer);

            try {
                // Add the transfer data to DB
                await transferService.addTransferToDb(dbTransfer);
            } catch (err) {
                if (!dbUtils.isDuplicateDbKeyError(err, transferUid)) {
                    throw err;
                }
            }
        }

        return dbTransfer;
    };

    /**
     * @param {TransferInitiatedEventPayloadDetails} details
     */
    const transferInitiated = async (details) => {
        await createTransferIfNotExisting(details.transfer_uid);
    };

    /**
     * @param {TransferStatusChangedEventPayloadDetails} details
     */
    const transferStatusChanged = async (details) => {
        // Check if the transfer already exists
        const existingTransfer = await transferService.getTransferByUid(details.transfer_uid);

        if (!existingTransfer) {
            await createTransferIfNotExisting(details.transfer_uid);
        } else {
            const dbTransfer = transferService.mapRizeTransferToDbTransfer({
                uid: details.transfer_uid,
                status: details.new_status
            });
            await transferService.updateTransferInDb(dbTransfer);
        }
    };

    const listener = (err, msg, ack, nack) => {

        if (!err) {
            try {
                msg.readString('UTF-8', (err, body) => {
                    if (!err) {
                        /** @type {MessageBody} */
                        const message = JSON.parse(body);

                        if (!message) {
                            nack();
                            return;
                        }

                        if (message.data.event_type === 'created') {
                            try {
                                transferInitiated(message.data.details);
                                ack();
                            } catch (e) {
                                logger.error(e);
                                nack();
                            }
                        } else if (['status_change', 'updated'].includes(message.data.event_type)) {
                            try {
                                transferStatusChanged(message.data.details);
                                ack();
                            } catch (e) {
                                logger.error(e);
                                nack();
                            }
                        } else {
                            logger.error(`Unhandled event_type: ${message.data.event_type}`);
                            nack();
                        }
                    } else {
                        logger.error(err);
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
        'transfer',
        'transferSubscription',
        listener,
        'client-individual'
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
