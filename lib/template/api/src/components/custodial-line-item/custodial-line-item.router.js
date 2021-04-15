const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for custodial line item-related features
 * @param {import('./custodial-line-item.controller')} custodialLineItemController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 * @param {import('./custodial-line-item.validator')} custodialLineItemValidator
 */
module.exports = function CustodialAccountRouter(
    custodialLineItemController,
    authGuard,
    paginationSanitizer,
    custodialLineItemValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/',
        authGuard,
        paginationSanitizer,
        custodialLineItemValidator.validateGetList,
        (req, res, next) => {
            const {
                limit,
                offset,
                transaction_uid
            } = req.query;

            custodialLineItemController.getCustodialLineItems(req.user.sub, limit, offset, transaction_uid)
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
