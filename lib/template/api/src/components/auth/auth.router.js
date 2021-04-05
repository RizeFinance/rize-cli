/**
 * This is the router for auth-related features
 */

const express = require('express');
const bodyParser = require('body-parser');

/**
 * @param {import('./auth.controller')} authController
 * @param {import('./auth.validator')} authValidator
 */
// TODO: Remove eslint-disable-line
module.exports = function AuthRouter (authController, authValidator) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', (req, res) => {
        res.json({ success: true });
    });

    router.post('/register', authValidator.validateRegister, (req, res, next) => {
        const {
            username,
            password
        } = req.body;

        authController.registerUser(username, password)
            .then((data) => {
                if (!data.success) {
                    res.status(data.status).send(data);
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
