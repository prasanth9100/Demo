import { LightningElement, api, wire, track } from 'lwc';
import getCategories from '@salesforce/apex/CategoryService.getCategories';

export default class CategorySidebar extends LightningElement {

    @api catalogId;
    @track treeItems = [];
    selectedItem = 'ALL';
    _initialized = false; // 🔥 guard

    /* ================= LOAD ================= */
    @wire(getCategories, { catalogId: '$catalogId' })
    wired({ data }) {
        if (data) {
            this.treeItems = this.buildTree(data);

            // 🔥 Fire default ONCE only
            if (!this._initialized) {
                this._initialized = true;
                this.dispatchEvent(new CustomEvent('categoryselect', {
                    detail: { categoryId: null }
                }));
            }
        }
    }

    /* ================= BUILD TREE ================= */
    buildTree(data) {
        const map = {};
        data.forEach(cat => {
            map[cat.Id] = { label: cat.Name, name: cat.Id, items: [] };
        });

        let tree = [];
        data.forEach(cat => {
            if (cat.ParentCategoryId && map[cat.ParentCategoryId]) {
                map[cat.ParentCategoryId].items.push(map[cat.Id]);
            } else {
                tree.push(map[cat.Id]);
            }
        });

        tree.unshift({ label: 'All Products', name: 'ALL' });
        return tree;
    }

    /* ================= SELECT ================= */
    handleSelect(e) {
        const selected = e.detail.name;
        console.log('selected', selected);

        this.selectedItem = selected; // 🔥 no setTimeout, no treeKey

        this.dispatchEvent(new CustomEvent('categoryselect', {
            detail: {
                categoryId: selected === 'ALL' ? null : selected
            }
        }));
    }
}