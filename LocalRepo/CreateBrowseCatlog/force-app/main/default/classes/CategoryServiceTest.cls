/**
 * CategoryServiceTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Covers CategoryService.getCategories(Id catalogId)
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
private class CategoryServiceTest {

    // ── categories filtered by catalog ───────────────────────────────────────
    @IsTest
    static void getCategories_withMatchingCatalog_returnsCorrectCategories() {
        ProductCatalog catalog1 = TestDataFactory.createCatalog('Catalog 1', true);
        ProductCatalog catalog2 = TestDataFactory.createCatalog('Catalog 2', true);

        TestDataFactory.createCategory('Cat A', catalog1.Id, true);
        TestDataFactory.createCategory('Cat B', catalog1.Id, true);
        TestDataFactory.createCategory('Cat C', catalog2.Id, true);

        Test.startTest();
        List<ProductCategory> result = CategoryService.getCategories(catalog1.Id);
        Test.stopTest();

        // Expect exactly 2 for catalog1
        System.assertEquals(2, result.size(), 'Should return 2 categories for Catalog 1');
        for (ProductCategory cat : result) {
            System.assertEquals(catalog1.Id, cat.CatalogId, 'CatalogId should match Catalog 1');
        }
    }

    // ── fallback: no categories for catalog → returns all ─────────────────────
    @IsTest
    static void getCategories_noMatchForCatalog_returnsAll() {
        ProductCatalog catalogWithCats  = TestDataFactory.createCatalog('Has Cats',  true);
        ProductCatalog catalogNoCats    = TestDataFactory.createCatalog('No Cats',   true);

        TestDataFactory.createCategory('Global 1', catalogWithCats.Id, true);
        TestDataFactory.createCategory('Global 2', catalogWithCats.Id, true);

        Test.startTest();
        List<ProductCategory> result = CategoryService.getCategories(catalogNoCats.Id);
        Test.stopTest();

        // Fallback fires → must return at least the 2 categories we created
        System.assert(result.size() >= 2, 'Fallback should return all categories');
    }

    // ── single category returned ──────────────────────────────────────────────
    @IsTest
    static void getCategories_singleCategory_returnsOne() {
        ProductCatalog catalog = TestDataFactory.createCatalog('Single Cat Catalog', true);
        ProductCategory cat    = TestDataFactory.createCategory('Only Category', catalog.Id, true);

        Test.startTest();
        List<ProductCategory> result = CategoryService.getCategories(catalog.Id);
        Test.stopTest();

        System.assertEquals(1, result.size(), 'Should return exactly 1 category');
        System.assertEquals(cat.Id, result[0].Id, 'Category Id should match');
    }

    // ── child category (parent set) is included ───────────────────────────────
    @IsTest
    static void getCategories_withChildCategory_parentIdPopulated() {
        ProductCatalog   catalog = TestDataFactory.createCatalog('Parent Catalog', true);
        ProductCategory  parent  = TestDataFactory.createCategory('Parent', catalog.Id, true);
        ProductCategory  child   = TestDataFactory.createChildCategory('Child', catalog.Id, parent.Id, true);

        Test.startTest();
        List<ProductCategory> result = CategoryService.getCategories(catalog.Id);
        Test.stopTest();

        System.assertEquals(2, result.size(), 'Should return parent and child');

        // Find child and assert parent reference
        ProductCategory foundChild = null;
        for (ProductCategory pc : result) {
            if (pc.Id == child.Id) { foundChild = pc; break; }
        }
        System.assertNotEquals(null, foundChild, 'Child category should be in result');
        System.assertEquals(parent.Id, foundChild.ParentCategoryId, 'ParentCategoryId should be set');
    }

    // ── results are ordered by name ───────────────────────────────────────────
    @IsTest
    static void getCategories_orderedByName() {
        ProductCatalog catalog = TestDataFactory.createCatalog('Ordered Catalog', true);
        TestDataFactory.createCategory('Zebra',   catalog.Id, true);
        TestDataFactory.createCategory('Apple',   catalog.Id, true);
        TestDataFactory.createCategory('Mango',   catalog.Id, true);

        Test.startTest();
        List<ProductCategory> result = CategoryService.getCategories(catalog.Id);
        Test.stopTest();

        System.assertEquals(3, result.size());
        System.assertEquals('Apple', result[0].Name);
        System.assertEquals('Mango', result[1].Name);
        System.assertEquals('Zebra', result[2].Name);
    }
}