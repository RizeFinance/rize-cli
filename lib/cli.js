'use strict';

const arg = require('arg');
const inquirer = require('inquirer');

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
        createDB: args['--database']
    };
};

const promptSelectDB = async options => {
    const defaultDB = 'MySQL';
    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'database',
        message: 'Please choose which Database to use',
        choices: ['MySQL', 'PosgreSQL'],
        default: defaultDB,
    }]);

    return {
        ...options,
        database: answers.database
    };
};

const promptForMissingOptions = async options => {

    if (options.action === 'create') {
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

exports.start = async args => {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    // eslint-disable-next-line
    console.log(options);
};
