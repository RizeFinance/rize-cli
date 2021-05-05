const fs = require('fs-extra');
const path = require('path');
const apiPackage = require('../template/api/package.json');
const { RIZE_SDK_VERSION } = require('../constants');

const getApiDirectory = (options) => `./${options.projectName}/api`;
const getWebServerDirectory = (options) => `./${options.projectName}/webserver`;

const createApiPackageJSON = async (options) => {
    apiPackage.name = `${options.projectName}-api`;
    apiPackage.dependencies['@rizefinance/rize-js'] = RIZE_SDK_VERSION;

    const dir = getApiDirectory(options);
    const filePath = `${dir}/package.json`;
    await fs.appendFile(filePath, '');
    await fs.writeFile(filePath, JSON.stringify(apiPackage, null, 2));
};

const copyApiFiles = async (options) => {
    const apiSourcePath = path.join(__dirname, '../template/api');
    const apiDestinationPath = getApiDirectory(options);
    
    const apiNodeModulesPath = path.join(apiSourcePath, './node_modules');

    await fs.copy(apiSourcePath, apiDestinationPath, {
        overwrite: false,
        errorOnExist: true,
        filter: (src) => {
            if (src.includes(apiNodeModulesPath)) {
                return false;
            }

            return true;
        }
    });
};

const copyWebserverFiles = async (options) => {
    const webserverSourcePath = path.join(__dirname, '../template/webserver');
    const webserverDestinationPath = getWebServerDirectory(options);

    const webserverNodeModulesPath = path.join(webserverSourcePath, './node_modules');

    await fs.copy(webserverSourcePath, webserverDestinationPath, {
        overwrite: false,
        errorOnExist: true,
        filter: (src) => {
            if (src.includes(webserverNodeModulesPath)) {
                return false;
            }

            return true;
        }
    });
};

const generateApiFiles = async (options) => {
    await copyApiFiles(options);
    await copyWebserverFiles(options);
    await createApiPackageJSON(options);
};

module.exports = {
    generateApiFiles
};
