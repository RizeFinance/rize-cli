const TransactionService = require('../components/transaction/transaction.service');
const { isBefore } = require('date-fns');
const eachAsync = require('../utils/eachAsync');

async function SyncTransactions(rizeProvider, dbProvider) {
    try {
        const transactionService = new TransactionService(dbProvider, rizeProvider);
    
        const Now = new Date();
        const twoDaysAgo = new Date(Now.setDate(Now.getDate() - 2));
        const transactions = await dbProvider('transactions').whereNot('status', 'settled');
        const oldTransactions = transactions.filter((transaction) => isBefore(transaction.created_at, twoDaysAgo));

        await eachAsync(oldTransactions, async (transaction) => {
            const dbTransaction = await transactionService.getTransactionByUid(transaction.uid);
            const rizeTransaction = await transactionService.getRizeTransaction(dbTransaction.uid);
            const newDbTransaction = await transactionService.mapRizeTransactionToDbTransaction(rizeTransaction);
            await transactionService.updateTransactionInDb(newDbTransaction);
        });
        console.log(`Attempted to update ${oldTransactions.length} transactions.`);
    } catch (err) {
        console.log(err);
    }
    
}

module.exports = SyncTransactions;