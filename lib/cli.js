'use strict';

const arg = require('arg');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const writeYamlFile = require('write-yaml-file');
const logger = require('../utils/logger');
const api = require('./tasks/api');
const db = require('./tasks/db');

const parseArgumentsIntoOptions = rawArgs => {
    const args = arg(
        {
            '--database': Boolean,
            '--db': '--database',
            '--authentication': Boolean,
            '--auth': '--authentication',
        },
        {
            argv: rawArgs.slice(2),
        }
    );

    return {
        action: args._[0],
        projectName: args._[1],
        createDB: args['--database'],
        setupAuth: args['--authentication']
    };
};

const promptCreateDB = async options => {
    const dbCreateAnswer = await inquirer.prompt([{
        name: 'createDB',
        type: 'confirm',
        message: 'Would you like to create a database? (Recommended)',
        default: true
    }]);

    return {
        ...options,
        createDB: dbCreateAnswer.createDB
    };
};

const promptSelectDB = async options => {
    const defaultDB = 'MySQL';
    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'database',
        message: 'Please choose which Database to use',
        choices: ['MySQL', 'PostgreSQL'],
        default: defaultDB,
    }]);

    return {
        ...options,
        database: answers.database
    };
};

const promptSelectAuthProvider = async options => {
    const defaultAuthProvider = 'Auth0';
    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'authProvider',
        message: 'Please choose which Auth Provider to use',
        choices: ['Auth0', 'Cognito'],
        default: defaultAuthProvider,
    }]);

    return {
        ...options,
        authProvider: answers.authProvider
    };
};

const promptAuth0Keys = async options => {
    const questions = [{
        name: 'authDomain',
        type: 'input',
        message: 'Please input your Auth0 Domain',
        default: ''
    }, {
        name: 'authClientID',
        type: 'input',
        message: 'Please input your Auth0 Client ID',
        default: ''
    }, {
        name: 'authAudience',
        type: 'input',
        message: 'Please input your Auth0 Audience',
        default: ''
    }];

    const answers = await inquirer.prompt(questions);

    return {
        ...options,
        ...answers
    };
};

const promptCognitoKeys = async options => {
    const questions = [{
        name: 'authPoolRegion',
        type: 'input',
        message: 'Please input your Cognito User Pool Region',
        default: ''
    }, {
        name: 'authPoolID',
        type: 'input',
        message: 'Please input your Cognito User Pool ID',
        default: ''
    }, {
        name: 'authClientID',
        type: 'input',
        message: 'Please input your Cognito User Pool Client ID',
        default: ''
    }];

    const answers = await inquirer.prompt(questions);

    return {
        ...options,
        ...answers
    };
};

const promptAuthOptions = async options => {
    options = await promptSelectAuthProvider(options);

    switch (options.authProvider) {
        case 'Auth0':
            options = await promptAuth0Keys(options);
            break;
        case 'Cognito':
            options = await promptCognitoKeys(options);
            break;
    }

    return options;
};

const promptSetupAuth = async options => {
    const answers = await inquirer.prompt([{
        name: 'setupAuth',
        type: 'confirm',
        message: 'Would you like to set up the authentication provider? (Recommended)',
        default: true
    }]);

    return {
        ...options,
        ...answers
    };
};

const promptSelectAccountAuthProvider = async options => {
    const defaultAuthProvider = 'Plaid';
    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'accountAuthProvider',
        message: 'Please choose which AccountAuth Provider to use',
        choices: ['Plaid'],
        default: defaultAuthProvider,
    }]);

    return {
        ...options,
        accountAuthProvider: answers.accountAuthProvider
    };
};

const promptPlaidKeys = async options => {
    const questions = [{
        name: 'accountAuthClientID',
        type: 'input',
        message: 'Please input your Plaid Client ID',
        default: ''
    }, {
        name: 'accountAuthSecret',
        type: 'input',
        message: 'Please input your Plaid Secret',
        default: ''
    }];

    const answers = await inquirer.prompt(questions);

    return {
        ...options,
        ...answers
    };
};

const promptAccountAuthOptions = async options => {
    options = await promptSelectAccountAuthProvider(options);

    switch (options.accountAuthProvider) {
        case 'Plaid':
            options = await promptPlaidKeys(options);
            break;
    }

    return options;
};

const promptSetupAccountAuth = async options => {
    const answers = await inquirer.prompt([{
        name: 'setupAccountAuth',
        type: 'confirm',
        message: 'Would you like to set up the account authentication provider? (Recommended)',
        default: true
    }]);

    return {
        ...options,
        ...answers
    };
};

const promptForMissingOptions = async options => {

    if (options.action === 'create') {

        if (!options.projectName) {
            logger.info('Please specify the project directory:');
            logger.info('    rize create <project-directory>');
            logger.info('For example:');
            logger.info('    rize create rize-app');
            process.exit(1);
        }

        if (fs.existsSync(options.projectName)) {
            logger.info(`The directory ${options.projectName} already exist.`);
            logger.info('Try using a new directory name.');
            process.exit(1);
        }

        if (options.createDB === undefined) {
            options = await promptCreateDB(options);
        }

        if (options.createDB) {
            options = await promptSelectDB(options);
        }

        if (options.setupAuth === undefined) {
            options = await promptSetupAuth(options);
        }

        if (options.setupAuth) {
            options = await promptAuthOptions(options);
        }

        if (options.setupAccountAuth === undefined) {
            options = await promptSetupAccountAuth(options);
        }

        if (options.setupAccountAuth) {
            options = await promptAccountAuthOptions(options);
        }

        const rizeQuestions = [{
            name: 'rizeProgramID',
            type: 'input',
            message: 'Please input your Rize Program ID',
            default: ''
        }, {
            name: 'rizeApiHmac',
            type: 'password',
            message: 'Please input your Rize API HMAC',
            default: ''
        }, {
            name: 'rmqHosts',
            type: 'input',
            message: 'Please input your Rize Message Queue host (comma-dilimited if more then one)',
            default: ''
        }, {
            name: 'rmqTopic',
            type: 'input',
            message: 'Please input your Rize Message Queue Topic',
            default: ''
        }, {
            name: 'rmqUsername',
            type: 'input',
            message: 'Please input your Rize Message Queue username',
            default: ''
        }, {
            name: 'rmqPassword',
            type: 'password',
            message: 'Please input your Rize Message Queue password',
            default: ''
        }];

        const rizeAnswers = await inquirer.prompt(rizeQuestions);

        options = {
            ...options,
            ...rizeAnswers
        };

        logger.info('');
        logger.info('In order to use the Rize SDK Github package, please input your Github credentials');

        const githubQuestions = [{
            name: 'githubUsername',
            type: 'input',
            message: 'Username',
            default: ''
        }, {
            name: 'githubPassword',
            type: 'password',
            message: 'Password (Personal Access Token)',
            default: ''
        }, {
            name: 'githubEmail',
            type: 'input',
            message: 'Email',
            default: ''
        }];

        const githubAnswers = await inquirer.prompt(githubQuestions);

        options = {
            ...options,
            ...githubAnswers
        };
    }

    return options;
};

const createProjectDirectory = (projectName) => {
    const dir = `./${projectName}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

const createEnv = async (options) => {
    const filePath = `./${options.projectName}/.env`;
    const projectName = options.projectName.replace(/[^a-zA-Z0-9 ]/g, '');
    let envFile = '';
    await fs.appendFile(filePath, '');

    const object = {
        NODE_ENV: 'development',
        API_HOST: `${projectName}-api`,
        API_PORT: 3000,
        SYSLOG_LEVEL: 'debug',
        DB_PLATFORM: options.createDB ? (options.database === 'MySQL' ? 'mysql' : 'pg') : '',
        DB_PORT: options.createDB ? (options.database === 'MySQL' ? '3306' : '5432') : '',
        DB_HOST: options.createDB ? `${projectName}-db-service` : '',
        DB_DATABASE: options.createDB ? projectName : '',
        DB_DEFAULT_SCHEMA: options.createDB ? (options.database === 'MySQL' ? projectName : 'core') : '',
        DB_USER: options.createDB ? 'root' : '',
        DB_PASSWORD: options.createDB ? 'password' : '',
        DATA_MIGRATIONS_HOST: options.createDB ? `${projectName}-migrations-service` : '',
        AUTH_PROVIDER: options.authProvider ? options.authProvider.toLowerCase() : '',
        AUTH_DOMAIN: options.authDomain || '',
        AUTH_CLIENT_ID: options.authClientID || '',
        AUTH_AUDIENCE: options.authAudience || '',
        AUTH_POOL_ID: options.authPoolID || '',
        AUTH_POOL_REGION: options.authPoolRegion || '',
        RIZE_ENV: 'sandbox',
        RIZE_PROGRAM_ID: options.rizeProgramID || '',
        RIZE_API_SECRET: options.rizeApiHmac || '',
        GITHUB_USERNAME: options.githubUsername || '',
        GITHUB_PASSWORD: options.githubPassword || '',
        GITHUB_EMAIL: options.githubEmail || '',
        RMQ_HOSTS: options.rmqHosts || '',
        RMQ_CLIENT_ID: projectName,
        RMQ_TOPIC: options.rmqTopic || '',
        RMQ_USERNAME: options.rmqUsername,
        RMQ_PASSWORD: options.rmqPassword,
        ACCOUNT_AUTH_PROVIDER: options.accountAuthProvider || '',
        ACCOUNT_AUTH_CLIENT_ID: options.accountAuthClientID || '',
        ACCOUNT_AUTH_SECRET: options.accountAuthSecret || '',
    };

    for (const key of Object.keys(object)) {
        envFile += `${key}=${object[key]}\n`;
    }

    await fs.writeFile(filePath, envFile);
};

const createDockerCompose = async (options) => {
    const projectName = options.projectName.replace(/[^a-zA-Z0-9 ]/g, '');

    const object = {
        version: '3',
    };

    if (options.createDB) {
        object.services = {};

        object.services.db = {
            container_name: '$DB_HOST',
            ports: ['$DB_PORT:$DB_PORT'],
            env_file: ['.env'],
            volumes: ['./db-data:/var/lib/postgresql/data']
        };

        object.services['data-migrations'] = {
            build: {
                context: './data-migrations',
                args: {
                    GITHUB_EMAIL: '${GITHUB_EMAIL}',
                    GITHUB_USERNAME: '${GITHUB_USERNAME}',
                    GITHUB_PASSWORD: '${GITHUB_PASSWORD}'
                }
            },
            image: `${projectName}/${projectName}-data-migrations:latest`,
            container_name: '$DATA_MIGRATIONS_HOST',
            depends_on: ['db'],
            volumes: [
                '/usr/src/data-migrations/node_modules',
                './data-migrations:/usr/src/data-migrations'
            ],
            env_file: ['.env']
        };

        if (options.database === 'MySQL') {
            object.services.db.image = 'mysql:5.6';
            object.services.db.command = '--default-authentication-plugin=mysql_native_password';
            object.services.db.environment = {
                MYSQL_DATABASE: '$DB_DATABASE',
                MYSQL_PASSWORD: '$DB_PASSWORD',
                MYSQL_ROOT_PASSWORD: '$DB_PASSWORD'
            };
        } else {
            object.services.db.image = 'postgres:12.2-alpine';
            object.services.db.environment = {
                POSTGRES_DB: '$DB_DATABASE',
                POSTGRES_USER: '$DB_USER',
                POSTGRES_PASSWORD: '$DB_PASSWORD',
                DB_DEFAULT_SCHEMA: '$DB_DEFAULT_SCHEMA'
            };
        }
    }

    if (!object.services) {
        object.services = {};
    }

    object.services.api = {
        build: {
            context: './api',
            args: {
                GITHUB_EMAIL: '${GITHUB_EMAIL}',
                GITHUB_USERNAME: '${GITHUB_USERNAME}',
                GITHUB_PASSWORD: '${GITHUB_PASSWORD}'
            }
        },
        image: `${projectName}/${projectName}-api:latest`,
        container_name: '${API_HOST}',
        volumes: [
            '/usr/src/api/node_modules',
            './api:/usr/src/api'
        ],
        env_file: ['.env']
    };

    if (options.createDB) {
        object.services.api.depends_on = ['data-migrations'];
    }

    object.services.webserver = {
        build: './webserver',
        image: `${projectName}/${projectName}-webserver:latest`,
        container_name: `${projectName}-webserver`,
        depends_on: ['api'],
        env_file: ['.env'],
        ports: ['80:80', '443:443']
    };

    if (object.services) {
        await writeYamlFile(`./${options.projectName}/docker-compose.yml`, object, { indent: 4 });
    }
};

exports.start = async args => {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    logger.info('Please wait...');

    createProjectDirectory(options.projectName);

    const promises = [
        createEnv(options),
        createDockerCompose(options),
        api.generateApiFiles(options)
    ];

    if (options.createDB) {
        promises.push(
            db.generateDBFiles(options)
        );
    }

    await Promise.all(promises);

    logger.info(`Done! Start the app by running 'docker-compose up' inside the ${options.projectName} directory`);
};
