module.exports = {
    'port': process.env.API_PORT || 3000,
    'cors_allow_origin': '',
    'cors_allow_headers': '',
    'sysloglevel': process.env.SYSLOG_LEVEL || 'error',
    'auth': {}
};
