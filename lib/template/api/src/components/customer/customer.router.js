const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for customer-related features
 * @param {import('./customer.controller')} customerController
 * @param {import('../../middlewares/authGuard')} authGuard
 */
module.exports = function CustomerRouter(customerController, authGuard, customerValidator) {

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

    router.post('/batch_profile_answers', authGuard, customerValidator.validateProfileAnswers, (req, res, next) => {
        const data = {
            answers: req.body.answers
        };

        customerController.answerProfileQuestions(req.user.sub, data)
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

    router.get('/customer_products', authGuard, (req, res, next) => {
        customerController.getCustomerProducts(req.user.sub)
            .then((data) => {
                if (!data) {
                    res.sendStatus(404);
                }
                else {
                    res.status(200).send(data);
                }
            })
            .catch((err) => {
                next(err);
            });
    });

    router.post('/customer_products', authGuard, (req, res, next) => {
        const {
            product_uid
        } = req.body;

        customerController.createCustomerProduct(req.user.sub, product_uid)
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
