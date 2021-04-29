const uuid = require('uuid').v4;

/**
 * This is the controller for transfer-related features
 */
class TransferController {
    /**
     * @param {import('./transfer.service')} transferService
     * @param {import('../synthetic-account/synthetic-account.service')} syntheticAccountService
     * @param {import('../customer/customer.service')} customerService
     * @param {import('../transaction/transaction.service')} transactionService
     */
    constructor(transferService, syntheticAccountService, customerService, transactionService) {
        /** @protected */
        this._transferService = transferService;

        /** @protected */
        this._syntheticAccountService = syntheticAccountService;

        /** @protected */
        this._customerService = customerService;

        /** @protected */
        this._transactionService = transactionService;
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

        data.initiating_customer_uid = allowed.customer_uid;
        data.external_uid = uuid();

        const rizeTransfer = await this._transferService.createRizeTransfer(data);
        const dbTransfer = this._transferService.mapRizeTransferToDbTransfer(rizeTransfer);
        await this._transferService.addTransferToDb(dbTransfer);
        
        // Get transactions related to this transfer
        const rizeTransactions = await this._transactionService.getRizeTransactions({
            limit: 5,
            source_synthetic_account_uid: [rizeTransfer.source_synthetic_account_uid],
            destination_synthetic_account_uid: [rizeTransfer.destination_synthetic_account_uid],
            sort: 'created_at_desc',
            customer_uid: [rizeTransfer.initiating_customer_uid]
        });

        const transferTransactions = rizeTransactions.data
            .filter(x => x.transfer_uid === rizeTransfer.uid)
            .map(this._transactionService.mapRizeTransactionToDbTransaction);

        if (transferTransactions.length > 0) {
            // Add the transactions to the DB
            await this._transactionService.addTransactionToDb(transferTransactions);
        }

        // Get the latest synthetic account details
        const [rizeSourceSyntheticAccount, rizeDestinationSyntheticAccount] = await Promise.all([
            this._syntheticAccountService.getRizeSyntheticAccount(rizeTransfer.source_synthetic_account_uid),
            this._syntheticAccountService.getRizeSyntheticAccount(rizeTransfer.destination_synthetic_account_uid)
        ]);

        const dbSourceSyntheticAccount = this._syntheticAccountService.mapRizeSyntheticAccountToDbSyntheticAccount(rizeSourceSyntheticAccount);
        const dbDestinationSyntheticAccount = this._syntheticAccountService.mapRizeSyntheticAccountToDbSyntheticAccount(rizeDestinationSyntheticAccount);

        // Update the DB
        await Promise.all([
            this._syntheticAccountService.updateSyntheticAccountInDb(dbSourceSyntheticAccount),
            this._syntheticAccountService.updateSyntheticAccountInDb(dbDestinationSyntheticAccount)
        ]);

        return rizeTransfer;
    }
}

module.exports = TransferController;
