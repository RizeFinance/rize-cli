const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for compliance workflow-related features
 * @param {import('./compliance-workflow.controller')} complianceWorkflowController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('./compliance-workflow.validator')} complianceWorkflowValidator
 */
module.exports = function ComplianceWorkflowRouter (
    complianceWorkflowController,
    authGuard,
    complianceWorkflowValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.post('/renew', authGuard, (req, res, next) => {
        complianceWorkflowController.renewComplianceWorkflow(req.user.sub)
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

    router.get('/latest', authGuard, (req, res, next) => {
        complianceWorkflowController.viewLatestComplianceWorkflow(req.user.sub)
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

    router.post('/batch_acknowledge_documents', authGuard, complianceWorkflowValidator.validateBatchAcknowledge, (req, res, next) => {
        const data = {
            documents: req.body.documents
        };

        complianceWorkflowController.acknowledgeComplianceDocuments(req.user.sub, data)
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

    return router;
};
