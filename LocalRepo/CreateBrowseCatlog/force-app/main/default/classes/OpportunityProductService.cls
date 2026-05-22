public with sharing class OpportunityProductService {

    /* =========================================================
       CREATE OPPORTUNITY LINE ITEMS (NO MERGE - ALWAYS INSERT)
    ========================================================= */

    @AuraEnabled
    public static ResponseWrapper createOpportunityLineItems(
        Id opportunityId,
        String itemsJson
    ){

        ResponseWrapper res = new ResponseWrapper();

        try{

            System.debug('===== START createOpportunityLineItems =====');
            System.debug('Incoming JSON: ' + itemsJson);

            /* =============================
               DESERIALIZE
            ============================= */

            List<OLIWrapper> items =
                (List<OLIWrapper>) JSON.deserialize(itemsJson, List<OLIWrapper>.class);

            System.debug('Items Parsed: ' + items);

            if(items == null || items.isEmpty()){
                res.isError = true;
                res.message = 'No items received';
                return res;
            }

            /* =============================
               GET OPPORTUNITY
            ============================= */

            Opportunity opp = [
                SELECT Id, Pricebook2Id
                FROM Opportunity
                WHERE Id = :opportunityId
                LIMIT 1
            ];

            System.debug('Opportunity: ' + opp);

            /* =============================
               ENSURE PRICEBOOK
            ============================= */

            if(opp.Pricebook2Id == null){

                System.debug('No pricebook on opportunity. Assigning standard...');

                Pricebook2 std = [
                    SELECT Id, IsActive
                    FROM Pricebook2
                    WHERE IsStandard = true
                    LIMIT 1
                ];

                if(!std.IsActive){
                    std.IsActive = true;
                    update std;
                    System.debug('Activated Standard Pricebook');
                }

                opp.Pricebook2Id = std.Id;
                update opp;

                System.debug('Assigned Standard Pricebook: ' + std.Id);
            }

            /* =============================
               COLLECT PRODUCT IDS
            ============================= */

            Set<Id> productIds = new Set<Id>();

            for(OLIWrapper i : items){
                if(i.quantity != null && i.quantity > 0){
                    productIds.add(i.productId);
                }
            }

            System.debug('ProductIds: ' + productIds);

            if(productIds.isEmpty()){
                res.isError = true;
                res.message = 'No valid products found';
                return res;
            }

            /* =============================
               FETCH PRICEBOOK ENTRIES
            ============================= */

            Map<Id, PricebookEntry> pbeMap = new Map<Id, PricebookEntry>();

            for(PricebookEntry pbe : [
                SELECT Id, Product2Id, UnitPrice
                FROM PricebookEntry
                WHERE Product2Id IN :productIds
                AND Pricebook2Id = :opp.Pricebook2Id
                AND IsActive = true
            ]){
                pbeMap.put(pbe.Product2Id, pbe);
            }

            System.debug('PBE Map: ' + pbeMap);

            if(pbeMap.isEmpty()){
                res.isError = true;
                res.message = 'No PricebookEntry found for selected products';
                return res;
            }

            /* =============================
               CREATE LINE ITEMS (NO MERGE)
            ============================= */

            List<OpportunityLineItem> insertList = new List<OpportunityLineItem>();

            for(OLIWrapper i : items){

                if(i.quantity == null || i.quantity == 0){
                    continue;
                }

                PricebookEntry pbe = pbeMap.get(i.productId);

                if(pbe == null){
                    System.debug('Skipping product (no PBE): ' + i.productId);
                    continue;
                }

                OpportunityLineItem oli = new OpportunityLineItem();

                oli.OpportunityId    = opportunityId;
                oli.PricebookEntryId = pbe.Id;
                oli.Quantity         = i.quantity;
                oli.UnitPrice        = pbe.UnitPrice;

                insertList.add(oli);
            }

            /* =============================
               INSERT RECORDS
            ============================= */

            if(!insertList.isEmpty()){
                insert insertList;
            }

            System.debug('Inserted Line Items Count: ' + insertList.size());

            res.message = 'Products added successfully as separate line items';

        } catch(Exception e){

            System.debug('ERROR: ' + e.getMessage());

            res.isError = true;
            res.message = e.getMessage();
        }

        System.debug('===== END createOpportunityLineItems =====');

        return res;
    }

    /* =========================================================
       WRAPPERS
    ========================================================= */

    public class OLIWrapper{
        public Id productId;
        public Integer quantity;
        public String description;
        public Decimal price;
        public String sku;
    }

    public class ResponseWrapper{
        @AuraEnabled public Boolean isError = false;
        @AuraEnabled public String message;
    }
}