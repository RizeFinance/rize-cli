const fs = require('fs-extra');
const path = require('path');
const apiPackage = require('../template/api/package.json');

const getApiDirectory = (options) => `./${options.projectName}/api`;
const getWebServerDirectory = (options) => `./${options.projectName}/webserver`;

const createApiPackageJSON = async (options) => {
    apiPackage.name = options.projectName;
    const dir = getApiDirectory(options);
    const filePath = `${dir}/package.json`;
    await fs.appendFile(filePath, '');
    await fs.writeFile(filePath, JSON.stringify(apiPackage, null, 2));
};

const copyApiFiles = async (options) => {
    const apiSourcePath = path.join(__dirname, '../template/api');
    const apiDestinationPath = getApiDirectory(options);
    const webserverSourcePath = path.join(__dirname, '../template/webserver');
    const webserverDestinationPath = getWebServerDirectory(options);
    await fs.copy(apiSourcePath, apiDestinationPath, { overwrite: false, errorOnExist: true });
    await fs.copy(webserverSourcePath, webserverDestinationPath, { overwrite: false, errorOnExist: true });
    await createApiPackageJSON(options);
};

module.exports = {
    copyApiFiles
};
