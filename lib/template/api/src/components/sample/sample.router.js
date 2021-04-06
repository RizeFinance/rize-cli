const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for sample-related features
 */
module.exports = function SampleRouter(authGuard, logger) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, (req, res) => {
        logger.info(JSON.stringify(req.user, undefined, 2));
        res.status(200).send({ success: true });
    });

    return router;
};
