const express = require('express');
const bodyParser = require('body-parser');

/**
 * This is the router for debit card-related features
 * @param {import('./debit-card.controller')} debitCardController
 * @param {import('../../middlewares/authGuard')} authGuard
 * @param {import('../../middlewares/paginationSanitizer')} paginationSanitizer,
 * @param {import('./debit-card.validator')} debitCardValidator
 */
module.exports = function DebitCardRouter(
    debitCardController,
    authGuard,
    paginationSanitizer,
    debitCardValidator
) {

    const router = express.Router();

    /* Parse HTTP request bodies as JSON */
    router.use(bodyParser.json());

    router.get('/', authGuard, paginationSanitizer, debitCardValidator.validateGetList, (req, res, next) => {
        const {
            limit,
            offset,
        } = req.query;

        debitCardController.getDebitCards(req.user.sub, limit, offset)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid', authGuard, (req, res, next) => {
        const { uid } = req.params;

        debitCardController.getDebitCardByUid(req.user.sub, uid)
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

    router.post('/', authGuard, (req, res, next) => {
        const { pool_uid } = req.body;

        debitCardController.createDebitCard(req.user.sub, pool_uid)
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

    router.put('/:uid/lock', authGuard, debitCardValidator.validateLock, (req, res, next) => {
        const { uid } = req.params;
        const { reason } = req.body;

        debitCardController.lockDebitCardByUid(req.user.sub, uid, reason)
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

    router.put('/:uid/reissue', authGuard, debitCardValidator.validateReissue, (req, res, next) => {
        const { reissue_reason } = req.body;
        const { uid } = req.params;

        debitCardController.reissueDebitCard(req.user.sub, uid, reissue_reason)
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

    router.put('/:uid/unlock', authGuard, (req, res, next) => {
        const { uid } = req.params;

        debitCardController.unlockDebitCardByUid(req.user.sub, uid)
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

    router.put('/:uid/activate', authGuard, (req, res, next) => {
        const { uid } = req.params;
        const { card_last_four_digits, cvv, expiry_date } = req.body;
        
        debitCardController.activateDebitCard(req.user.sub, uid, card_last_four_digits, cvv, expiry_date)
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
      
    router.get('/:uid/pin_set_token', authGuard, (req, res, next) => {
        const { uid } = req.params;

        debitCardController.getPinSetToken(uid)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                next(err);
            });
    });

    router.get('/:uid/access_token', authGuard, (req, res, next) => {
        const { uid } = req.params;

        debitCardController.getAccessToken(uid)
            .then(data => res.status(200).send(data))
            .catch(err => next(err)); 
    });

    router.get('/assets/virtual_card_image', authGuard, (req, res, next) => {
        const {config, token} = req.query;
      
        debitCardController.getVirtualCardImage(config, token)
            .then(data => res.status(200).send(data))
            .catch(err => next(err));
    });

    router.put('/:uid/migrate', authGuard, (req, res, next) => {
        const {uid} = req.params;
        const {customerUid, poolUid} = req.body;

        debitCardController.migrateVirtualCard(uid, customerUid, poolUid)
            .then(data => res.status(200).send(data))
            .catch(err => next(err));
    });

    return router;
};
