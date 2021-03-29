'use strict';

const arg = require('arg');
const inquirer = require('inquirer');

exports.start = async (argv) => {

    const options = {
        createDatabase: false
    };

    let cliParams;
    try {
        cliParams = arg({
            '--database': Boolean,
            '--db': '--database'
        }, { argv });
    } catch (ex) {

        console.error(ex.message);
    }

    const selectDbPlatform = async () => {
        const dbPlatformAnswer = await inquirer.prompt([{
            name: 'dbPlatform',
            type: 'list',
            message: 'Please choose which database to use',
            choices: ['Postgre', 'MySQL']
        }]);

        options.databasePlatform = dbPlatformAnswer.dbPlatform;
        if (options.databasePlatform) {
            options.createDatabase = true;
        }
    };

    if (cliParams['--database']) {
        await selectDbPlatform();
    }
    else if (cliParams._.indexOf('create') > -1) {
        const dbCreateAnswer = await inquirer.prompt([{
            name: 'isCreateDB',
            type: 'confirm',
            message: 'Would you like to create a database?',
            default: false
        }]);

        if (dbCreateAnswer.isCreateDB) {
            await selectDbPlatform();
        }
    }

    console.log(options);
};
