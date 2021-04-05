const fs = require('fs');
const { ncp } = require('ncp');
const { promisify } = require('util');
const path = require('path');

const appendFile = promisify(fs.appendFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const getDBMigrationsDirectory = (options) => `./${options.projectName}/data-migrations`;

const createDBMigrationsDirectory = async (options) => {
    const dir = getDBMigrationsDirectory(options);

    if (!fs.existsSync(dir)) {
        await mkdir(dir);
    }
};

const createDBMigrationsPackageJSON = async (options) => {
    const dir = getDBMigrationsDirectory(options);
    const filePath = `${dir}/package.json`;

    await appendFile(filePath, '');

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

    await writeFile(filePath, JSON.stringify(object, null, 2));
};

const copyMigrationFile = (options) => {
    const sourcePath = path.join(__dirname, '../template/data-migrations');
    const destinationPath = getDBMigrationsDirectory(options);
    ncp.limit = 16;

    ncp(sourcePath, destinationPath, (err) => {
        if (err) {
            console.error(err);
        }
    });
};

const initiateDBMigrations = (options) => {
    createDBMigrationsDirectory(options);
    copyMigrationFile(options);
    createDBMigrationsPackageJSON(options);
};

module.exports = {
    initiateDBMigrations
};