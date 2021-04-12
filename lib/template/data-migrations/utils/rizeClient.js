const Rize = require('@rizefinance/rize-js');
const config = require('../config/config');

class RizeClient {
    static getInstance() {
        if (!RizeClient.instance) {
            this.instance = new Rize(config.rize.programId, config.rize.hmac);
        }

        return this.instance;
    }
}

module.exports = RizeClient;