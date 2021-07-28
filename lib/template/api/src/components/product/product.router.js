const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for product features
 * @param {import('./product.controller')} productController
 * @param {import('../../middlewares/authGuard')} authGuard
 */
module.exports = function ProductRouter (
    productController,
    authGuard
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, (req, res, next) => {
        productController.getProducts()
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

    return router;
};
