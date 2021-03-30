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
        choices: ['MySQL', 'PostgreSQL'],
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

        if(!options.projectName) {
            options = await promptProjectName(options);
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

const createPackageJSON = (options) => {
    const dir = './data-migration';
    const filePath = `${dir}/package.json`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.appendFile(filePath, '', function (err) {
        if(err) throw err;

        const object = {
            'name': `${options.projectName}-migrations`,
            'version': '1.0.0',
            'description': 'Data migrations',
            'scripts': {
                'db:migrate': 'knex migrate:latest',
                'db:rollback': 'knex migrate:rollback',
                'db:migrate-list': 'knex migrate:list',
                'db:seed': 'knex seed:run'
            },
            'dependencies': {
                'dotenv': '^8.2.0',
                'knex': '^0.21.4',
            }
        };

        if(options.database === 'PostgreSQL') {
            object.dependencies.pg = '^8.2.1';
        } else {
            object.dependencies.mysql = '^2.18.1';
        }

        fs.writeFileSync(filePath, JSON.stringify(object, null, 2));
    });
};

exports.start = async args => {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    // eslint-disable-next-line
    console.log(options);
    createPackageJSON(options);
};
