'use strict';

const arg = require('arg');
const inquirer = require('inquirer');
const fs = require('fs');

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
        choices: ['MySQL', 'PosgreSQL'],
        default: defaultDB,
    }]);

    return {
        ...options,
        database: answers.database
    };
};

const promptProjectName = async (options) => {
    const answer = await inquirer.prompt([{
        name: 'projectName',
        type: 'input',
        message: 'What is the project name?',
        default: ''
    }]);
    
    return {
        ...options,
        projectName: answer.projectName
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

        if(!options.projectName) {
            options = promptProjectName(options);
        }
    }

    return options;
};

const createPackageJSON = (options) => {
    let stream = fs.createWriteStream('../data-migration/package.json');

    stream.once('open', function() {
        stream.write('{\n');
        stream.write(`  "name": "${options.projectName}-migrations",\n`);
        stream.write('  "version": "1.0.0",\n');
        stream.write('  "description": "Data migrations",\n');
        stream.write('  "scripts": {,\n');
        stream.write('    "db:migrate": "knex migrate:latest",\n');
        stream.write('    "db:rollback": "knex migrate:rollback",\n');
        stream.write('    "db:migrate-list": "knex migrate:list",\n');
        stream.write('    "db:seed": "knex seed:run"\n');
        stream.write('  },\n');
        stream.write('  "dependencies": {\n');
        stream.write('    "dotenv": "^8.2.0",\n');
        stream.write('    "knex": "^0.21.4",\n');
        stream.write(`    ${options.dbPlatform === 'Postgre' ? '"pg": "^8.2.1"' : '"mysql": "2.18.1"'}\n`);  
        stream.write('  }\n');
        stream.write('}\n');
        stream.end();
    });
};

exports.start = async args => {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    // eslint-disable-next-line
    console.log(options);
    createPackageJSON(options);
};
