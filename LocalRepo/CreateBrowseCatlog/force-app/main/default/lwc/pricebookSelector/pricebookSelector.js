import { LightningElement, api, track } from 'lwc';
import assignPricebook from '@salesforce/apex/BrowseCatalogController.assignPricebook';

export default class PricebookSelector extends LightningElement {

    @api recordId;

    @track selected = null;
    @track isSaving = false;

    /* ================= RECORD PICKER ================= */
    displayInfo = {
        primaryField: 'Name'
    };

    filter = {
        criteria: [
            {
                fieldPath: 'IsActive',
                operator: 'eq',
                value: true
            }
        ]
    };

    /* ================= CHANGE ================= */
    handleChange(event){
        this.selected = event.detail.recordId;

        // 🔥 Notify parent (enable Save button)
        this.dispatchEvent(new CustomEvent('selectionchange', {
            detail: {
                selected: this.selected
            }
        }));
    }

    /* ================= DISABLE ================= */
    get disableSave(){
        return !this.selected || this.isSaving;
    }

    /* ================= CANCEL ================= */
    handleCancel(){
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    /* ================= SAVE ================= */
    @api
    async save(){

        console.log('🔥 SAVE METHOD CALLED');

        if (!this.selected) {
            console.warn('No pricebook selected');
            return;
        }

        this.isSaving = true;

        try{

            console.log('Calling Apex...');

            await assignPricebook({
                opportunityId: this.recordId,
                pricebookId: this.selected
            });

            console.log('✅ Pricebook assigned');

            // 🔥 Notify parent to move next
            this.dispatchEvent(new CustomEvent('select',{
                detail:{
                    pricebookId: this.selected,
                    pricebookName: ''
                }
            }));

        }catch(e){
            console.error('❌ Save Error:', e);
        }

        this.isSaving = false;
    }
}