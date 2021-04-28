const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for customer-related features
 * @param {import('./customer.controller')} customerController
 * @param {import('../../middlewares/authGuard')} authGuard
 */
module.exports = function CustomerRouter(customerController, authGuard) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, (req, res, next) => {
        customerController.getCustomer(req.user.sub)
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

    router.put('/', authGuard, (req, res, next) => {
        const {
            email,
            details
        } = req.body;

        customerController.updateCustomer(req.user.sub, email, details)
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
