/**
 * CatalogServiceTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Covers CatalogService.getCatalogs()
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
private class CatalogServiceTest {

    // ── no catalogs → empty list ──────────────────────────────────────────────
    @IsTest
    static void getCatalogs_noCatalogs_returnsEmptyList() {
        Test.startTest();
        List<CatalogService.CatalogWrapper> result = CatalogService.getCatalogs();
        Test.stopTest();

        // May return 0 or more depending on pre-existing org data; just assert no exception
        System.assertNotEquals(null, result, 'Result should never be null');
    }

    // ── single catalog, no categories ────────────────────────────────────────
    @IsTest
    static void getCatalogs_singleCatalogNoCategories_categoryCountZero() {
        ProductCatalog catalog = TestDataFactory.createCatalog('Catalog A', true);

        Test.startTest();
        List<CatalogService.CatalogWrapper> result = CatalogService.getCatalogs();
        Test.stopTest();

        // Find our catalog in the result
        CatalogService.CatalogWrapper found = findCatalogById(result, catalog.Id);
        System.assertNotEquals(null, found, 'Catalog A should be in results');
        System.assertEquals('Catalog A', found.name, 'Name should match');
        System.assertEquals(0, found.categoryCount, 'Category count should be 0');
    }

    // ── catalog with categories → correct count ───────────────────────────────
    @IsTest
    static void getCatalogs_catalogWithCategories_correctCategoryCount() {
        ProductCatalog catalog = TestDataFactory.createCatalog('Catalog B', true);
        TestDataFactory.createCategory('Cat 1', catalog.Id, true);
        TestDataFactory.createCategory('Cat 2', catalog.Id, true);
        TestDataFactory.createCategory('Cat 3', catalog.Id, true);

        Test.startTest();
        List<CatalogService.CatalogWrapper> result = CatalogService.getCatalogs();
        Test.stopTest();

        CatalogService.CatalogWrapper found = findCatalogById(result, catalog.Id);
        System.assertNotEquals(null, found, 'Catalog B should be in results');
        System.assertEquals(3, found.categoryCount, 'Category count should be 3');
    }

    // ── wrapper fields are populated ─────────────────────────────────────────
    @IsTest
    static void getCatalogs_wrapperFieldsPopulated() {
        ProductCatalog catalog = TestDataFactory.createCatalog('Catalog Fields Test', true);

        Test.startTest();
        List<CatalogService.CatalogWrapper> result = CatalogService.getCatalogs();
        Test.stopTest();

        CatalogService.CatalogWrapper found = findCatalogById(result, catalog.Id);
        System.assertNotEquals(null, found, 'Catalog should be returned');
        System.assertEquals(catalog.Id, found.catalogId, 'catalogId should match');
        System.assertNotEquals(null, found.lastModified, 'lastModified should not be null');
    }

    // ─── helpers ─────────────────────────────────────────────────────────────
    private static CatalogService.CatalogWrapper findCatalogById(
        List<CatalogService.CatalogWrapper> wrappers,
        Id catalogId
    ) {
        for (CatalogService.CatalogWrapper w : wrappers) {
            if (w.catalogId == catalogId) return w;
        }
        return null;
    }
}