const Rize = require('@rizefinance/rize-js');
const config = require('../config/config');

class RizeClient {
    static getInstance() {
        if (!RizeClient.instance) {
            this.instance = new Rize(config.rize.programId, config.rize.hmac, { environment: config.rize.env });
        }
        return this.instance;
    }
}

module.exports = RizeClient;