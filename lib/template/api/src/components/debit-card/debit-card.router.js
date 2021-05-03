const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for debit card-related features
 * @param {import('./debit-card.controller')} debitCardController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer,
 * @param {import('./debit-card.validator')} debitCardValidator
 */
module.exports = function DebitCardRouter(
    debitCardController,
    authGuard,
    paginationSanitizer,
    debitCardValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, paginationSanitizer, debitCardValidator.validateGetList, (req, res, next) => {
        const {
            limit,
            offset,
            pool_uid
        } = req.query;

        debitCardController.getDebitCards(req.user.sub, limit, offset, pool_uid)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid', authGuard, (req, res, next) => {
        const { uid } = req.params;

        debitCardController.getDebitCardByUid(req.user.sub, uid)
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

    router.post('/', authGuard, (req, res, next) => {
        const { pool_uid } = req.body;

        debitCardController.createDebitCard(req.user.sub, pool_uid)
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
