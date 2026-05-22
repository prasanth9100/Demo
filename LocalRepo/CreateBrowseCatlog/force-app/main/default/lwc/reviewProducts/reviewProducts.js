import { LightningElement, api, track } from 'lwc';
import saveProducts from '@salesforce/apex/BrowseCatalogController.saveProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { RefreshEvent } from 'lightning/refresh';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';

export default class ReviewProducts extends LightningElement {

    @api recordId;
    @track _products     = [];
    @track errorProductIds = [];
    @track isSaving      = false;

    // Track which bundle groups are expanded (show children)
    @track expandedGroups = {};

    /* ================= PRODUCTS SETTER ================= */
    @api
    get products() { return this._products; }
    set products(val) {
        this._products = val ? val.map(p => ({
            productId      : p.productId,
            name           : p.name,
            price          : p.price      || 0,
            quantity       : p.quantity   || 1,
            displayUrl     : p.displayUrl || null,
            isChild        : p.isChild        || false,
            parentBundleId : p.parentBundleId || null,
            bundleGroupId  : p.bundleGroupId  || null,
            bundleName     : p.bundleName     || null,
            subBundleId    : p.subBundleId    || null,
            subBundleName  : p.subBundleName  || null,
            minQty         : p.minQty         || 1,
            _individualQty : p._individualQty || false
        })) : [];
    }

    /* ================= INCREASE ================= */
    increase(event) {
        const id  = event.currentTarget.dataset.id;
        const grp = event.currentTarget.dataset.group;

        if (grp && grp === id) {
            // Bundle summary row -- scale all items in this group
            this._scaleGroup(grp, 1);
        } else {
            // Single product OR individually controlled child row
            this._products = this._products.map(p =>
                p.productId === id
                    ? { ...p, quantity: p.quantity + 1, _individualQty: true }
                    : p
            );
        }
        this.notifyParent();
    }

    /* ================= DECREASE ================= */
    decrease(event) {
        const id  = event.currentTarget.dataset.id;
        const grp = event.currentTarget.dataset.group;

        if (grp && grp === id) {
            // Bundle summary row -- scale all items in this group
            const groupItems = this._products.filter(p => p.bundleGroupId === grp);
            if (groupItems.length > 0 && groupItems[0].quantity > (groupItems[0].minQty || 1)) {
                this._scaleGroup(grp, -1);
            }
        } else {
            // Single product OR individually controlled child row
            this._products = this._products.map(p =>
                p.productId === id && p.quantity > 1
                    ? { ...p, quantity: p.quantity - 1, _individualQty: true }
                    : p
            );
        }
        this.notifyParent();
    }

    /*
     * Scale all items in a bundle group by +1 or -1 bundle unit.
     * Each item's new qty = (currentQty / minQty + delta) * minQty
     * clamped to minQty minimum.
     */
    _scaleGroup(bundleGroupId, delta) {
        // Determine current scale factor from first item
        const first = this._products.find(p => p.bundleGroupId === bundleGroupId);
        if (!first) return;
        const currentScale = Math.round(first.quantity / (first.minQty || 1));
        const newScale     = Math.max(1, currentScale + delta);

        this._products = this._products.map(p => {
            if (p.bundleGroupId !== bundleGroupId) return p;
            return { ...p, quantity: (p.minQty || 1) * newScale };
        });
    }

    notifyParent() {
        this.dispatchEvent(new CustomEvent('productchange', {
            detail: { products: this._products.map(p => ({ ...p })) }
        }));
    }

    /* ================= REMOVE ================= */
    handleRemove(event) {
        const id      = event.currentTarget.dataset.id;
        const grp     = event.currentTarget.dataset.group;
        const isGroup = event.currentTarget.dataset.isgroup === 'true';

        if (isGroup && grp) {
            // Delete on bundle summary row -> remove ALL items in this group
            this._products = this._products.filter(p => p.bundleGroupId !== grp);
            const newExpanded = { ...this.expandedGroups };
            delete newExpanded[grp];
            this.expandedGroups = newExpanded;
        } else if (id) {
            // Delete on single item (standalone, direct child, or deep child)
            this._products = this._products.filter(p => p.productId !== id);
            this.errorProductIds = this.errorProductIds.filter(e => e !== id);
            // Clean up expanded state if group or sub-group is now empty
            if (grp) {
                const remaining = this._products.filter(p => p.bundleGroupId === grp);
                if (remaining.length === 0) {
                    const newExpanded = { ...this.expandedGroups };
                    delete newExpanded[grp];
                    this.expandedGroups = newExpanded;
                }
            }
        }

        this.notifyParent();
    }

    /* ================= TOGGLE BUNDLE / SUB-BUNDLE EXPAND ================= */
    handleToggleExpand(event) {
        const key = event.currentTarget.dataset.expkey || event.currentTarget.dataset.group;
        this.expandedGroups = {
            ...this.expandedGroups,
            [key]: !this.expandedGroups[key]
        };
    }

    /* ================= COMPUTED ================= */
    get grandTotal() {
        return this._products.reduce((t, p) => t + (p.price * p.quantity), 0);
    }

    get disableSave() {
        if (this._products.length === 0) return true;
        if (this.isSaving)               return true;
        return this._products.some(p => this.errorProductIds.includes(p.productId));
    }

    /*
     * Build display rows for the review screen:
     *
     * SINGLE PRODUCTS (no bundleGroupId):
     *   -> shown as normal flat rows
     *
     * BUNDLE GROUPS (items sharing a bundleGroupId):
     *   -> shown as ONE summary row with:
     *       - Bundle name (bundleName field)
     *       - Total quantity (scale factor)
     *       - Total price (sum of all children's price * qty)
     *       - Expand/collapse arrow to see individual children
     *   -> When expanded, child rows appear below (indented), read-only
     *
     * OLI RECORDS are created for every individual leaf product,
     * NOT for the bundle itself.
     */
    get displayRows() {
        const rows = [];
        const processedGroups = new Set();

        for (const p of this._products) {
            if (!p.bundleGroupId) {
                // -- Plain single product row --
                rows.push({
                    key         : p.productId,
                    productId   : p.productId,
                    name        : p.name,
                    price       : p.price,
                    quantity    : p.quantity,
                    displayUrl  : p.displayUrl,
                    isBundleGroup: false,
                    isSubBundle  : false,
                    isChildRow   : false,
                    isDeepChild  : false,
                    isStandalone : true,
                    isDirectChild: false,
                    hasQtyControl: true,
                    hasError    : this.errorProductIds.includes(p.productId),
                    rowClass    : this.errorProductIds.includes(p.productId) ? 'row row-error' : 'row',
                    nameClass   : 'product-name',
                    priceClass  : '',
                    totalClass  : '',
                    total       : p.price * p.quantity
                });

            } else if (!processedGroups.has(p.bundleGroupId)) {
                // -- First encounter of this bundle group -> emit summary row --
                processedGroups.add(p.bundleGroupId);
                const grp = p.bundleGroupId;
                const groupItems = this._products.filter(x => x.bundleGroupId === grp);

                // Determine bundle scale (qty units of the bundle)
                const scaleQty   = Math.round(groupItems[0].quantity / (groupItems[0].minQty || 1));
                const groupTotal = groupItems.reduce((t, x) => t + x.price * x.quantity, 0);
                const isExpanded = !!this.expandedGroups[grp];

                const hasGroupError = groupItems.some(x => this.errorProductIds.includes(x.productId));

                rows.push({
                    key          : grp,
                    bundleGroupId: grp,
                    productId    : grp,
                    name         : p.bundleName || 'Bundle',
                    price        : groupTotal / scaleQty,
                    quantity     : scaleQty,
                    displayUrl   : null,
                    isBundleGroup: true,
                    isSubBundle  : false,
                    isChildRow   : false,
                    isDeepChild  : false,
                    isStandalone : false,
                    isDirectChild: false,
                    hasQtyControl: false,
                    isExpanded   : isExpanded,
                    expandIcon   : isExpanded ? 'utility:chevronup' : 'utility:chevrondown',
                    hasError     : hasGroupError,
                    rowClass     : hasGroupError ? 'row row-bundle row-error' : 'row row-bundle',
                    nameClass    : 'product-name bundle-label',
                    priceClass   : '',
                    totalClass   : '',
                    total        : groupTotal
                });

                // If expanded, emit child rows -- grouped by subBundle if present
                if (isExpanded) {
                    const processedSubs = new Set();

                    for (const child of groupItems) {
                        if (child.subBundleId) {
                            // -- This child belongs to an intermediate sub-bundle --
                            if (!processedSubs.has(child.subBundleId)) {
                                processedSubs.add(child.subBundleId);

                                // Collect all siblings in this sub-bundle
                                const subItems = groupItems.filter(x => x.subBundleId === child.subBundleId);
                                const subTotal = subItems.reduce((t, x) => t + x.price * x.quantity, 0);
                                const subExpKey = grp + '_' + child.subBundleId;
                                const subExpanded = !!this.expandedGroups[subExpKey];

                                // Sub-bundle header row (display only, not an OLI)
                                rows.push({
                                    key           : subExpKey,
                                    productId     : child.subBundleId,
                                    bundleGroupId : grp,
                                    subBundleId   : child.subBundleId,
                                    subExpKey     : subExpKey,
                                    name          : child.subBundleName || 'Sub-Bundle',
                                    price         : subTotal,
                                    quantity      : '',
                                    displayUrl    : null,
                                    isBundleGroup : false,
                                    isChildRow    : true,
                                    isSubBundle   : true,
                                    isDeepChild   : false,
                                    isStandalone  : false,
                                    isDirectChild : false,
                                    hasQtyControl : false,
                                    isSubExpanded : subExpanded,
                                    subExpandIcon : subExpanded ? 'utility:chevronup' : 'utility:chevrondown',
                                    hasError      : subItems.some(x => this.errorProductIds.includes(x.productId)),
                                    rowClass      : 'row row-child row-subbundle',
                                    nameClass     : 'product-name subbundle-label',
                                    priceClass    : 'child-text',
                                    totalClass    : 'child-text',
                                    total         : subTotal
                                });

                                // If this sub-bundle is expanded, emit its leaf children
                                if (subExpanded) {
                                    for (const sc of subItems) {
                                        rows.push({
                                            key          : subExpKey + '_' + sc.productId,
                                            productId    : sc.productId,
                                            bundleGroupId: grp,
                                            subBundleId  : sc.subBundleId,
                                            name         : sc.name,
                                            price        : sc.price,
                                            quantity     : sc.quantity,
                                            displayUrl   : sc.displayUrl,
                                            isBundleGroup: false,
                                            isChildRow   : true,
                                            isSubBundle  : false,
                                            isDeepChild  : true,
                                            isStandalone : false,
                                            isDirectChild: false,
                                            hasQtyControl: true,
                                            hasError     : this.errorProductIds.includes(sc.productId),
                                            rowClass     : this.errorProductIds.includes(sc.productId)
                                                             ? 'row row-deep-child row-error'
                                                             : 'row row-deep-child',
                                            nameClass    : 'product-name',
                                            priceClass   : 'deep-child-text',
                                            totalClass   : 'deep-child-text',
                                            total        : sc.price * sc.quantity
                                        });
                                    }
                                }
                            }
                        } else {
                            // -- Direct child of the top bundle (no intermediate bundle) --
                            rows.push({
                                key          : grp + '_' + child.productId,
                                productId    : child.productId,
                                bundleGroupId: grp,
                                name         : child.name,
                                price        : child.price,
                                quantity     : child.quantity,
                                displayUrl   : child.displayUrl,
                                isBundleGroup: false,
                                isChildRow   : true,
                                isSubBundle  : false,
                                isDeepChild  : false,
                                isStandalone : false,
                                isDirectChild: true,
                                hasQtyControl: true,
                                hasError     : this.errorProductIds.includes(child.productId),
                                rowClass     : this.errorProductIds.includes(child.productId)
                                                ? 'row row-child row-error'
                                                : 'row row-child',
                                nameClass    : 'product-name',
                                priceClass   : 'child-text',
                                totalClass   : 'child-text',
                                total        : child.price * child.quantity
                            });
                        }
                    }
                }
            }
        }
        return rows;
    }

    /* ================= NAVIGATION ================= */
    handleBack()   { this.dispatchEvent(new CustomEvent('back')); }
    handleCancel() { this.dispatchEvent(new CustomEvent('cancel')); }

    /* ================= SAVE ================= */
    /*
     * Saves ONLY the individual leaf products (every item in _products).
     * No bundle parent rows exist here -- only real products with real prices.
     */
    @api
    async handleSave() {
        if (this.isSaving) return;
        this.isSaving = true;

        const payload = this._products.map(p => ({
            productId: p.productId,
            quantity : p.quantity,
            price    : p.price
        }));

        try {
            const result = await saveProducts({
                opportunityId: this.recordId,
                itemsJson    : JSON.stringify(payload)
            });

            const failed = result.failedProductIds || [];

            if (result.isError && failed.length > 0) {
                this.errorProductIds = [...failed];
                this.dispatchEvent(new ShowToastEvent({
                    title  : 'Pricebook Entry Missing',
                    message: 'Some products don\'t have a pricebook entry. Remove the highlighted rows and save again.',
                    variant: 'error',
                    mode   : 'sticky'
                }));
                this.isSaving = false;
                return;
            }

            this.errorProductIds = [];
            this.dispatchEvent(new ShowToastEvent({
                title  : 'Success',
                message: result.message,
                variant: 'success'
            }));

            await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
            this.dispatchEvent(new RefreshEvent());
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('closeall'));
            }, 1000);

        } catch (e) {
            this.dispatchEvent(new ShowToastEvent({
                title  : 'Error',
                message: e.body?.message,
                variant: 'error'
            }));
            this.isSaving = false;
        }
    }
}