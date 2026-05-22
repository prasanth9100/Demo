import { LightningElement, api, track } from 'lwc';
import getProductConfig  from '@salesforce/apex/ConfigurationService.getProductConfig';
import updatePricesApex  from '@salesforce/apex/ConfigurationService.updatePrices';

/*
 * WHAT CHANGED vs the original:
 *
 *  1. handleSave() NO LONGER calls createBundleOppLines / saveBundleQuantities.
 *     There is ZERO direct Apex OLI creation from this component.
 *
 *  2. handleSave() fires 'configsave' (not 'save') with:
 *       event.detail.items   - flat array: [ parent, child1, child2, ... ]
 *       event.detail.bundleGroupId - stable key so productBrowser can
 *                                    replace old rows on reconfigure
 *
 *  3. handleQuantityChange() auto-scales child quantities that have NOT
 *     been individually overridden by the user (_individualQty: false).
 *
 *  4. handleBundleQtyChange() marks the child as _individualQty: true
 *     so parent-qty changes no longer auto-scale it.
 *
 * productBrowser listens for onconfigsave and merges the flat items
 * into selectedProducts -- identical result to clicking Add button.
 */

export default class ProductConfigurator extends LightningElement {

    @api productId;
    @api recordId;
    @api recordType     = 'Opportunity';
    @api productName    = '';
    @api productImage   = '';
    @api productPrice   = 0;
    @api productDescription = '';

    @track attributes        = [];
    @track bundleItems       = [];
    @track isLoading         = true;
    @track quantity          = 1;
    @track activeGroup       = null;
    @track activeBundleGroup = null;
    @track computedOneTimeTotal = null;

    /* =================== INIT =================== */
    connectedCallback() { this.loadConfig(); }

    async loadConfig() {
        try {
            const data = await getProductConfig({ productId: this.productId });

            if (data?.productPrice)       this.productPrice       = data.productPrice;
            if (data?.productDescription) this.productDescription = data.productDescription;

            this.attributes = (data?.attributes || []).map(attr => ({
                ...attr,
                value     : '',
                isPicklist: attr.dataType === 'Picklist',
                inputType : attr.dataType === 'Number' ? 'number' : 'text',
                options   : attr.options || []
            }));

            this.bundleItems = (data?.bundleItems || []).map(b => ({
                ...b,
                quantity         : Number(b.minQty) || 1,
                included         : true,
                expanded         : false,
                price            : b.price        || 0,
                description      : b.description  || '',
                netAmountLabel   : b.netAmountLabel || 'Included',
                attrSummary      : b.attrSummary  || '',
                groupName        : b.groupName    || 'General',
                minQty           : Number(b.minQty) || 1,
                maxQty           : b.maxQty ? Number(b.maxQty) : null,
                _individualQty   : false,   // true = user manually set qty -> no auto-scale
                childAttributes  : (b.childAttributes || []).map(ca => ({
                    ...ca,
                    value     : '',
                    isPicklist: ca.dataType === 'Picklist',
                    inputType : ca.dataType === 'Number' ? 'number' : 'text',
                    options   : ca.options || []
                })),
                nestedBundleItems: (b.nestedBundleItems || []).map(nb => ({
                    ...nb,
                    quantity       : Number(nb.minQty) || 1,
                    included       : true,
                    price          : nb.price || 0,
                    minQty         : Number(nb.minQty) || 1,
                    maxQty         : nb.maxQty ? Number(nb.maxQty) : null,
                    _individualQty : false
                }))
            }));

            if (this.groups.length)       this.activeGroup       = this.groups[0].name;
            if (this.bundleGroups.length) this.activeBundleGroup = this.bundleGroups[0].name;

        } catch (e) {
            console.error('Config load error:', e);
        }
        this.isLoading = false;
    }

    /* =================== GETTERS -- GROUPS =================== */
    get groups() {
        const seen = new Set();
        return this.attributes.reduce((acc, attr) => {
            const g = attr.groupName || 'General';
            if (!seen.has(g)) {
                seen.add(g);
                acc.push({ name: g, tabClass: this.activeGroup === g ? 'tab-btn tab-active' : 'tab-btn' });
            }
            return acc;
        }, []);
    }

    get hasGroups()           { return this.groups.length > 0; }

    get activeGroupAttributes() {
        return this.attributes
            .filter(a => (a.groupName || 'General') === this.activeGroup)
            .map(a => ({ ...a }));
    }

    get bundleGroups() {
        const seen = new Set();
        return this.bundleItems.reduce((acc, b) => {
            const g = b.groupName || 'General';
            if (!seen.has(g)) {
                seen.add(g);
                acc.push({
                    name         : g,
                    tabClass     : this.activeBundleGroup === g ? 'tab-btn tab-active' : 'tab-btn',
                    includedItems: this.bundleItems
                        .filter(bi => (bi.groupName || 'General') === g && bi.included)
                        .map(bi => ({
                            productId     : bi.productId,
                            name          : bi.name,
                            quantity      : bi.quantity,
                            attrSummary   : bi.attrSummary,
                            netAmountLabel: bi.netAmountLabel
                        }))
                });
            }
            return acc;
        }, []);
    }

    get hasBundleItems() { return this.bundleItems.length > 0; }

    get activeBundleItems() {
        return this.bundleItems
            .filter(b => (b.groupName || 'General') === this.activeBundleGroup)
            .map(b => ({
                ...b,
                cardClass      : b.included ? 'bundle-card bundle-card-selected' : 'bundle-card',
                expandIcon     : b.expanded ? 'utility:chevronup' : 'utility:chevrondown',
                hasChildConfig : b.childAttributes.length > 0 || b.nestedBundleItems.length > 0,
                hasInlineAttrs : b.childAttributes.length > 0,
                hasNestedBundle: b.nestedBundleItems.length > 0
            }));
    }

    /* =================== GETTERS -- SUMMARY =================== */
    get summaryAttributes()  { return this.attributes.filter(a => a.value).map(a => ({ ...a })); }
    get hasSummaryAttrs()    { return this.summaryAttributes.length > 0; }
    get hasData()            { return this.attributes.length > 0 || this.bundleItems.length > 0; }

    get oneTimeTotal() {
        if (this.computedOneTimeTotal != null) return this.computedOneTimeTotal;
        const t = this.productPrice * this.quantity;
        return t ? `? ${t.toLocaleString('en-IN')}` : '-';
    }

    /* =================== HANDLERS -- PARENT QTY =================== */
    handleTabClick(e) { this.activeGroup = e.currentTarget.dataset.group; }

    /*
     * When parent quantity changes -> proportionally scale all children
     * whose _individualQty is still false (not manually overridden).
     *   child new qty = child.minQty ? newParentQty
     */
    handleQuantityChange(e) {
        const newQty = Math.max(1, parseInt(e.target.value, 10) || 1);
        this.quantity = newQty;
        this.computedOneTimeTotal = null;

        if (this.bundleItems.length > 0) {
            this.bundleItems = this.bundleItems.map(b => {
                if (b._individualQty) return { ...b };   // user-locked -- don't touch
                const scaled = b.minQty * newQty;
                const capped = b.maxQty ? Math.min(scaled, b.maxQty) : scaled;
                return { ...b, quantity: capped };
            });
        }
    }

    handleAttrChange(e) {
        const id  = e.target.dataset.id;
        const val = e.target.value;
        this.attributes = this.attributes.map(a =>
            a.attributeId === id ? { ...a, value: val } : { ...a }
        );
    }

    /* =================== HANDLERS -- BUNDLE =================== */
    handleBundleTabClick(e) { this.activeBundleGroup = e.currentTarget.dataset.group; }

    handleBundleIncludeToggle(e) {
        const id      = e.target.dataset.id;
        const checked = e.target.checked;
        this.bundleItems = this.bundleItems.map(b =>
            b.productId === id ? { ...b, included: checked } : { ...b }
        );
        this.computedOneTimeTotal = null;
    }

    /* User manually changed a child qty -> mark _individualQty = true */
    handleBundleQtyChange(e) {
        const id  = e.target.dataset.id;
        const val = parseInt(e.target.value, 10);
        this.bundleItems = this.bundleItems.map(b => {
            if (b.productId !== id) return { ...b };
            const minQ = b.minQty || 1;
            const qty  = val > 0 ? val : minQ;
            return { ...b, quantity: b.maxQty ? Math.min(qty, b.maxQty) : qty, _individualQty: true };
        });
        this.computedOneTimeTotal = null;
    }

    handleToggleExpand(e) {
        const id = e.currentTarget.dataset.id;
        this.bundleItems = this.bundleItems.map(b =>
            b.productId === id ? { ...b, expanded: !b.expanded } : { ...b }
        );
    }

    handleChildAttrChange(e) {
        const bundleId = e.target.dataset.bundleId;
        const attrId   = e.target.dataset.id;
        const val      = e.target.value;
        this.bundleItems = this.bundleItems.map(b => {
            if (b.productId !== bundleId) return { ...b };
            return {
                ...b,
                childAttributes: b.childAttributes.map(ca =>
                    ca.attributeId === attrId ? { ...ca, value: val } : { ...ca }
                )
            };
        });
    }

    handleNestedBundleToggle(e) {
        const parentId = e.target.dataset.parentId;
        const childId  = e.target.dataset.id;
        const checked  = e.target.checked;
        this.bundleItems = this.bundleItems.map(b => {
            if (b.productId !== parentId) return { ...b };
            return {
                ...b,
                nestedBundleItems: b.nestedBundleItems.map(nb =>
                    nb.productId === childId ? { ...nb, included: checked } : { ...nb }
                )
            };
        });
        this.computedOneTimeTotal = null;
    }

    handleNestedBundleQtyChange(e) {
        const parentId = e.target.dataset.parentId;
        const childId  = e.target.dataset.id;
        const val      = parseInt(e.target.value, 10);
        this.bundleItems = this.bundleItems.map(b => {
            if (b.productId !== parentId) return { ...b };
            return {
                ...b,
                nestedBundleItems: b.nestedBundleItems.map(nb => {
                    if (nb.productId !== childId) return { ...nb };
                    const minQ = nb.minQty || 1;
                    const qty  = val > 0 ? val : minQ;
                    return { ...nb, quantity: nb.maxQty ? Math.min(qty, nb.maxQty) : qty, _individualQty: true };
                })
            };
        });
        this.computedOneTimeTotal = null;
    }

    handleImageError(e) { e.target.style.display = 'none'; }

    /* =================== BUILD BUNDLE LINES =================== */
    _buildBundleLines() {
        return this.bundleItems.map(b => ({
            productId        : b.productId,
            name             : b.name,
            included         : b.included,
            quantity         : b.quantity,
            nestedBundleItems: b.nestedBundleItems.map(nb => ({
                productId: nb.productId,
                name     : nb.name,
                included : nb.included,
                quantity : nb.quantity
            }))
        }));
    }

    /* =================== UPDATE PRICES =================== */
    async handleUpdatePrices() {
        try {
            this.isLoading = true;
            const result = await updatePricesApex({
                productId  : this.productId,
                parentQty  : this.quantity,
                bundleLines: this._buildBundleLines()
            });

            if (result?.lines) {
                const lineMap = {};
                result.lines.forEach(l => { lineMap[l.productId] = l; });
                this.bundleItems = this.bundleItems.map(b => {
                    const line = lineMap[b.productId];
                    return line
                        ? { ...b, netAmountLabel: line.netAmountLabel, price: line.unitPrice }
                        : { ...b };
                });
            }
            this.computedOneTimeTotal = result?.oneTimeTotalLabel || '-';

        } catch (e) {
            console.error('Update prices error:', e);
        } finally {
            this.isLoading = false;
        }
    }

    /* ===========================================================
       SAVE  ->  fires 'configsave'  (NO Apex OLI creation here)
       ---------------------------------------------------------
       Builds a FLAT array of items that productBrowser merges
       into selectedProducts.  Identical structure to what the
       Add button produces so both paths produce the same result.

       Flat array structure per item:
         productId      - Product2 Id
         name           - display name
         price          - unit price (0 for children if unknown)
         quantity       - configured qty
         displayUrl     - image (null for children)
         isChild        - false = parent, true = child
         parentBundleId - parent productId (null for non-bundle)
         bundleGroupId  - stable key linking parent+children rows
         minQty         - default child qty multiplier
         _individualQty - false = auto-scale with parent qty
    =========================================================== */
    async handleSave() {
        try {
            this.isLoading = true;

            // Stable group key for replace-on-reconfigure logic in productBrowser
            const bundleGroupId = this.productId; // stable -- same product always maps to same group
            const isBundle      = this.bundleItems.length > 0;

            const flatItems = [];

            // 1. Parent row
            flatItems.push({
                productId      : this.productId,
                name           : this.productName,
                price          : this.productPrice,
                quantity       : this.quantity,
                displayUrl     : this.productImage || null,
                isChild        : false,
                parentBundleId : isBundle ? this.productId : null,
                bundleGroupId  : isBundle ? bundleGroupId  : null,
                minQty         : 1,
                _individualQty : false
            });

            // 2. Included child rows -- ONLY push leaf products, never bundle children.
            //    If a bundleItem has nestedBundleItems it is itself a bundle (sub-bundle).
            //    In that case: skip the sub-bundle row, push only its included nested leaves
            //    and stamp subBundleId/subBundleName so reviewProducts can group them.
            for (const b of this.bundleItems) {
                if (!b.included) continue;

                const hasNested = b.nestedBundleItems && b.nestedBundleItems.length > 0;

                if (hasNested) {
                    // -- Sub-bundle: push only its nested leaf children --
                    // quantity = nb.quantity (nested item base qty) * b.quantity (sub-bundle qty set by user)
                    for (const nb of b.nestedBundleItems) {
                        if (!nb.included) continue;
                        const effectiveQty = (nb.quantity || 1) * (b.quantity || 1);
                        flatItems.push({
                            productId      : nb.productId,
                            name           : nb.name,
                            price          : nb.price || 0,
                            quantity       : effectiveQty,
                            displayUrl     : null,
                            isChild        : true,
                            parentBundleId : this.productId,
                            bundleGroupId  : bundleGroupId,
                            subBundleId    : b.productId,
                            subBundleName  : b.name,
                            minQty         : (nb.minQty || 1) * (b.minQty || 1),
                            _individualQty : nb._individualQty || false
                        });
                    }
                } else {
                    // -- Direct leaf child (no nested items) --
                    flatItems.push({
                        productId      : b.productId,
                        name           : b.name,
                        price          : b.price || 0,
                        quantity       : b.quantity,
                        displayUrl     : null,
                        isChild        : true,
                        parentBundleId : this.productId,
                        bundleGroupId  : bundleGroupId,
                        subBundleId    : null,
                        subBundleName  : null,
                        minQty         : b.minQty || 1,
                        _individualQty : b._individualQty || false
                    });
                }
            }

            // Fire configsave -- productBrowser handles merging into selectedProducts
            this.dispatchEvent(new CustomEvent('configsave', {
                detail: {
                    items          : flatItems,
                    bundleGroupId  : bundleGroupId,
                    quantity       : this.quantity,
                    attributes     : this.attributes.map(a => ({
                        attributeId: a.attributeId,
                        name       : a.name,
                        value      : a.value
                    })),
                    bundleLines    : this._buildBundleLines()
                },
                bubbles : true,
                composed: true
            }));

        } catch (e) {
            console.error('Save error:', e);
        } finally {
            this.isLoading = false;
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}