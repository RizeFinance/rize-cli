const fs = require('fs-extra');
const path = require('path');
const dataMigrationsPackage = require('../template/data-migrations/package.json');
const { RIZE_SDK_VERSION } = require('../constants');

const getDBMigrationsDirectory = (options) => `./${options.projectName}/data-migrations`;

const createDBMigrationsPackageJSON = async (options) => {
    dataMigrationsPackage.name = `${options.projectName}-data-migrations`;
    dataMigrationsPackage.dependencies['@rizefinance/rize-js'] = RIZE_SDK_VERSION;

    if (options.database === 'PostgreSQL') {
        dataMigrationsPackage.dependencies.pg = '^8.2.1';
    } else {
        dataMigrationsPackage.dependencies.mysql = '^2.18.1';
    }

    const dir = getDBMigrationsDirectory(options);
    const filePath = `${dir}/package.json`;
    await fs.appendFile(filePath, '');
    await fs.writeFile(filePath, JSON.stringify(dataMigrationsPackage, null, 2));
};

const copyMigrationFiles = async (options) => {
    const sourcePath = path.join(__dirname, '../template/data-migrations');
    const destinationPath = getDBMigrationsDirectory(options);

    const nodeModulesPath = path.join(sourcePath, './node_modules');

    return await fs.copy(sourcePath, destinationPath, {
        overwrite: false,
        errorOnExist: true,
        filter: (src) => {
            if (src.includes(nodeModulesPath)) {
                return false;
            }

            return true;
        }
    });
};

const generateDBFiles = async (options) => {
    await copyMigrationFiles(options);
    await createDBMigrationsPackageJSON(options);
};

module.exports = {
    generateDBFiles
};
