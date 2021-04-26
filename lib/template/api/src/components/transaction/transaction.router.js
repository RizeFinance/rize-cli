const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for transaction-related features
 * @param {import('./transaction.controller')} transactionController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 * @param {import('./transaction.validator')} transactionValidator
 */
module.exports = function TransactionRouter (
    transactionController,
    authGuard,
    paginationSanitizer,
    transactionValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, paginationSanitizer, transactionValidator.validateGetList, (req, res, next) => {
        const {
            limit,
            offset,
            synthetic_account_uid
        } = req.query;

        transactionController.getTransactions(req.user.sub, limit, offset, synthetic_account_uid)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid', authGuard, (req, res, next) => {
        const { uid } = req.params;

        transactionController.getTransactionByUid(req.user.sub, uid)
            .then((data) => {
                if (!data) {
                    res.sendStatus(404);
                } else {
                    res.status(200).send(data);
                }
            })
            .catch((err) => {
                next(err);
            });
    });

    return router;
};
