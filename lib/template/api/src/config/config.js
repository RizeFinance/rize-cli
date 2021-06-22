module.exports = {
    'port': process.env.API_PORT || 3000,
    'cors_allow_origin': process.env.CORS_ALLOW_ORIGIN || '*',
    'cors_allow_headers': 'Content-Type, Authorization',
    'sysloglevel': process.env.SYSLOG_LEVEL || 'error',
    'auth': {
        provider: process.env.AUTH_PROVIDER,
        domain: process.env.AUTH_DOMAIN,
        clientId: process.env.AUTH_CLIENT_ID,
        audience: process.env.AUTH_AUDIENCE,
        poolId: process.env.AUTH_POOL_ID,
        poolRegion: process.env.AUTH_POOL_REGION,
    },
    'account': {
        provider: process.env.ACCOUNT_AUTH_PROVIDER,
        clientId: process.env.ACCOUNT_AUTH_CLIENT_ID,
        secret: process.env.ACCOUNT_AUTH_SECRET,
        env: process.env.RIZE_ENV,
    },
    'rize': {
        environment: process.env.RIZE_ENV,
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
        searchPath: ['public', process.env.DB_DEFAULT_SCHEMA],
        pool: {
            max: 20, // set pool max size to 20
            idleTimeoutMillis: 100000, // close idle clients after 1 second
        }
    },
    'rmq': {
        hosts: process.env.RMQ_HOSTS, 
        clientId: process.env.RMQ_CLIENT_ID,
        username: process.env.RMQ_USERNAME,
        password: process.env.RMQ_PASSWORD,
        topic: process.env.RMQ_TOPIC,
    }
};
