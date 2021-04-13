const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for synthetic account-related features
 * @param {import('./syntheticAccount.controller')} syntheticAccountController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 */
module.exports = function SyntheticAccountRouter(
    syntheticAccountController,
    authGuard,
    paginationSanitizer
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

    router.get('/:uid', authGuard, paginationSanitizer, (req, res, next) => {
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

    return router;
};
