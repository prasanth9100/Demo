import { LightningElement, api, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getOpportunityPricebook from '@salesforce/apex/BrowseCatalogController.getOpportunityPricebook';
import { SCREENS } from './browseCatalogContainerConstants';

export default class BrowseCatalogContainer extends LightningElement {

    @track screen = null;
    @track isLoading = true;
    @track pricebookSelected = false;

    catalogId;
    catalogName;

    @track pricebookId;
    @track pricebookName = '';

    @track showPricebookSelector = null;

    selectedProducts = [];
    _recordId;

    /* ================= RECORD ================= */
    @api
    set recordId(value){
        this._recordId = value;
        if(value){
            this.loadPricebook();
        }
    }

    get recordId(){
        return this._recordId;
    }

    /* ================= LOAD ================= */
    async loadPricebook(){
        this.isLoading = true;

        try{
            const data = await getOpportunityPricebook({
                opportunityId: this.recordId
            });

            if(data?.pricebookId){
                this.pricebookId = data.pricebookId;
                this.pricebookName = data.pricebookName;
                this.showPricebookSelector = false;
                this.screen = SCREENS.CATALOG;
            }else{
                this.showPricebookSelector = true;
                this.screen = null;
            }

        }catch(e){
            this.showPricebookSelector = true;
            this.screen = null;
        }

        this.isLoading = false;
    }

    /* ================= KEEP YOUR MODAL CSS ================= */
    renderedCallback() {

        if (this._modalStyled) return;

        const style = document.createElement('style');

        style.innerText = `
            .slds-modal__container {
                width: 90vw !important;
                max-width: 90vw !important;
                height: max-content !important;
                display: flex;
                flex-direction: column;
            }

            .slds-modal__content {
                flex: 1;
                overflow-y: hidden !important;
            }
        `;

        document.body.appendChild(style);
        this._modalStyled = true;
    }

    /* ================= HEADER ================= */
    get headerTitle() {
        if (this.showCatalogs) return 'All Catalogs';
        if (this.showProducts) return 'Browse Products';
        if (this.showReview) return 'Review Products';
        return 'Select Pricebook';
    }

    /* ================= FOOTER ================= */
    get leftLabel() {
        if (this.showPricebookSelector) return 'Cancel';
        if (this.showCatalogs) return 'Cancel';
        return 'Back';
    }

    get rightLabel() {
        if (this.showCatalogs) return 'Next';
        if (this.showPricebookSelector) return 'Save';
        if (this.showProducts) return 'Review Products';
        if (this.showReview) return 'Save';
        return '';
    }

    get disableRight() {

    if (this.showPricebookSelector) {
        return !this.pricebookSelected;
    }

    if (this.showCatalogs) {
        return !this.catalogId;
    }

    if (this.showProducts) {
        return this.selectedProducts.length === 0;
    }

    if (this.showReview) {
        return this.selectedProducts.length === 0;
    }

    return false;
}

    /* ================= BUTTON ACTIONS ================= */
    handleProductChange(event){
    this.selectedProducts = event.detail.products;
}
    // handleLeft() {

    //     if (this.showCatalogs) {
    //         this.handleClose();
    //     }
    //     else if (this.showProducts) {
    //         this.handleBackCatalog();
    //     }
    //     else if (this.showReview) {
    //         this.handleBack();
    //     }
    // }
    handlePricebookChange(event){
    this.pricebookSelected = !!event.detail.selected;
}
    handleLeft() {

    if (this.showPricebookSelector) {
        this.handleClose();
    }

    else if (this.showCatalogs) {
        this.handleClose();
    }

    else if (this.showProducts) {
        this.handleBackCatalog();
    }

    else if (this.showReview) {
        this.handleBack();
    }
}

//     handleRight() {

//     if (this.showCatalogs) {
//         this.screen = SCREENS.PRODUCTS;   // ✅ ADD THIS
//     }

//     else if (this.showProducts) {
//         this.template.querySelector('c-product-browser')?.handleReview();
//     }

//     else if (this.showReview) {
//         this.template.querySelector('c-review-products')?.handleSave();
//     }
// }
handleRight() {

    console.log('RIGHT BUTTON CLICKED');

    if (this.showPricebookSelector) {

        const cmp = this.template.querySelector('[data-id="pricebook"]');

        console.log('FOUND CHILD:', cmp);

        if (!cmp) {
            console.error('❌ pricebook component not found');
            return;
        }

        cmp.save();   // 🔥 THIS WILL WORK NOW
        return;
    }

    if (this.showCatalogs) {
        // 🔥 TRIGGER EVENT FROM CHILD
        const cmp = this.template.querySelector('c-catalog-list');
        cmp?.handleNext();
        return;
    }

    else if (this.showProducts) {
        this.template.querySelector('c-product-browser')?.handleReview();
    }

    else if (this.showReview) {
        this.template.querySelector('c-review-products')?.handleSave();
    }
}

    /* ================= SCREEN FLAGS ================= */
    get showCatalogs(){ return this.screen === SCREENS.CATALOG; }
    get showProducts(){ return this.screen === SCREENS.PRODUCTS; }
    get showReview(){ return this.screen === SCREENS.REVIEW; }
    get showMainFlow(){ return this.showPricebookSelector === false; }

    /* ================= EVENTS ================= */
    handlePricebookSelect(event){
        this.pricebookId = event.detail.pricebookId;
        this.pricebookName = event.detail.pricebookName;
        this.showPricebookSelector = false;
        this.screen = SCREENS.CATALOG;
    }
    handlePricebookChange(event){
    this.pricebookSelected = !!event.detail.selected;
}

    handleCatalogSelect(event){
        this.catalogId = event.detail.catalogId;
        this.catalogName = event.detail.name;
        // this.screen = SCREENS.PRODUCTS;
    }
    handleCatalogNext(event){
    this.catalogId = event.detail.catalogId;
    this.catalogName = event.detail.name;
    this.screen = SCREENS.PRODUCTS; 
}

    handleBackCatalog(){
        this.screen = SCREENS.CATALOG;
    }

    handleReview(event){
        this.selectedProducts = event.detail.products;
        this.screen = SCREENS.REVIEW;
    }

    handleBack(){
        this.screen = SCREENS.PRODUCTS;
    }

    handleClose(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}