const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for transfer-related features
 * @param {import('./transfer.controller')} transferController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 * @param {import('./transfer.validator')} transferValidator
 */
module.exports = function TransferRouter(
    transferController,
    authGuard,
    paginationSanitizer,
    transferValidator,
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, paginationSanitizer, (req, res, next) => {
        const {
            limit,
            offset
        } = req.query;

        transferController.getTransfers(req.user.sub, limit, offset)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid', authGuard, (req, res, next) => {
        const { uid } = req.params;

        transferController.getTransferByUid(req.user.sub, uid)
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

    router.post('/', authGuard, transferValidator.validateCreate, (req, res, next) => {
        const data = {
            source_synthetic_account_uid: req.body.source_synthetic_account_uid,
            destination_synthetic_account_uid: req.body.destination_synthetic_account_uid,
            usd_transfer_amount: req.body.usd_transfer_amount
        };

        transferController.createTransfer(req.user.sub, data)
            .then((data) => {
                res.status(201).send(data);
            })
            .catch((err) => {
                if (!isNaN(err.status) && err.status < 500) {
                    res.status(err.status).send(err.data);
                } else {
                    next(err);
                }
            });
    });

    return router;
};
