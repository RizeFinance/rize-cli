const { has, set, get } = require('lodash');

/**
 * @param {any} sourceObject 
 * @param {{to: string, from: string, type?: string}[]} keys 
 * @returns 
 */
const mapObject = (sourceObject, keys) => {
    const newObject = !sourceObject ? undefined : {};

    for (let key of keys) {
        if (has(sourceObject, key.from)) {
            const newValue = get(sourceObject, key.from);
            if (get(key, 'type', null) === 'json') {
                set(newObject, key.to, JSON.stringify(newValue));
            } else {
                set(newObject, key.to, newValue);
            }
        }
    }

    return newObject;
};

module.exports = mapObject;