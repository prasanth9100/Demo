import { LightningElement, wire, track , api } from 'lwc';
import getCatalogs from '@salesforce/apex/CatalogService.getCatalogs';
import { COLUMNS } from './catalogListConstants';

export default class CatalogList extends LightningElement {

    @track catalogs = [];
    @track filteredCatalogs = [];
    @api selectedCatalogId;

    selectedId;
    searchKey = '';

    columns = COLUMNS;

    /* ================= LOAD DATA ================= */
    @wire(getCatalogs)
    wired({ data, error }) {
        if (data) {

            // 🔥 SORT BY NAME
            this.catalogs = [...data].sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
            );

            this.filteredCatalogs = this.catalogs;

        } else if (error) {
            console.error(error);
        }
    }

    /* ================= SEARCH ================= */
    handleSearch(event) {

        this.searchKey = (event.target.value || '').toLowerCase();

        if (!this.searchKey) {
            this.filteredCatalogs = this.catalogs;
            return;
        }

        this.filteredCatalogs = this.catalogs.filter(c =>
            (c.name && c.name.toLowerCase().includes(this.searchKey)) ||
            (c.code && c.code.toLowerCase().includes(this.searchKey))
        );
    }

    /* ================= ROW SELECT ================= */
    handleRowSelection(event) {

    const rows = event.detail.selectedRows;

    this.selectedId = rows.length ? rows[0].catalogId : null;

    // ✅ ONLY STORE SELECTION (NO NAVIGATION)
    if (this.selectedId) {
        const selected = this.catalogs.find(
            c => c.catalogId === this.selectedId
        );

        this.dispatchEvent(new CustomEvent('catalogselect', {
            detail: {
                catalogId: selected.catalogId,
                name: selected.name
            }
        }));
    }
}
connectedCallback() {
    if (this.selectedCatalogId) {
        this.selectedId = this.selectedCatalogId;
    }
}
    /* ================= NEXT (CALLED FROM PARENT) ================= */
    @api handleNext(){

        const selected = this.catalogs.find(
            c => c.catalogId === this.selectedId
        );

        if(!selected) return;

        this.dispatchEvent(
            new CustomEvent('catalognext', {
                detail: {
                    catalogId: selected.catalogId,
                    name: selected.name
                }
            })
        );
    }

    /* ================= HELPERS ================= */
    // get selectedRows() {
    //     return this.selectedId ? [this.selectedId] : [];
    // }
    get selectedRows() {
    const id = this.selectedId || this.selectedCatalogId;
    return id ? [id] : [];
}

    get totalCount() {
        return this.filteredCatalogs.length;
    }

    get selectedCount() {
        return this.selectedId ? 1 : 0;
    }
}