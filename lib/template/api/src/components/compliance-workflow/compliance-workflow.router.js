const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for compliance workflow-related features
 * @param {import('./compliance-workflow.controller')} complianceWorkflowController
 * @param {import('../../middlewares/authGuard')} authGuard
 */
module.exports = function CustomerRouter(complianceWorkflowController, authGuard) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.post('/renew', authGuard, (req, res, next) => {
        complianceWorkflowController.getCustomer(req.user.sub)
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
