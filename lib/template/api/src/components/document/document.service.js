/**
 * This is the service for document features
 */
class DocumentService {
    /**
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(rizeProvider) {
        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    async getDocuments (customerUid) {
        return await this._rizeProvider.document.getList({ customer_uid: [customerUid] });
    }

    async viewDocument (documentUid) {
        return await this._rizeProvider.document.viewBase64(documentUid);
    }
}

module.exports = DocumentService;
