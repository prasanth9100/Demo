/**
 * TestDataFactory
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised factory for all test data used across:
 *   - BrowseCatalogControllerTest
 *   - CatalogServiceTest
 *   - CategoryServiceTest
 *   - ConfigurationServiceTest
 *   - ProductServiceTest
 *   - OpportunityProductServiceTest
 *
 * Every method is static.  Call individual create* methods as needed, or call
 * createFullScenario() to get a fully wired-up scenario in one shot.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
public class TestDataFactory {

    // ─────────────────────────────────────────────────────────────────────────
    // ACCOUNT
    // ─────────────────────────────────────────────────────────────────────────
    public static Account createAccount(Boolean doInsert) {
        Account acc = new Account(Name = 'Test Account');
        if (doInsert) insert acc;
        return acc;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRICEBOOK
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Returns the Standard Pricebook using Test.getStandardPricebookId() —
     * the correct approach inside @IsTest context. Querying WHERE IsStandard = true
     * can return 0 rows in some scratch-org / partial-copy configurations and
     * always throws when SeeAllData = false (the default). This method never
     * throws a QueryException.
     */
    public static Pricebook2 getStandardPricebook() {
        // FIX 1: Test.getStandardPricebookId() is the safe, test-context API.
        // Do NOT query [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1]
        // — that query requires SeeAllData=true and can return 0 rows.
        Id stdId = Test.getStandardPricebookId();
        return new Pricebook2(Id = stdId, IsActive = true);
    }

    /** Create and insert a custom (non-standard) active Pricebook. */
    public static Pricebook2 createPricebook(String name, Boolean doInsert) {
        Pricebook2 pb = new Pricebook2(Name = name, IsActive = true);
        if (doInsert) insert pb;
        return pb;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPPORTUNITY
    // ─────────────────────────────────────────────────────────────────────────
    public static Opportunity createOpportunity(Id accountId, Id pricebookId, Boolean doInsert) {
        Opportunity opp = new Opportunity(
            Name         = 'Test Opportunity',
            StageName    = 'Prospecting',
            CloseDate    = Date.today().addDays(30),
            AccountId    = accountId,
            Pricebook2Id = pricebookId
        );
        if (doInsert) insert opp;
        return opp;
    }

    /** Convenience – opportunity without a pricebook assigned. */
    public static Opportunity createOpportunityNoPricebook(Id accountId, Boolean doInsert) {
        return createOpportunity(accountId, null, doInsert);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT (Product2)
    // ─────────────────────────────────────────────────────────────────────────
    public static Product2 createProduct(String name, String productCode, Boolean doInsert) {
        Product2 prod = new Product2(
            Name        = name,
            ProductCode = productCode,
            IsActive    = true
        );
        if (doInsert) insert prod;
        return prod;
    }

    /** Create a list of N products in bulk. */
    public static List<Product2> createProducts(Integer count, Boolean doInsert) {
        List<Product2> prods = new List<Product2>();
        for (Integer i = 1; i <= count; i++) {
            prods.add(new Product2(
                Name        = 'Product ' + i,
                ProductCode = 'PROD-' + i,
                IsActive    = true
            ));
        }
        if (doInsert) insert prods;
        return prods;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRICEBOOK ENTRY
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Creates a PricebookEntry for a product in a given pricebook.
     *
     * FIX 2: The original method called getStandardPricebook() (which queried
     * the DB) and then did a follow-up SELECT to retrieve the standard entry.
     * Both queries throw when SeeAllData = false.
     *
     * Fix: use Test.getStandardPricebookId() via getStandardPricebook(), build
     * the standard PBE with an in-memory Id reference, and avoid any bare
     * single-row SELECT that can return 0 rows.
     */
    public static PricebookEntry createPricebookEntry(
        Id pricebookId,
        Id productId,
        Decimal unitPrice,
        Boolean doInsert
    ) {
        Id stdId = Test.getStandardPricebookId();

        // FIX 3: Use a List query + isEmpty() guard instead of a bare SObject
        // query that throws when the row doesn't exist yet.
        List<PricebookEntry> existing = [
            SELECT Id, Product2Id, UnitPrice, Pricebook2Id
            FROM PricebookEntry
            WHERE Product2Id = :productId AND Pricebook2Id = :stdId
            LIMIT 1
        ];

        PricebookEntry stdPbe;
        if (existing.isEmpty()) {
            stdPbe = new PricebookEntry(
                Pricebook2Id = stdId,
                Product2Id   = productId,
                UnitPrice    = unitPrice,
                IsActive     = true
            );
            insert stdPbe;
        } else {
            stdPbe = existing[0];
        }

        if (pricebookId == stdId) {
            return stdPbe;
        }

        PricebookEntry pbe = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id   = productId,
            UnitPrice    = unitPrice,
            IsActive     = true
        );
        if (doInsert) insert pbe;
        return pbe;
    }

    /** Bulk – creates entries for a list of products in one pricebook. */
    public static List<PricebookEntry> createPricebookEntries(
        Id pricebookId,
        List<Product2> products,
        Decimal unitPrice,
        Boolean doInsert
    ) {
        // FIX 4: Use Test.getStandardPricebookId() — same reason as above.
        Id stdId = Test.getStandardPricebookId();

        // Standard entries first
        List<PricebookEntry> stdEntries = new List<PricebookEntry>();
        for (Product2 p : products) {
            stdEntries.add(new PricebookEntry(
                Pricebook2Id = stdId,
                Product2Id   = p.Id,
                UnitPrice    = unitPrice,
                IsActive     = true
            ));
        }
        insert stdEntries;

        if (pricebookId == stdId) {
            return stdEntries;
        }

        List<PricebookEntry> customEntries = new List<PricebookEntry>();
        for (Product2 p : products) {
            customEntries.add(new PricebookEntry(
                Pricebook2Id = pricebookId,
                Product2Id   = p.Id,
                UnitPrice    = unitPrice,
                IsActive     = true
            ));
        }
        if (doInsert) insert customEntries;
        return customEntries;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT CATALOG
    // ─────────────────────────────────────────────────────────────────────────
    public static ProductCatalog createCatalog(String name, Boolean doInsert) {
        ProductCatalog cat = new ProductCatalog(Name = name);
        if (doInsert) insert cat;
        return cat;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT CATEGORY
    // ─────────────────────────────────────────────────────────────────────────
    public static ProductCategory createCategory(String name, Id catalogId, Boolean doInsert) {
        ProductCategory cat = new ProductCategory(
            Name      = name,
            CatalogId = catalogId
        );
        if (doInsert) insert cat;
        return cat;
    }

    public static ProductCategory createChildCategory(
        String name,
        Id catalogId,
        Id parentCategoryId,
        Boolean doInsert
    ) {
        ProductCategory cat = new ProductCategory(
            Name             = name,
            CatalogId        = catalogId,
            ParentCategoryId = parentCategoryId
        );
        if (doInsert) insert cat;
        return cat;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT CATEGORY PRODUCT
    // ─────────────────────────────────────────────────────────────────────────
    public static ProductCategoryProduct linkProductToCategory(
        Id productId,
        Id categoryId,
        Boolean doInsert
    ) {
        ProductCategoryProduct link = new ProductCategoryProduct(
            ProductId         = productId,
            ProductCategoryId = categoryId
        );
        if (doInsert) insert link;
        return link;
    }

    public static List<ProductCategoryProduct> linkProductsToCategory(
        List<Product2> products,
        Id categoryId,
        Boolean doInsert
    ) {
        List<ProductCategoryProduct> links = new List<ProductCategoryProduct>();
        for (Product2 p : products) {
            links.add(new ProductCategoryProduct(
                ProductId         = p.Id,
                ProductCategoryId = categoryId
            ));
        }
        if (doInsert) insert links;
        return links;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPPORTUNITY LINE ITEM
    // ─────────────────────────────────────────────────────────────────────────
    public static OpportunityLineItem createLineItem(
        Id opportunityId,
        Id pricebookEntryId,
        Integer quantity,
        Decimal unitPrice,
        Boolean doInsert
    ) {
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId    = opportunityId,
            PricebookEntryId = pricebookEntryId,
            Quantity         = quantity,
            UnitPrice        = unitPrice
        );
        if (doInsert) insert oli;
        return oli;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OLI JSON BUILDER  (for OpportunityProductService)
    // ─────────────────────────────────────────────────────────────────────────
    public static String buildOliItemsJson(List<Id> productIds, Integer quantity) {
        List<Map<String, Object>> items = new List<Map<String, Object>>();
        for (Id pid : productIds) {
            items.add(new Map<String, Object>{
                'productId'   => pid,
                'quantity'    => quantity,
                'description' => 'Test item',
                'price'       => 100.00,
                'sku'         => 'SKU-TEST'
            });
        }
        return JSON.serialize(items);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FULL SCENARIO  –  one-call setup wiring everything together
    // ─────────────────────────────────────────────────────────────────────────
    public static ScenarioWrapper createFullScenario() {
        ScenarioWrapper s = new ScenarioWrapper();

        s.account         = createAccount(true);
        s.standardPb      = getStandardPricebook();
        s.customPb        = createPricebook('Test Custom Pricebook', true);
        s.opportunity     = createOpportunity(s.account.Id, s.customPb.Id, true);
        s.products        = createProducts(2, true);
        s.standardEntries = createPricebookEntries(s.standardPb.Id, s.products, 100.00, true);
        s.customEntries   = createPricebookEntries(s.customPb.Id, s.products, 150.00, true);
        s.catalog         = createCatalog('Test Catalog', true);
        s.category        = createCategory('Test Category', s.catalog.Id, true);
        s.categoryLinks   = linkProductsToCategory(s.products, s.category.Id, true);

        return s;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENARIO WRAPPER
    // ─────────────────────────────────────────────────────────────────────────
    public class ScenarioWrapper {
        public Account                      account;
        public Pricebook2                   standardPb;
        public Pricebook2                   customPb;
        public Opportunity                  opportunity;
        public List<Product2>               products;
        public List<PricebookEntry>         standardEntries;
        public List<PricebookEntry>         customEntries;
        public ProductCatalog               catalog;
        public ProductCategory              category;
        public List<ProductCategoryProduct> categoryLinks;
    }
}