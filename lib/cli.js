'use strict';

const arg = require('arg');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const writeYamlFile = require('write-yaml-file');
const logger = require('../utils/logger');
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
    };

    for (const key of Object.keys(object)) {
        envFile += `${key}=${object[key]}\n`;
    }

    await fs.writeFile(filePath, envFile);
};

const createDockerCompose = async (options) => {
    const object = {
        version: '3',
    };

    if (options.createDB) {
        object.services = {};

        object.services.db = {
            container_name: '$DB_HOST',
            ports: ['$DB_PORT:$DB_PORT'],
            env_file: ['.env'],
        },

        object.services['data-migrations'] =  {
            build: './data-migrations',
            image: 'rizefinance/rizefinance-data-migrations:latest',
            container_name: '$DATA_MIGRATIONS_HOST',
            depends_on: ['db'],
            volumes: ['usr/src/data-migrations/node_modules', './data-migrations:/usr/src/data-migrations'],
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

    if (object.services) {
        await writeYamlFile(`./${options.projectName}/docker-compose.yml`, object, { indent: 4 });
    }
};

exports.start = async args => {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    logger.info(options);

    createProjectDirectory(options.projectName);
    createEnv(options);
    createDockerCompose(options);

    if (options.createDB) {
        db.initiateDBMigrations(options);
    }
};
