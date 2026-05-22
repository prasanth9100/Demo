import { LightningElement, api, track } from 'lwc';
import getProducts    from '@salesforce/apex/ProductService.getProducts';
import getBundleItems from '@salesforce/apex/BundleService.getBundleItems';
import getProductPrices from '@salesforce/apex/ProductService.getProductPrices';

export default class ProductList extends LightningElement {

    @api catalogId;
    @api pricebookId;
    @api selectedProducts = [];

    @track products    = [];
    pageNumber  = 1;
    pageSize    = 20;
    hasMore     = true;
    isFetching  = false;

    @api filterApplied = null;
    @api sortOrder     = null;
    @track _categoryId = null;
    @track _searchKey  = '';

    /* ================= CATEGORY / SEARCH ================= */
    @api
    get categoryId() { return this._categoryId; }
    set categoryId(value) {
        this._categoryId = value;
        this.resetAndLoad();
    }

    @api
    get searchKey() { return this._searchKey; }
    set searchKey(value) {
        this._searchKey = value;
        this.resetAndLoad();
    }

    resetAndLoad() {
        this.products   = [];
        this.pageNumber = 1;
        this.hasMore    = true;
        this.load();
    }

    connectedCallback() { this.load(); }

    @api refresh() {
        this.products   = [];
        this.pageNumber = 1;
        this.hasMore    = true;
        this.load();
    }

    /* ================= LOAD ================= */
    async load() {
        if (!this.catalogId || !this.hasMore || this.isFetching) return;
        this.isFetching = true;
        try {
            const data = await getProducts({
                catalogId  : this.catalogId,
                categoryId : this.categoryId,
                pricebookId: this.pricebookId,
                searchKey  : this.searchKey,
                pageSize   : this.pageSize,
                pageNumber : this.pageNumber
            });
            const newData = (data || []).map(p => ({ ...p, quantity: 1 }));
            this.products = [...this.products, ...newData];
            if (newData.length < this.pageSize) this.hasMore = false;
            else this.pageNumber++;
        } catch (e) {
            console.error('Error loading products', e);
        }
        this.isFetching = false;
    }

    /* ================= SCROLL ================= */
    handleScroll(e) {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) this.load();
    }

    handleImageError(event) { event.target.style.display = 'none'; }

    /* ================= QTY ================= */
    increase(e) {
        const id = e.currentTarget.dataset.id;
        this.products = this.products.map(p =>
            p.productId === id ? { ...p, quantity: p.quantity + 1 } : p
        );
    }

    decrease(e) {
        const id = e.currentTarget.dataset.id;
        this.products = this.products.map(p =>
            (p.productId === id && p.quantity > 1) ? { ...p, quantity: p.quantity - 1 } : p
        );
    }

    /* ================= GEAR ICON ================= */
    openConfig(e) {
        const id      = e.currentTarget.dataset.id;
        const product = this.products.find(p => p.productId === id);
        this.dispatchEvent(new CustomEvent('configure', {
            detail  : { product: { ...product } },
            bubbles : true,
            composed: true
        }));
    }

    /* ================= BUNDLE DECOMPOSITION ================= */
    /*
     * Fetches one level of children for every direct child of the clicked bundle,
     * all in parallel via Promise.all.
     *
     * If a direct child itself has children -> it is a sub-bundle.
     *   Its grandchildren become leaf items tagged with subBundleId/subBundleName
     *   so reviewProducts can show them under a collapsible sub-bundle header.
     *
     * If a direct child has no children -> it is a plain leaf product.
     *   subBundleId = null (shown flat under the top bundle).
     *
     * All prices are fetched in a single batch Apex call at the end.
     */
    async _collectLeaves(directChildren, parentQty, bundleGroupId, topBundleId, pricebookId) {
        const leaves = [];

        const subChecks = await Promise.all(
            directChildren.map(bc =>
                getBundleItems({ productId: bc.ChildProductId })
                    .then(r => ({ bc, grandChildren: r || [] }))
                    .catch(() => ({ bc, grandChildren: [] }))
            )
        );

        for (const { bc, grandChildren } of subChecks) {
            const childId     = bc.ChildProductId;
            const childName   = bc.ChildProduct ? bc.ChildProduct.Name : childId;
            const childMinQty = Number(bc.MinQuantity) || 1;
            const childQty    = childMinQty * parentQty;

            if (grandChildren.length > 0) {
                // Direct child is a sub-bundle — add its children as leaves
                for (const gc of grandChildren) {
                    const gcId     = gc.ChildProductId;
                    const gcName   = gc.ChildProduct ? gc.ChildProduct.Name : gcId;
                    const gcMinQty = Number(gc.MinQuantity) || 1;
                    const gcQty    = gcMinQty * childQty;
                    leaves.push({
                        productId      : gcId,
                        name           : gcName,
                        price          : 0,
                        quantity       : gcQty,
                        displayUrl     : null,
                        isChild        : true,
                        parentBundleId : topBundleId,
                        bundleGroupId  : bundleGroupId,
                        subBundleId    : childId,
                        subBundleName  : childName,
                        minQty         : gcQty,
                        _individualQty : false
                    });
                }
            } else {
                // Direct child is a plain leaf product
                leaves.push({
                    productId      : childId,
                    name           : childName,
                    price          : 0,
                    quantity       : childQty,
                    displayUrl     : null,
                    isChild        : true,
                    parentBundleId : topBundleId,
                    bundleGroupId  : bundleGroupId,
                    subBundleId    : null,
                    subBundleName  : null,
                    minQty         : childQty,
                    _individualQty : false
                });
            }
        }

        // Batch-fetch all prices in one Apex call
        const productIds = [...new Set(leaves.map(l => l.productId))];
        try {
            const priceMap = await getProductPrices({ productIds, pricebookId });
            return leaves.map(l => ({
                ...l,
                price: (priceMap && priceMap[l.productId]) ? priceMap[l.productId] : 0
            }));
        } catch (e) {
            console.warn('Batch price fetch failed', e);
            return leaves;
        }
    }

    /* ================= ADD BUTTON ================= */
    async add(e) {
        const id      = e.currentTarget.dataset.id;
        const product = this.products.find(p => p.productId === id);
        if (!product) return;

        try {
            const bundleChildren = await getBundleItems({ productId: id });

            if (bundleChildren && bundleChildren.length > 0) {
                // Bundle clicked — decompose to leaf products only
                const parentQty     = product.quantity || 1;
                const bundleGroupId = product.productId;

                const leafItems = await this._collectLeaves(
                    bundleChildren,
                    parentQty,
                    bundleGroupId,
                    product.productId,
                    this.pricebookId
                );

                const enrichedLeaves = leafItems.map(item => ({
                    ...item,
                    bundleName: product.name
                }));

                this.dispatchEvent(new CustomEvent('addproduct', {
                    detail: { product: enrichedLeaves }
                }));

            } else {
                // Plain single product
                this.dispatchEvent(new CustomEvent('addproduct', {
                    detail: {
                        product: [{
                            productId      : product.productId,
                            name           : product.name,
                            price          : product.price,
                            quantity       : product.quantity || 1,
                            displayUrl     : product.displayUrl,
                            isChild        : false,
                            parentBundleId : null,
                            bundleGroupId  : null,
                            bundleName     : null,
                            subBundleId    : null,
                            subBundleName  : null,
                            minQty         : 1,
                            _individualQty : false
                        }]
                    }
                }));
            }
        } catch (err) {
            console.error('Error in add()', err);
            this.dispatchEvent(new CustomEvent('addproduct', {
                detail: {
                    product: [{
                        ...product,
                        isChild        : false,
                        parentBundleId : null,
                        bundleGroupId  : null,
                        bundleName     : null,
                        subBundleId    : null,
                        subBundleName  : null,
                        minQty         : 1,
                        _individualQty : false
                    }]
                }
            }));
        }

        this.products = this.products.map(p =>
            p.productId === id ? { ...p, quantity: 1 } : p
        );
    }

    /* ================= ENRICHED LIST ================= */
    get enrichedProducts() {
        let list = this.products.map(p => ({ ...p }));

        if (this.filterApplied === true)       list = list.filter(p => p.isQualified === true);
        else if (this.filterApplied === false)  list = list.filter(p => p.isQualified === false);

        if (this.sortOrder === 'asc')
            list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        else if (this.sortOrder === 'desc')
            list = [...list].sort((a, b) => (b.name || '').localeCompare(a.name || ''));

        return list;
    }
}