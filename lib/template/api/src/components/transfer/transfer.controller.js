const uuid = require('uuid').v4;

/**
 * This is the controller for transfer-related features
 */
class TransferController {
    /**
     * @param {import('./transfer.service')} transferService
     * @param {import('../synthetic-account/synthetic-account.service')} syntheticAccountService
     * @param {import('../customer/customer.service')} customerService
     */
    constructor(transferService, syntheticAccountService, customerService) {
        /** @protected */
        this._transferService = transferService;

        /** @protected */
        this._syntheticAccountService = syntheticAccountService;

        /** @protected */
        this._customerService = customerService;
    }

    async getTransfers(customerExternalUid, limit = 100, offset = 0, syntheticAccountUids) {
        const transfers = await this._transferService.getTransfers(
            limit,
            offset,
            customerExternalUid,
            syntheticAccountUids
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

        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        data.initiating_customer_uid = customer.uid;
        data.external_uid = uuid();

        const rizeTransfer = await this._transferService.createRizeTransfer(data);
        await this._transferService.addTransferToDb(rizeTransfer);

        return rizeTransfer;
    }
}

module.exports = TransferController;
