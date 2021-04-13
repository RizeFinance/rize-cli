require('dotenv').config();

module.exports = {
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
        },
        migrations: {
            directory: __dirname + '../../migrations',
        },
        seeds: {
            directory: __dirname + '../../seeds'
        },
    },
    'rize': {
        programId: process.env.RIZE_PROGRAM_ID,
        hmac: process.env.RIZE_API_SECRET,
    }
};
