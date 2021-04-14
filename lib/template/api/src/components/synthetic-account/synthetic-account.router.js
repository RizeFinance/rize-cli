const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for synthetic account-related features
 * @param {import('./synthetic-account.controller')} syntheticAccountController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 * @param {import('./synthetic-account.validator')} syntheticAccountValidator
 */
module.exports = function SyntheticAccountRouter(
    syntheticAccountController,
    authGuard,
    paginationSanitizer,
    syntheticAccountValidator,
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, paginationSanitizer, (req, res, next) => {
        const {
            limit,
            offset
        } = req.query;

        syntheticAccountController.getSyntheticAccounts(req.user.sub, limit, offset)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid', authGuard, (req, res, next) => {
        const { uid } = req.params;

        syntheticAccountController.getSyntheticAccountByUid(req.user.sub, uid)
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

    router.post('/', authGuard, syntheticAccountValidator.validateCreate, (req, res, next) => {
        const data = {
            name: req.body.name,
            pool_uid: req.body.pool_uid,
            synthetic_account_type_uid: req.body.synthetic_account_type_uid,
            account_number: req.body.account_number,
            routing_number: req.body.routing_number,
            plaid_processor_token: req.body.plaid_processor_token,
        };

        syntheticAccountController.createSyntheticAccount(req.user.sub, data)
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

    router.put('/:uid', authGuard, syntheticAccountValidator.validateUpdate, (req, res, next) => {
        const data = {
            name: req.body.name,
            note: req.body.note,
        };

        syntheticAccountController.updateSyntheticAccount(req.user.sub, req.params.uid, data)
            .then((data) => {
                res.status(200).send(data);
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
