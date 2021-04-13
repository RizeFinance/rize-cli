const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for synthetic account type-related features
 * @param {import('./syntheticAccountType.controller')} syntheticAccountTypeController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer
 */
module.exports = function SyntheticAccountTypeRouter(
    syntheticAccountTypeController,
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

        syntheticAccountTypeController.getSyntheticAccountTypes(limit, offset)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid', authGuard, paginationSanitizer, (req, res, next) => {
        const typeUid = req.params.uid

        syntheticAccountTypeController.getSyntheticAccountTypesByUid(typeUid)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    return router;
};
