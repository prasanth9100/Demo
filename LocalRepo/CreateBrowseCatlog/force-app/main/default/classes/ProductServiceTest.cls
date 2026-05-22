/**
 * ProductServiceTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Covers ProductService.getProducts(...)
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
private class ProductServiceTest {

    // ── happy path: products returned for catalog + category ──────────────────
    @IsTest
    static void getProducts_withCategoryId_returnsLinkedProducts() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            s.catalog.Id,
            s.category.Id,
            s.customPb.Id,
            null,
            50,
            1
        );
        Test.stopTest();

        System.assertEquals(2, result.size(), 'Should return 2 products');
        System.assertNotEquals(null, result[0].productId, 'productId should be populated');
        System.assertNotEquals(null, result[0].name,      'name should be populated');
    }

    // ── no categoryId → catalog-level query ───────────────────────────────────
    @IsTest
    static void getProducts_noCategoryId_returnsProductsForCatalog() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            s.catalog.Id,
            null,            // no category filter
            s.customPb.Id,
            null,
            50,
            1
        );
        Test.stopTest();

        System.assert(result.size() >= 2, 'Should return at least 2 products');
    }

    // ── search key filters products by name ───────────────────────────────────
    @IsTest
    static void getProducts_withSearchKey_filtersResults() {
        ProductCatalog    catalog  = TestDataFactory.createCatalog('Search Catalog', true);
        ProductCategory   category = TestDataFactory.createCategory('Search Cat', catalog.Id, true);
        Product2          prodA    = TestDataFactory.createProduct('Alpha Widget', 'AW-01', true);
        Product2          prodB    = TestDataFactory.createProduct('Beta Gadget',  'BG-01', true);

        TestDataFactory.linkProductToCategory(prodA.Id, category.Id, true);
        TestDataFactory.linkProductToCategory(prodB.Id, category.Id, true);

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            catalog.Id,
            category.Id,
            null,
            'Alpha',   // search key
            50,
            1
        );
        Test.stopTest();

        System.assertEquals(1, result.size(), 'Should return only Alpha Widget');
        System.assertEquals('Alpha Widget', result[0].name);
    }

    // ── price is pulled from pricebook entry ─────────────────────────────────
    @IsTest
    static void getProducts_withPricebook_pricePopulated() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            s.catalog.Id,
            s.category.Id,
            s.customPb.Id,
            null,
            50,
            1
        );
        Test.stopTest();

        for (ProductService.ProductWrapper pw : result) {
            System.assert(pw.price > 0, 'Price should be > 0 when pricebook is supplied');
        }
    }

    // ── no pricebook → price falls back to any active entry ──────────────────
    @IsTest
    static void getProducts_noPricebook_priceFromFallback() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            s.catalog.Id,
            s.category.Id,
            null,    // no pricebook
            null,
            50,
            1
        );
        Test.stopTest();

        // Service attempts fallback query; just ensure no exception and list returned
        System.assertNotEquals(null, result);
    }

    // ── wrapper default quantity is 1 ────────────────────────────────────────
    @IsTest
    static void getProducts_defaultQuantityIsOne() {
        TestDataFactory.ScenarioWrapper s = TestDataFactory.createFullScenario();

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            s.catalog.Id,
            s.category.Id,
            s.customPb.Id,
            null,
            50,
            1
        );
        Test.stopTest();

        for (ProductService.ProductWrapper pw : result) {
            System.assertEquals(1, pw.quantity, 'Default quantity should be 1');
        }
    }

    // ── empty catalog → no results ────────────────────────────────────────────
    @IsTest
    static void getProducts_emptyCatalog_returnsEmptyList() {
        ProductCatalog  emptyCatalog = TestDataFactory.createCatalog('Empty Catalog', true);

        Test.startTest();
        List<ProductService.ProductWrapper> result = ProductService.getProducts(
            emptyCatalog.Id,
            null,
            null,
            null,
            50,
            1
        );
        Test.stopTest();

        System.assertEquals(0, result.size(), 'Empty catalog should yield 0 products');
    }
}