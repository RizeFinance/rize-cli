/**
 * @param {import('../providers/auth').Authentication} authProvider 
 */
function AuthGuard(authProvider) {
    return async (req, res, next) => {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.replace('Bearer ', '');
            const decodedJwt = await authProvider.verifyToken(token);
            
            if (decodedJwt) {
                req.user = decodedJwt;
                next();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    };
}

module.exports = AuthGuard;