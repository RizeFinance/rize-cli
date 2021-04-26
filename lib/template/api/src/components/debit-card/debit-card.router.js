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

    return router;
};
