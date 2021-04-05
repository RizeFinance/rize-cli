module.exports = {
    'port': process.env.API_PORT || 3000,
    'cors_allow_origin': '',
    'cors_allow_headers': '',
    'sysloglevel': process.env.SYSLOG_LEVEL || 'error',
    'auth': {
        provider: process.env.AUTH_PROVIDER,
        domain: process.env.AUTH_DOMAIN,
        clientId: process.env.AUTH_CLIENT_ID,
        audience: process.env.AUTH_AUDIENCE
    }
};
