/**
 * OpportunityProductServiceTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Covers OpportunityProductService.createOpportunityLineItems(...)
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
private class OpportunityProductServiceTest {

    // ── happy path: line items created successfully ───────────────────────────
    @IsTest
    static void createOLIs_validItems_lineItemsInserted() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        List<Id> productIds = new List<Id>();
        for (Product2 p : s.products) { productIds.add(p.Id); }
        String json = TestDataFactory.buildOliItemsJson(productIds, 2);

        Test.startTest();
        OpportunityProductService.ResponseWrapper res =
            OpportunityProductService.createOpportunityLineItems(s.opportunity.Id, json);
        Test.stopTest();

        System.assertEquals(false, res.isError, 'Should succeed: ' + res.message);
        List<OpportunityLineItem> olis = [
            SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :s.opportunity.Id
        ];
        System.assertEquals(2, olis.size(), 'Two line items should be inserted');
    }

    // ── empty JSON → error response ───────────────────────────────────────────
    @IsTest
    static void createOLIs_emptyJson_returnsError() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();
        String emptyJson = '[]';

        Test.startTest();
        OpportunityProductService.ResponseWrapper res =
            OpportunityProductService.createOpportunityLineItems(s.opportunity.Id, emptyJson);
        Test.stopTest();

        System.assertEquals(true, res.isError, 'Should return error for empty list');
    }

    // ── zero quantity items are skipped ───────────────────────────────────────
    @IsTest
    static void createOLIs_zeroQuantityItems_skipped() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        List<Id> productIds = new List<Id>{ s.products[0].Id };
        String json = TestDataFactory.buildOliItemsJson(productIds, 0);  // qty = 0

        Test.startTest();
        OpportunityProductService.ResponseWrapper res =
            OpportunityProductService.createOpportunityLineItems(s.opportunity.Id, json);
        Test.stopTest();

        // No valid products → service returns error
        System.assertEquals(true, res.isError, 'Zero qty items should result in error');
        List<OpportunityLineItem> olis = [
            SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :s.opportunity.Id
        ];
        System.assertEquals(0, olis.size(), 'No OLIs should be inserted for qty 0');
    }

    // ── opportunity with no pricebook → standard pricebook auto-assigned ─────
    @IsTest
    static void createOLIs_opportunityNoPricebook_standardPricebookAssigned() {
        Account acc     = TestDataFactory.createAccount(true);
        Opportunity opp = TestDataFactory.createOpportunityNoPricebook(acc.Id, true);

        Pricebook2 std      = TestDataFactory.getStandardPricebook();
        Product2   prod     = TestDataFactory.createProduct('Auto PB Product', 'AUTO-01', true);
        TestDataFactory.createPricebookEntry(std.Id, prod.Id, 99.99, true);

        List<Id> productIds = new List<Id>{ prod.Id };
        String json = TestDataFactory.buildOliItemsJson(productIds, 1);

        Test.startTest();
        OpportunityProductService.ResponseWrapper res =
            OpportunityProductService.createOpportunityLineItems(opp.Id, json);
        Test.stopTest();

        Opportunity updatedOpp = [SELECT Pricebook2Id FROM Opportunity WHERE Id = :opp.Id];
        System.assertEquals(std.Id, updatedOpp.Pricebook2Id,
            'Standard pricebook should be assigned to the opportunity');
        System.assertEquals(false, res.isError, 'Should succeed: ' + res.message);
    }

    // ── product with no PBE in the pricebook is skipped ──────────────────────
    @IsTest
    static void createOLIs_productNotInPricebook_returnsError() {
        Account     acc    = TestDataFactory.createAccount(true);
        Pricebook2  pb     = TestDataFactory.createPricebook('Isolated PB', true);
        Opportunity opp    = TestDataFactory.createOpportunity(acc.Id, pb.Id, true);
        Product2    prod   = TestDataFactory.createProduct('No PBE Product', 'NOPBE-01', true);
        // Intentionally NOT creating a PricebookEntry for this product in pb

        List<Id> productIds = new List<Id>{ prod.Id };
        String json = TestDataFactory.buildOliItemsJson(productIds, 1);

        Test.startTest();
        OpportunityProductService.ResponseWrapper res =
            OpportunityProductService.createOpportunityLineItems(opp.Id, json);
        Test.stopTest();

        System.assertEquals(true, res.isError,
            'Should error when no PricebookEntry exists for the product');
    }

    // ── ResponseWrapper default isError is false ─────────────────────────────
    @IsTest
    static void responseWrapper_defaultIsErrorFalse() {
        OpportunityProductService.ResponseWrapper rw =
            new OpportunityProductService.ResponseWrapper();
        System.assertEquals(false, rw.isError, 'Default isError should be false');
    }
}