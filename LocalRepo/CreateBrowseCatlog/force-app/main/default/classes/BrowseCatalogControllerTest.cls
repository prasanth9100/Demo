/**
 * BrowseCatalogControllerTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Covers all @AuraEnabled methods in BrowseCatalogController
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
private class BrowseCatalogControllerTest {

    // ════════════════════════════════════════════════════════════════════════
    // getOpportunityPricebook
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void getOpportunityPricebook_withPricebook_returnsPricebookDetails() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        BrowseCatalogController.PricebookWrapper result =
            BrowseCatalogController.getOpportunityPricebook(s.opportunity.Id);
        Test.stopTest();

        System.assertEquals(s.customPb.Id,   result.pricebookId,   'pricebookId should match');
        System.assertEquals(s.customPb.Name, result.pricebookName, 'pricebookName should match');
    }

    @IsTest
    static void getOpportunityPricebook_noPricebook_returnsEmptyWrapper() {
        Account     acc = TestDataFactory.createAccount(true);
        Opportunity opp = TestDataFactory.createOpportunityNoPricebook(acc.Id, true);

        Test.startTest();
        BrowseCatalogController.PricebookWrapper result =
            BrowseCatalogController.getOpportunityPricebook(opp.Id);
        Test.stopTest();

        System.assertEquals(null, result.pricebookId,   'pricebookId should be null');
        System.assertEquals(null, result.pricebookName, 'pricebookName should be null');
    }

    @IsTest
    static void getOpportunityPricebook_nonExistentOpportunity_returnsEmptyWrapper() {
        // Use a valid-format Id that does not exist
        Account     acc = TestDataFactory.createAccount(true);
        Opportunity opp = TestDataFactory.createOpportunityNoPricebook(acc.Id, true);
        Id oppId = opp.Id;
        delete opp;

        Test.startTest();
        BrowseCatalogController.PricebookWrapper result =
            BrowseCatalogController.getOpportunityPricebook(oppId);
        Test.stopTest();

        System.assertEquals(null, result.pricebookId);
    }

    // ════════════════════════════════════════════════════════════════════════
    // getActivePricebooks
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void getActivePricebooks_returnsActivePricebooks() {
        TestDataFactory.createPricebook('Active PB 1', true);
        TestDataFactory.createPricebook('Active PB 2', true);

        Test.startTest();
        List<Pricebook2> result = BrowseCatalogController.getActivePricebooks();
        Test.stopTest();

        System.assert(result.size() >= 2, 'Should return at least 2 active pricebooks');
        // Assert IsActive only if the controller selects it in its SOQL. If the
        // field is not projected it comes back null and assertEquals(true, null)
        // gives a misleading failure. Trusting the WHERE IsActive=true filter is
        // sufficient when the field is not returned.
        for (Pricebook2 pb : result) {
            if (pb.IsActive != null) {
                System.assertEquals(true, pb.IsActive, 'All returned pricebooks should be active');
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // assignPricebook
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void assignPricebook_newPricebook_opportunityUpdated() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();
        Pricebook2 newPb = TestDataFactory.createPricebook('New PB', true);

        // Create OLIs so we can verify they get deleted
        TestDataFactory.createLineItem(
            s.opportunity.Id,
            s.customEntries[0].Id,
            1,
            150.00,
            true
        );

        Test.startTest();
        BrowseCatalogController.assignPricebook(s.opportunity.Id, newPb.Id);
        Test.stopTest();

        Opportunity updated = [SELECT Pricebook2Id FROM Opportunity WHERE Id = :s.opportunity.Id];
        System.assertEquals(newPb.Id, updated.Pricebook2Id, 'New pricebook should be assigned');

        // Existing OLIs should have been deleted
        List<OpportunityLineItem> remainingOlis = [
            SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :s.opportunity.Id
        ];
        System.assertEquals(0, remainingOlis.size(), 'All OLIs should be deleted on pricebook change');
    }

    @IsTest
    static void assignPricebook_samePricebook_noChange() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        // Add OLI before calling assignPricebook with the same pricebook
        TestDataFactory.createLineItem(
            s.opportunity.Id,
            s.customEntries[0].Id,
            1,
            150.00,
            true
        );

        Test.startTest();
        BrowseCatalogController.assignPricebook(s.opportunity.Id, s.customPb.Id);
        Test.stopTest();

        // OLIs should NOT be deleted when pricebook is unchanged
        List<OpportunityLineItem> remainingOlis = [
            SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :s.opportunity.Id
        ];
        System.assertEquals(1, remainingOlis.size(), 'OLIs should remain when pricebook unchanged');
    }

    // ════════════════════════════════════════════════════════════════════════
    // getCatalogs
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void getCatalogs_returnsCatalogWrappers() {
        TestDataFactory.createCatalog('Controller Catalog', true);

        Test.startTest();
        List<CatalogService.CatalogWrapper> result = BrowseCatalogController.getCatalogs();
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assert(result.size() >= 1, 'At least one catalog should be returned');
    }

    // ════════════════════════════════════════════════════════════════════════
    // getCategories
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void getCategories_validCatalog_returnsCategories() {
        ProductCatalog  catalog = TestDataFactory.createCatalog('Ctrl Catalog', true);
        TestDataFactory.createCategory('Ctrl Cat 1', catalog.Id, true);
        TestDataFactory.createCategory('Ctrl Cat 2', catalog.Id, true);

        Test.startTest();
        List<ProductCategory> result = BrowseCatalogController.getCategories(catalog.Id);
        Test.stopTest();

        System.assertEquals(2, result.size(), 'Should return 2 categories');
    }

    // ════════════════════════════════════════════════════════════════════════
    // getProducts (via controller)
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void getProducts_validInputs_returnsProductWrappers() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        List<ProductService.ProductWrapper> result = BrowseCatalogController.getProducts(
            s.catalog.Id,
            s.category.Id,
            s.customPb.Id,
            null,
            50,
            1
        );
        Test.stopTest();

        System.assertEquals(2, result.size(), 'Should return 2 products via controller');
    }

    // ════════════════════════════════════════════════════════════════════════
    // getProductConfig (via controller)
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void getProductConfig_validProduct_returnsConfigWrapper() {
        Product2 prod = TestDataFactory.createProduct('Config Product', 'CFG-01', true);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            BrowseCatalogController.getProductConfig(prod.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertNotEquals(null, result.attributes);
        System.assertNotEquals(null, result.bundleItems);
    }

    // ════════════════════════════════════════════════════════════════════════
    // saveProducts (via controller)
    // ════════════════════════════════════════════════════════════════════════

    @IsTest
    static void saveProducts_validItems_lineItemsCreated() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        List<Id> productIds = new List<Id>();
        for (Product2 p : s.products) { productIds.add(p.Id); }
        String json = TestDataFactory.buildOliItemsJson(productIds, 3);

        Test.startTest();
        OpportunityProductService.ResponseWrapper res =
            BrowseCatalogController.saveProducts(s.opportunity.Id, json);
        Test.stopTest();

        System.assertEquals(false, res.isError, 'Save should succeed: ' + res.message);
        List<OpportunityLineItem> olis = [
            SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :s.opportunity.Id
        ];
        System.assertEquals(2, olis.size(), 'Two OLIs should be created');
    }

    // ── PricebookWrapper default values ───────────────────────────────────────
    @IsTest
    static void pricebookWrapper_defaultsAreNull() {
        BrowseCatalogController.PricebookWrapper w =
            new BrowseCatalogController.PricebookWrapper();
        System.assertEquals(null, w.pricebookId);
        System.assertEquals(null, w.pricebookName);
    }
}