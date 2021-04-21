const fs = require('fs-extra');
const path = require('path');

const getDBMigrationsDirectory = (options) => `./${options.projectName}/data-migrations`;

const createDBMigrationsDirectory = (options) => {
    const dir = getDBMigrationsDirectory(options);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

const createDBMigrationsPackageJSON = async (options) => {
    const dir = getDBMigrationsDirectory(options);
    const filePath = `${dir}/package.json`;

    await fs.appendFile(filePath, '');

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
            '@rizefinance/rize-js': '^0.0.2',
        }
    };

    if(options.database === 'PostgreSQL') {
        object.dependencies.pg = '^8.2.1';
    } else {
        object.dependencies.mysql = '^2.18.1';
    }

    await fs.writeFile(filePath, JSON.stringify(object, null, 2));
};

const copyMigrationFile = async (options) => {
    const sourcePath = path.join(__dirname, '../template/data-migrations');
    const destinationPath = getDBMigrationsDirectory(options);

    return await fs.copy(sourcePath, destinationPath, { overwrite: false, errorOnExist: true });
};

const initiateDBMigrations = async (options) => {
    createDBMigrationsDirectory(options);

    await Promise.all([
        copyMigrationFile(options),
        createDBMigrationsPackageJSON(options)
    ]);
};

module.exports = {
    initiateDBMigrations
};
