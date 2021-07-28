const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for document features
 * @param {import('./document.controller')} documentController
 * @param {import('../../middlewares/authGuard')} authGuard
 */
module.exports = function DocumentRouter (
    documentController,
    authGuard
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, (req, res, next) => {
        documentController.getDocuments(req.user.sub)
            .then((data) => {
                if (!data) {
                    res.sendStatus(404);
                } else {
                    res.status(200).send(data);
                }
            })
            .catch((err) => {
                if (!isNaN(err.status) && err.status < 500) {
                    res.status(err.status).send(err.data);
                } else {
                    next(err);
                }
            });
    });

    router.get('/:uid/view', authGuard, (req, res, next) => {
        const { uid } = req.params;

        documentController.viewDocument(uid)
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
