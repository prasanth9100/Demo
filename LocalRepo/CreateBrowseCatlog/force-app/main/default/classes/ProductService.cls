public with sharing class ProductService {

    @AuraEnabled(cacheable=false)
    public static List<ProductWrapper> getProducts(
        Id catalogId,
        Id categoryId,
        Id pricebookId,
        String searchKey,
        Integer pageSize,
        Integer pageNumber
    ){

        // searchKey = String.isBlank(searchKey) ? '' : searchKey;
String likeKey = String.isBlank(searchKey) ? '%' : '%' + searchKey + '%';
        List<ProductCategoryProduct> links;

        /* ============================
           FETCH PRODUCTS
        ============================ */
        if(categoryId != null){
            // links = [
            //     SELECT ProductId,
            //            ProductCategoryId,
            //            Product.Name,
            //            Product.ProductCode,
            //            Product.DisplayUrl,
            //            Product.Description
            //     FROM ProductCategoryProduct
            //     WHERE ProductCategory.CatalogId = :catalogId
            //     AND ProductCategoryId = :categoryId
            //     LIMIT 10000
            // ];
            links = [
    SELECT ProductId,
           ProductCategoryId,
           Product.Name,
           Product.ProductCode,
           Product.DisplayUrl,
           Product.Description
    FROM ProductCategoryProduct
    WHERE ProductCategory.CatalogId = :catalogId
    AND ProductCategoryId = :categoryId
    AND (Product.Name LIKE :likeKey OR Product.ProductCode LIKE :likeKey)
    LIMIT 10000
];
        } else {
            // links = [
            //     SELECT ProductId,
            //            ProductCategoryId,
            //            Product.Name,
            //            Product.ProductCode,
            //            Product.Description,
            //            Product.DisplayUrl
            //     FROM ProductCategoryProduct
            //     WHERE ProductCategory.CatalogId = :catalogId
            //     LIMIT :pageSize
            // ];
            links = [
    SELECT ProductId,
           ProductCategoryId,
           Product.Name,
           Product.ProductCode,
           Product.Description,
           Product.DisplayUrl
    FROM ProductCategoryProduct
    WHERE ProductCategory.CatalogId = :catalogId
    AND (Product.Name LIKE :likeKey OR Product.ProductCode LIKE :likeKey)
    LIMIT :pageSize
];
        }

        /* ============================
           COLLECT PRODUCT IDS + CATEGORY IDS
        ============================ */
        Set<Id> productIds  = new Set<Id>();
        Set<Id> catIds      = new Set<Id>();

        for(ProductCategoryProduct l : links){
            productIds.add(l.ProductId);
            catIds.add(l.ProductCategoryId);
        }

        /* ============================
           PRICE MAP
        ============================ */
        Map<Id, Decimal> priceMap = new Map<Id, Decimal>();

        if(!productIds.isEmpty() && pricebookId != null){
            for(PricebookEntry pbe : [
                SELECT Product2Id, UnitPrice
                FROM PricebookEntry
                WHERE Product2Id IN :productIds
                AND Pricebook2Id = :pricebookId
                AND IsActive = true
            ]){
                priceMap.put(pbe.Product2Id, pbe.UnitPrice);
            }
        }

        /* ============================
           QUALIFICATION MAP
           Object : ProductCategoryQualification
           Lookup : Category (Lookup to ProductCategory)
           Id field in SOQL: CategoryId
        ============================ */
        Map<Id, Boolean> qualifiedMap = new Map<Id, Boolean>();

        if(!catIds.isEmpty()){
            for(ProductCategoryQualification pcq : [
                SELECT CategoryId, IsQualified
                FROM ProductCategoryQualification
                WHERE CategoryId IN :catIds
            ]){
                qualifiedMap.put(pcq.CategoryId, pcq.IsQualified == true);
            }
        }

        /* ============================
           DISQUALIFICATION MAP
           Object : ProductCategoryDisqual
           Lookup : Category (Lookup to ProductCategory)
           Id field in SOQL: CategoryId
        ============================ */
        Map<Id, Boolean> disqualifiedMap = new Map<Id, Boolean>();

        if(!catIds.isEmpty()){
            for(ProductCategoryDisqual pcd : [
                SELECT CategoryId, IsDisqualified
                FROM ProductCategoryDisqual
                WHERE CategoryId IN :catIds
            ]){
                disqualifiedMap.put(pcd.CategoryId, pcd.IsDisqualified == true);
            }
        }

        /* ============================
           BUILD RESULT
        ============================ */
        List<ProductWrapper> results = new List<ProductWrapper>();

        for(ProductCategoryProduct l : links){

            ProductWrapper p = new ProductWrapper();
            p.productId   = l.ProductId;
            p.name        = l.Product.Name;
            p.productCode = l.Product.ProductCode;
            p.description = l.Product.Description;
            p.displayUrl  = l.Product.DisplayUrl;
            p.quantity    = 1;

            Decimal price = 0;
            if(priceMap.containsKey(l.ProductId)){
                price = priceMap.get(l.ProductId);
            } else {
                List<PricebookEntry> fallback = [
                    SELECT UnitPrice
                    FROM PricebookEntry
                    WHERE Product2Id = :l.ProductId
                    AND IsActive = true
                    LIMIT 1
                ];
                if(!fallback.isEmpty()){
                    price = fallback[0].UnitPrice;
                }
            }
            p.price = price;

            p.isQualified    = qualifiedMap.containsKey(l.ProductCategoryId)
                                ? qualifiedMap.get(l.ProductCategoryId)
                                : false;

            p.isDisqualified = disqualifiedMap.containsKey(l.ProductCategoryId)
                                ? disqualifiedMap.get(l.ProductCategoryId)
                                : false;

            results.add(p);
        }

        return results;
    }
    /**
 * Returns the unit price of a product from a given pricebook.
 * Used by productList.js when recursively decomposing bundle children
 * so that each leaf product carries its real pricebook price.
 *
 * @param productId   – Product2 Id
 * @param pricebookId – Pricebook2 Id
 * @return            – UnitPrice (Decimal) or 0 if no entry found
 */
@AuraEnabled(cacheable=true)
public static Decimal getProductPrice(String productId, String pricebookId) {
    try {
        List<PricebookEntry> entries = [
            SELECT UnitPrice
            FROM   PricebookEntry
            WHERE  Product2Id  = :productId
            AND    Pricebook2Id = :pricebookId
            AND    IsActive     = true
            LIMIT  1
        ];
        return entries.isEmpty() ? 0 : entries[0].UnitPrice;
    } catch (Exception e) {
        return 0;
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// ADD this method to your existing ProductService Apex class.
// Replaces the single getProductPrice() method from previous versions.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Batch-fetches unit prices for multiple products from a pricebook in ONE query.
 * Returns a Map<String, Decimal> of productId → UnitPrice.
 * Products with no pricebook entry return 0 (they won't appear in the map).
 *
 * @param productIds  – List of Product2 Ids
 * @param pricebookId – Pricebook2 Id
 * @return            – Map<String, Decimal>  productId → UnitPrice
 */
@AuraEnabled(cacheable=true)
public static Map<String, Decimal> getProductPrices(List<String> productIds, String pricebookId) {
    Map<String, Decimal> result = new Map<String, Decimal>();
    if (productIds == null || productIds.isEmpty() || String.isBlank(pricebookId)) {
        return result;
    }
    for (PricebookEntry pbe : [
        SELECT Product2Id, UnitPrice
        FROM   PricebookEntry
        WHERE  Product2Id   IN :productIds
        AND    Pricebook2Id  = :pricebookId
        AND    IsActive      = true
    ]) {
        result.put(pbe.Product2Id, pbe.UnitPrice);
    }
    return result;
}


    /* ============================
       WRAPPER
    ============================ */
    public class ProductWrapper {
        @AuraEnabled public Id      productId;
        @AuraEnabled public String  name;
        @AuraEnabled public String  productCode;
        @AuraEnabled public String  description;
        @AuraEnabled public Decimal price;
        @AuraEnabled public Integer quantity;
        @AuraEnabled public String  displayUrl;
        @AuraEnabled public Boolean isQualified;
        @AuraEnabled public Boolean isDisqualified;
    }
}