'use strict';

const arg = require('arg');
const inquirer = require('inquirer');
const fs = require('fs');
const writeYamlFile = require('write-yaml-file');
const { promisify } = require('util');
const logger = require('../utils/logger');
const db = require('./tasks/db');

const appendFile = promisify(fs.appendFile);
const writeFile = promisify(fs.writeFile);

const parseArgumentsIntoOptions = rawArgs => {
    const args = arg(
        {
            '--database': Boolean,
            '--db': '--database',
        },
        {
            argv: rawArgs.slice(2),
        }
    );

    return {
        action: args._[0],
        projectName: args._[1],
        createDB: args['--database']
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

const promptForMissingOptions = async options => {

    if (options.action === 'create') {

        if(!options.projectName) {
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
            const dbCreateAnswer = await inquirer.prompt([{
                name: 'isCreateDB',
                type: 'confirm',
                message: 'Would you like to create a database?',
                default: true
            }]);
            options.createDB = dbCreateAnswer.isCreateDB;
        }

        if (options.createDB) {
            options = await promptSelectDB(options);
        }
    }

    return options;
};

const createProjectDirectory = (projectName) => {
    const dir = `./${projectName}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
};

const createEnv = async (options) => {
    const filePath = `./${options.projectName}/.env`;
    let envFile = '';
    await appendFile(filePath, '');

    const object = {
        NODE_ENV: 'development',
        API_HOST: `${options.projectName}-api`,
        API_PORT: 3000,
        DB_PLATFORM: `${options.database === 'MySQL' ? 'mysql' : 'pg'}`,
        DB_PORT: `${options.database === 'MySQL' ? 3306 : 5432}`,
        DB_HOST: `${options.projectName}-db-service`,
        DB_DATABASE: `${options.projectName}`,
        DB_DEFAULT_SCHEMA: `${options.database === 'MySQL' ? options.projectName : 'core'}`,
        DB_USER: 'root',
        DB_PASSWORD: 'password',
        DATA_MIGRATIONS_HOST: `${options.projectName}-migration-service`
    };
    
    for (const key of Object.keys(object)) {
        envFile += `${key}=${object[key]}\n`
    }
    
    await writeFile(filePath, envFile);
};

const createDockerCompose = async (options) => {
    const object = {
        version: '3',
        services: {
            db: {
                container_name: '$DB_HOST',
                ports: ['$DB_PORT:$DB_PORT'],
                env_file: ['.env'],
            },
            'data-migrations': {
                build: './data-migrations',
                image: 'rizefinance/rizefinance-data-migrations:latest',
                container_name: '$DATA_MIGRATIONS_HOST',
                depends_on: ['db'],
                volumes: ['usr/src/data-migrations/node_modules', './data-migrations:/usr/src/data-migrations'],
                env_file: ['.env']
            }
        }
    };

    if(options.database === 'MySQL') {
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

    await writeYamlFile(`./${options.projectName}/docker-compose.yml`, object, { indent: 4 });
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
