const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for transaction event-related features
 * @param {import('./transaction-event.controller')} transactionEventController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 * @param {import('./transaction-event.validator')} transactionEventValidator
 */
module.exports = function TransactionEventRouter(
    transactionEventController,
    authGuard,
    paginationSanitizer,
    transactionEventValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/',
        authGuard,
        paginationSanitizer,
        transactionEventValidator.validateGetList,
        (req, res, next) => {
            const {
                limit,
                offset,
                transaction_uid
            } = req.query;

            const customerExternalUid = req.user.sub;

            transactionEventController.getTransactionEvents(limit, offset, customerExternalUid, transaction_uid)
                .then((data) => {
                    res.status(200).send(data);
                })
                .catch((err) => {
                    next(err);
                });
        }
    );

    router.get('/:uid', authGuard, (req, res, next) => {
            const { uid } = req.params;

            const customerExternalUid = req.user.sub;

            transactionEventController.getTransactionEventByUid(customerExternalUid, uid)
                .then((data) => {
                    res.status(200).send(data);
                })
                .catch((err) => {
                    next(err);
                });
        }
    );

    return router;
};
