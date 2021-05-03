const _ = require('lodash');

/**
 * @param {any} sourceObject 
 * @param {{to: string, from: string}[]} keys 
 * @returns 
 */
const mapObject = (sourceObject, keys) => {
    const newObject = !sourceObject ? undefined : {};

    for (let key of keys) {
        if (_.has(sourceObject, key.from)) {
            _.set(newObject, key.to, _.get(sourceObject, key.from));
        }
    }

    return newObject;
};

module.exports = mapObject;