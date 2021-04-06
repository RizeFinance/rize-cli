module.exports = {
    'port': process.env.API_PORT || 3000,
    'cors_allow_origin': '',
    'cors_allow_headers': '',
    'sysloglevel': process.env.SYSLOG_LEVEL || 'error',
    'auth': {
        provider: process.env.AUTH_PROVIDER,
        domain: process.env.AUTH_DOMAIN,
        clientId: process.env.AUTH_CLIENT_ID,
        audience: process.env.AUTH_AUDIENCE,
        poolId: process.env.AUTH_POOL_ID
    },
    'rize': {
        programId: process.env.RIZE_PROGRAM_ID,
        apiSecret: process.env.RIZE_API_SECRET
    },
    'database': {
        client: process.env.DB_PLATFORM,
        connection: {
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
        },
        searchPath: ['public', process.env.DB_DEFAULT_SCHEMA], // todo: check if mysql has public
        pool: {
            max: 20, // set pool max size to 20
            idleTimeoutMillis: 100000, // close idle clients after 1 second
        }
    }
};
