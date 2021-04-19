const uuid = require('uuid').v4;

/**
 * This is the controller for transfer-related features
 */
class TransferController {
    /**
     * @param {import('./transfer.service')} transferService
     * @param {import('../synthetic-account/synthetic-account.service')} syntheticAccountService
     */
    constructor(transferService, syntheticAccountService) {
        /** @protected */
        this._transferService = transferService;

        /** @protected */
        this._syntheticAccountService = syntheticAccountService;
    }

    async getTransfers(customerExternalUid, limit = 100, offset = 0) {
        const transfers = await this._transferService.getTransfers(
            limit,
            offset,
            customerExternalUid,
        );

        return transfers;
    }

    async getTransferByUid(customerExternalUid, transferUid) {
        const transfer = await this._transferService.getTransferByUid(
            transferUid,
            customerExternalUid
        );

        return transfer;
    }

    async createTransfer(customerExternalUid, data) {
        if (data.source_synthetic_account_uid === data.destination_synthetic_account_uid) {
            throw {
                status: 400,
                data: {
                    errors: [
                        {
                            title: 'Could not transfer to the same Synthetic Account',
                            detail: 'The source and destination synthetic account are the same',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 400,
                }
            };
        }

        if (data.usd_transfer_amount <= 0) {
            throw {
                status: 400,
                data: {
                    errors: [
                        {
                            title: 'usd_transfer_amount is invalid',
                            detail: 'usd_transfer_amount should be a positive number',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 400,
                }
            };
        }

        // Check if the customer is associated with the source synthetic account
        const allowed = await this._syntheticAccountService.getSyntheticAccountByUid(
            data.source_synthetic_account_uid,
            customerExternalUid
        );

        if (!allowed) {
            throw {
                status: 403,
                data: {
                    errors: [
                        {
                            title: 'Could not create Transfer',
                            detail: 'This customer does not own the synthetic account',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        data.external_uid = uuid();
        data.initiating_customer_uid = customerExternalUid;

        const rizeTransfer = await this._transferService.createRizeTransfer(data);
        await this._transferService.addTransferToDb(rizeTransfer);

        return rizeTransfer;
    }
}

module.exports = TransferController;
