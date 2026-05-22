public with sharing class BundleService {

    @AuraEnabled(cacheable=true)
    public static List<ProductRelatedComponent> getBundleItems(Id productId){

        return[
            SELECT Id,
                   ChildProductId,
                   ChildProduct.Name,
                   MinQuantity,
                   MaxQuantity
            FROM ProductRelatedComponent
            WHERE ParentProductId=:productId
        ];
    }
    @AuraEnabled
public static List<OpportunityLineItem> createFlatBundleProducts(
    Id opportunityId,
    Id parentProductId,
    Decimal parentQty
){
    List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();

    // 🔹 1. Get Parent PricebookEntry
    PricebookEntry parentPBE = [
        SELECT Id, UnitPrice 
        FROM PricebookEntry 
        WHERE Product2Id = :parentProductId 
        LIMIT 1
    ];

    // 🔹 2. Add Parent as NORMAL PRODUCT (NOT BUNDLE)
    oliList.add(new OpportunityLineItem(
        OpportunityId = opportunityId,
        PricebookEntryId = parentPBE.Id,
        Quantity = parentQty,
        UnitPrice = parentPBE.UnitPrice
    ));

    // 🔹 3. Get Child Products
    List<ProductRelatedComponent> components = [
        SELECT ChildProductId,
               MinQuantity
        FROM ProductRelatedComponent
        WHERE ParentProductId = :parentProductId
    ];

    Set<Id> childIds = new Set<Id>();
    for(ProductRelatedComponent comp : components){
        childIds.add(comp.ChildProductId);
    }

    // 🔹 4. Get PricebookEntries for children
    Map<Id, PricebookEntry> pbeMap = new Map<Id, PricebookEntry>(
        [SELECT Id, Product2Id, UnitPrice 
         FROM PricebookEntry 
         WHERE Product2Id IN :childIds]
    );

    // 🔹 5. Add ALL children as separate OLIs
    for(ProductRelatedComponent comp : components){

        PricebookEntry childPBE = pbeMap.get(comp.ChildProductId);

        Decimal childQty = (comp.MinQuantity == null ? 1 : comp.MinQuantity);

        oliList.add(new OpportunityLineItem(
            OpportunityId = opportunityId,
            PricebookEntryId = childPBE.Id,
            Quantity = parentQty * childQty,
            UnitPrice = childPBE.UnitPrice
        ));
    }

    return oliList;
}
}