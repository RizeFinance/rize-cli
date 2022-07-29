const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for auth-related features
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

    router.post(
        '/forgot_password',
        authValidator.validateForgotPassword,
        async (req, res, next) => {
            const { email } = req.body;

            try {
                await authController
                    .forgotPassword(email)
                    .then(data => {
                        if (!data.success) {
                            res.status(data.status).send(data);
                        } else {
                            res.status(200).send(data);
                        }
                    })
                    .catch(err => {
                        next(err);
                    });
            } catch (err) {
                next(err);
            }
        },
    );

    router.post(
        '/confirm_password',
        authValidator.validateConfirmPassword,
        async (req, res, next) => {
            const { email, code, password } = req.body;

            try {
                const data = await authController.confirmPassword(
                    email,
                    code,
                    password,
                );
                if (data && data.success) {
                    res.status(200).send(data);
                } else {
                    res.status(data.status).send(data);
                }
            } catch (err) {
                next(err);
            }
        },
    );

    router.post('/set_password', authValidator.validateSetPassword, (req, res, next) => {
        const {
            username,
            old_password,
            new_password
        } = req.body;

        authController.setPassword(username, old_password, new_password)
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
