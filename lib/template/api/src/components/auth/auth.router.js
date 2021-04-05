/**
 * This is the router for auth-related features
 */

const express = require('express');
const bodyParser = require('body-parser');

/**
 * @param {import('./auth.controller')} authController
 * @param {import('./auth.validator')} authValidator
 */
module.exports = function AuthRouter(authController, authValidator) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.post('/authenticate', authValidator.validateAuthenticate, (req, res, next) => {
        const {
            username,
            password
        } = req.body;

        authController.authenticate(username, password)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    return router;
};
