'use strict';

const arg = require('arg');
const inquirer = require('inquirer');
const fs = require('fs');
const logger = require('../utils/logger');
const db = require('./tasks/db');

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


exports.start = async args => {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    logger.info(options);

    createProjectDirectory(options.projectName);
    
    if (options.createDB) {
        db.initiateDBMigrations(options);
    }
};
