const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for synthetic line items-related features
 * @param {import('./synthetic-line-item.controller')} syntheticLineItemController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 * @param {import('./synthetic-line-item.validator')} syntheticLineItemValidator
 */
module.exports = function SyntheticLineItemRouter (
    syntheticLineItemController,
    authGuard,
    paginationSanitizer,
    syntheticLineItemValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/',
        authGuard,
        paginationSanitizer,
        syntheticLineItemValidator.validateGetList,
        (req, res, next) => {
            const {
                limit,
                offset,
                transaction_uid
            } = req.query;

            syntheticLineItemController.getSyntheticLineItems(req.user.sub, limit, offset, transaction_uid)
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

        syntheticLineItemController.getSyntheticLineItemByUid(req.user.sub, uid)
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
