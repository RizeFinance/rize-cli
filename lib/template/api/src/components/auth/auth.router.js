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
module.exports = function AuthRouter(authController, authValidator) { // eslint-disable-line

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', (req, res) => {
        res.json({ success: true });
    });

    return router;
};
