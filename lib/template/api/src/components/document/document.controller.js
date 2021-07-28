/**
 * This is the controller for document features
 */
class DocumentController {
    /**
     * @param {import('./compliance-workflow.service')} documentService
     * @param {import('../customer/customer.service')} customerService
     */
    constructor(documentService, customerService) {
        /** @protected */
        this._documentService = documentService;

        /** @protected */
        this._customerService = customerService;
    }

    async getDocuments(customerExternalUid) {
        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);
        const documents = await this._documentService.getDocuments(customer.uid);
        return documents;
    }

    async viewDocument(documentUid) {
        const documentView = await this._documentService.viewDocument(documentUid);

        const data = {
            uid: documentUid,
            extension: 'pdf',
            base_64: documentView
        };

        return data;
    }
}

module.exports = DocumentController;
