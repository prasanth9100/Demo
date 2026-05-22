public with sharing class BrowseCatalogController {

    /* ==============================
       GET OPPORTUNITY PRICEBOOK
    ============================== */
    @AuraEnabled
    public static PricebookWrapper getOpportunityPricebook(Id opportunityId){

        System.debug('==== GET OPPORTUNITY PRICEBOOK START ====');
        System.debug('OpportunityId: ' + opportunityId);

        PricebookWrapper res = new PricebookWrapper();

        try{

            // Opportunity opp = [
            //     SELECT Id, Pricebook2Id
            //     FROM Opportunity
            //     WHERE Id = :opportunityId
            //     LIMIT 1
            // ]; 
            List<Opportunity> oppList = [
    SELECT Id, Pricebook2Id
    FROM Opportunity
    WHERE Id = :opportunityId
    LIMIT 1
];

if(oppList.isEmpty()){
    return new PricebookWrapper();
}

Opportunity opp = oppList[0];

            System.debug('Opportunity Found: ' + opp);

            if(opp.Pricebook2Id != null){

                Pricebook2 pb = [
                    SELECT Id, Name
                    FROM Pricebook2
                    WHERE Id = :opp.Pricebook2Id
                    LIMIT 1
                ];

                res.pricebookId = pb.Id;
                res.pricebookName = pb.Name;

                System.debug('Pricebook Found: ' + pb.Name);

            } else {

                System.debug('No Pricebook assigned to Opportunity');
            }

        }catch(Exception e){

            System.debug('ERROR in getOpportunityPricebook: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }

        System.debug('Returning Wrapper: ' + res);
        System.debug('==== GET OPPORTUNITY PRICEBOOK END ====');

        return res;
    }


    /* ==============================
       GET ACTIVE PRICEBOOKS
    ============================== */
    @AuraEnabled(cacheable=true)
    public static List<Pricebook2> getActivePricebooks(){

        System.debug('Fetching Active Pricebooks');

        return [
            SELECT Id, Name
            FROM Pricebook2
            WHERE IsActive = true
            ORDER BY Name
        ];
    }


   @AuraEnabled
public static void assignPricebook(Id opportunityId, Id pricebookId){

    System.debug('==== ASSIGN PRICEBOOK START ====');

    try{

        // 🔥 GET EXISTING OPP
        Opportunity opp = [
            SELECT Id, Pricebook2Id
            FROM Opportunity
            WHERE Id = :opportunityId
            LIMIT 1
        ];

        // 🔥 IF SAME PRICEBOOK → SKIP
        if(opp.Pricebook2Id == pricebookId){
            System.debug('Same pricebook already assigned');
            return;
        }

        // 🔥 DELETE EXISTING PRODUCTS (IMPORTANT)
        List<OpportunityLineItem> olis = [
            SELECT Id FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];

        if(!olis.isEmpty()){
            delete olis;
            System.debug('Deleted existing products');
        }

        // 🔥 ASSIGN NEW PRICEBOOK
        opp.Pricebook2Id = pricebookId;
        update opp;

        System.debug('Pricebook assigned successfully');

    }catch(Exception e){

        System.debug('ERROR: ' + e.getMessage());
        throw new AuraHandledException(e.getMessage());
    }

    System.debug('==== ASSIGN PRICEBOOK END ====');
}
    /* ==============================
       GET CATALOGS
    ============================== */
    @AuraEnabled(cacheable=true)
    public static List<CatalogService.CatalogWrapper> getCatalogs(){

        System.debug('Fetching Catalogs');

        return CatalogService.getCatalogs();
    }


    /* ==============================
       GET CATEGORIES
    ============================== */
    @AuraEnabled(cacheable=true)
    public static List<ProductCategory> getCategories(Id catalogId){

        System.debug('Fetching Categories for CatalogId: ' + catalogId);

        return CategoryService.getCategories(catalogId);
    }


    /* ==============================
       GET PRODUCTS (WITH PRICEBOOK)
    ============================== */
    @AuraEnabled(cacheable=true)
    public static List<ProductService.ProductWrapper> getProducts(
        Id catalogId,
        Id categoryId,
        Id pricebookId,
        String searchKey,
        Integer pageSize,
        Integer pageNumber
    ){

        System.debug('==== GET PRODUCTS START ====');
        System.debug('CatalogId: ' + catalogId);
        System.debug('CategoryId: ' + categoryId);
        System.debug('PricebookId: ' + pricebookId);

        return ProductService.getProducts(
            catalogId,
            categoryId,
            pricebookId,
            searchKey,
            pageSize,
            pageNumber
        );
    }


    /* ==============================
       PRODUCT CONFIG
    ============================== */
    @AuraEnabled(cacheable=true)
    public static ConfigurationService.ProductConfigWrapper getProductConfig(Id productId){

        System.debug('Fetching Product Config for ProductId: ' + productId);

        return ConfigurationService.getProductConfig(productId);
    }


    /* ==============================
       SAVE PRODUCTS (OLI)
    ============================== */
    @AuraEnabled
    public static OpportunityProductService.ResponseWrapper saveProducts(
        Id opportunityId,
        String itemsJson
    ){

        System.debug('==== SAVE PRODUCTS START ====');
        System.debug('OpportunityId: ' + opportunityId);
        System.debug('ItemsJson: ' + itemsJson);

        return OpportunityProductService.createOpportunityLineItems(
            opportunityId,
            itemsJson
        );
    }


    /* ==============================
       WRAPPER
    ============================== */
    public class PricebookWrapper{

        @AuraEnabled public Id pricebookId;
        @AuraEnabled public String pricebookName;

    }
}