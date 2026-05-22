import { LightningElement, api, track } from 'lwc';

export default class ProductBrowser extends LightningElement {

    @api catalogId;
    @api pricebookId;
    @api pricebookName;
    @api catalogName;
    @api opportunityId;

    @track categoryId = null;
    @track searchKey  = '';
    @api  selectedProducts = [];

    @track showPopup       = false;
    @track showConfigurator = false;
    @track selectedProduct = null;

    /* ================= FILTER STATE ================= */
    @track showFilter        = false;
    @track filterQualified   = false;
    @track filterDisqualified = false;
    @track filterApplied     = null;

    /* ================= SORT STATE ================= */
    @track sortOrder = null;

    /* ================= FILTER ================= */
    toggleFilter()          { this.showFilter = !this.showFilter; }
    handleFilterQualified(e)   { this.filterQualified    = e.target.checked; }
    handleFilterDisqualified(e){ this.filterDisqualified = e.target.checked; }

    clearFilter() {
        this.filterQualified    = false;
        this.filterDisqualified = false;
        this.filterApplied      = null;
        this.showFilter         = false;
    }

    applyFilter() {
        if (this.filterQualified && !this.filterDisqualified)       this.filterApplied = true;
        else if (!this.filterQualified && this.filterDisqualified)  this.filterApplied = false;
        else                                                         this.filterApplied = null;
        this.showFilter = false;
    }

    get filterBtnClass() {
        return this.filterApplied !== null ? 'filter-active' : '';
    }

    /* ================= SORT ================= */
    toggleSort() {
        this.sortOrder = (!this.sortOrder || this.sortOrder === 'desc') ? 'asc' : 'desc';
    }

    get sortIcon()  {
        return this.sortOrder === 'desc' ? 'utility:arrowdown' : 'utility:arrowup';
    }

    get sortTitle() {
        if (this.sortOrder === 'asc')  return 'Sort: A -> Z (click to reverse)';
        if (this.sortOrder === 'desc') return 'Sort: Z -> A (click to reset)';
        return 'Sort by name';
    }

    /* =================================================================
       CORE MERGE HELPER
       -----------------------------------------------------------------
       Plain single products  - match on productId alone, accumulate qty.

       Bundle children        - match on productId + parentBundleId.
         bundleGroupId is regenerated every Add click (Date.now()), so
         we CANNOT use it for dedup. parentBundleId is stable (the
         clicked bundle Product2 Id) and uniquely identifies the family.
         On match: add qty, and accumulate minQty so the review screen
         group-scale logic (qty / minQty) stays accurate.
    ================================================================= */
    _mergeItem(item) {
        // Plain single product
        if (!item.parentBundleId) {
            const existingIdx = this.selectedProducts.findIndex(
                p => p.productId === item.productId && !p.parentBundleId
            );
            if (existingIdx >= 0) {
                this.selectedProducts = this.selectedProducts.map((p, i) =>
                    i === existingIdx
                        ? { ...p, quantity: p.quantity + item.quantity }
                        : p
                );
            } else {
                this.selectedProducts = [...this.selectedProducts, { ...item }];
            }
            return;
        }

        // Bundle child - match on productId + parentBundleId (stable key).
        const existingIdx = this.selectedProducts.findIndex(
            p => p.productId === item.productId && p.parentBundleId === item.parentBundleId
        );
        if (existingIdx >= 0) {
            this.selectedProducts = this.selectedProducts.map((p, i) => {
                if (i !== existingIdx) return p;
                return {
                    ...p,
                    quantity      : p.quantity + item.quantity,
                    minQty        : p.minQty + item.minQty,
                    // Always refresh these from the incoming item so they are never stale
                    bundleName    : item.bundleName    || p.bundleName,
                    subBundleId   : item.subBundleId   !== undefined ? item.subBundleId   : p.subBundleId,
                    subBundleName : item.subBundleName !== undefined ? item.subBundleName : p.subBundleName
                };
            });
        } else {
            this.selectedProducts = [...this.selectedProducts, { ...item }];
        }
    }

    /* =================================================================
       ADD PRODUCT  (Add button on productList)
       -----------------------------------------------------------------
       productList.js always fires an ARRAY now:
         * Bundle clicked  -> array of ONLY leaf single products (no bundle parent row)
         * Single product  -> array with one plain product object

       We iterate and merge each item. The bundle's name is carried
       in item.bundleName for visual grouping in reviewProducts.
    ================================================================= */
    handleAdd(event) {
        const payload = event.detail.product;
        const items = Array.isArray(payload) ? payload : [payload];
        items.forEach(item => this._mergeItem(item));
        this.notifyParent();
    }

    /* =================================================================
       CONFIGURATOR SAVE  (Gear icon -> configure -> Save button)
       -----------------------------------------------------------------
       productConfigurator fires 'configsave'.
       event.detail.items is already a flat array.
       We filter out the bundle parent row and only keep leaf items
       (isChild: true or items where bundleItems was empty).
       REPLACE logic: remove any previously selected rows for this bundle.
    ================================================================= */
    handleConfigSave(event) {
        const { items } = event.detail;
        if (!items || items.length === 0) {
            this.closeConfigurator();
            return;
        }

        const parentItem = items[0]; // first item is always the bundle parent row
        const bundleName = parentItem.name;
        const isBundle   = items.some(item => item.isChild);

        // -- REMOVE old rows for this product (replace-on-reconfigure) --
        // Covers: plain product row, bundle parent row, all bundle child rows
        this.selectedProducts = this.selectedProducts.filter(p => {
            if (p.productId      === parentItem.productId) return false; // plain or bundle parent
            if (p.parentBundleId === parentItem.productId) return false; // bundle children
            return true;
        });

        if (!isBundle) {
            // -- Plain single product: push parent row directly (configured qty) --
            this.selectedProducts = [
                ...this.selectedProducts,
                {
                    ...parentItem,
                    isChild        : false,
                    parentBundleId : null,
                    bundleGroupId  : null,
                    bundleName     : null
                }
            ];
        } else {
            // -- Bundle: push only leaf children (isChild:true), stamp stable keys --
            // subBundleId/subBundleName already set by productConfigurator for nested bundles
            const leafItems = items.filter(item => item.isChild);
            leafItems.forEach(item => {
                this.selectedProducts = [
                    ...this.selectedProducts,
                    {
                        ...item,
                        bundleGroupId : parentItem.productId, // stable key
                        bundleName    : bundleName,
                        subBundleId   : item.subBundleId   || null,
                        subBundleName : item.subBundleName || null
                    }
                ];
            });
        }

        this.notifyParent();
        this.closeConfigurator();
    }

    /* ================= CATEGORY ================= */
    handleCategory(e) {
        this.categoryId = e.detail.categoryId;
    }

    /* ================= SEARCH ================= */
    handleSearch(e) {
        this.searchKey = e.detail.value;
    }

    /* ================= POPUP ================= */
    get isPopupDisabled() { return this.selectedProducts.length === 0; }

    get popupLabel() {
        const count = this.selectedProducts.length;
        return count > 0
            ? `New Opportunity Line Items (${count})`
            : 'New Opportunity Line Items';
    }

    openPopup() {
        if (this.selectedProducts.length === 0) return;
        this.showPopup = true;
    }

    closePopup() { this.showPopup = false; }

    removePopupItem(e) {
        const id = e.currentTarget.dataset.id;
        // Always remove only the single clicked item -- never cascades to siblings
        this.selectedProducts = this.selectedProducts.filter(p => p.productId !== id);
        this.notifyParent();
    }

    /* ================= CONFIGURATOR ================= */
    handleConfigure(e) {
        this.selectedProduct  = e.detail.product;
        this.showConfigurator = true;
    }

    closeConfigurator() {
        this.showConfigurator = false;
        this.selectedProduct  = null;
    }

    notifyParent() {
        this.dispatchEvent(new CustomEvent('productchange', {
            detail: { products: this.selectedProducts.map(p => ({ ...p })) }
        }));
    }

    /* ================= NAVIGATION ================= */
    handleBackCatalog() {
        this.dispatchEvent(new CustomEvent('backcatalog'));
    }

    @api
    handleReview() {
        this.dispatchEvent(new CustomEvent('review', {
            detail: { products: this.selectedProducts }
        }));
    }

    get disableReview() {
        return this.selectedProducts.length === 0;
    }
}