/**
 * ConfigurationServiceTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Targets 90%+ coverage of ConfigurationService.getProductConfig(Id productId)
 *
 * Key schema facts (from ConfigurationService SOQL):
 *
 *   ProductAttributeDefinition
 *     - Junction between Product2 and AttributeDefinition
 *     - Required fields: Product2Id, AttributeDefinitionId
 *     - Traversal: AttributeDefinition.Name, .DataType, .IsRequired
 *
 *   AttributeDefinition (parent of ProductAttributeDefinition)
 *     - Required fields: Name, DataType
 *
 *   ProductRelatedComponent
 *     - Required fields: ParentProductId, ChildProductId
 *     - Used fields: MinQuantity, MaxQuantity
 *     - NOTE: No 'Quantity' field on this object
 * ─────────────────────────────────────────────────────────────────────────────
 */
@IsTest
private class ConfigurationServiceTest {

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Creates an AttributeDefinition + ProductAttributeDefinition junction
     * linking it to the given product. Both records are inserted.
     */
    private static ProductAttributeDefinition createAttributeForProduct(
        String attrName,
        String dataType,
        Boolean isRequired,
        Id productId
    ) {
        AttributeDefinition ad = new AttributeDefinition(
            Name     = attrName,
            DataType = dataType
        );
        insert ad;

        ProductAttributeDefinition pad = new ProductAttributeDefinition(
            Product2Id            = productId,
            AttributeDefinitionId = ad.Id
        );
        insert pad;
        return pad;
    }

    /**
     * Creates and inserts a ProductRelatedComponent (parent → child).
     */
    private static ProductRelatedComponent createBundleComponent(
        Id parentId,
        Id childId,
        Decimal minQty,
        Decimal maxQty
    ) {
        ProductRelatedComponent prc = new ProductRelatedComponent(
            ParentProductId = parentId,
            ChildProductId  = childId,
            MinQuantity     = minQty,
            MaxQuantity     = maxQty
        );
        insert prc;
        return prc;
    }

    // =========================================================================
    // 1. Product WITH attributes → attributes list populated
    // =========================================================================
    @IsTest
    static void getProductConfig_withAttributes_returnsPopulatedAttributesList() {
        Product2 prod = TestDataFactory.createProduct('Attr Product', 'ATTR-01', true);
        createAttributeForProduct('Color', 'Text', false, prod.Id);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(prod.Id);
        Test.stopTest();

        System.assertNotEquals(null, result,             'Result must not be null');
        System.assertNotEquals(null, result.attributes,  'Attributes list must not be null');
        System.assert(result.attributes.size() > 0,     'At least one attribute expected');
    }

    // =========================================================================
    // 2. Product WITH bundle items → bundleItems list populated
    // =========================================================================
    @IsTest
    static void getProductConfig_withBundleItems_returnsPopulatedBundleList() {
        Product2 parent = TestDataFactory.createProduct('Bundle Parent', 'BNDL-01', true);
        Product2 child  = TestDataFactory.createProduct('Bundle Child',  'BNDL-02', true);
        createBundleComponent(parent.Id, child.Id, 1, 3);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(parent.Id);
        Test.stopTest();

        System.assertNotEquals(null, result,              'Result must not be null');
        System.assertNotEquals(null, result.bundleItems,  'BundleItems list must not be null');
        System.assert(result.bundleItems.size() > 0,     'At least one bundle item expected');
    }

    // =========================================================================
    // 3. Product WITH both attributes AND bundle items
    // =========================================================================
    @IsTest
    static void getProductConfig_withAttributesAndBundleItems_returnsBothLists() {
        Product2 parent = TestDataFactory.createProduct('Full Bundle', 'FULL-01', true);
        Product2 child  = TestDataFactory.createProduct('Full Child',  'FULL-02', true);

        createAttributeForProduct('Size', 'Text', true, parent.Id);
        createBundleComponent(parent.Id, child.Id, 1, 5);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(parent.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assert(result.attributes.size()  > 0, 'Attributes should be populated');
        System.assert(result.bundleItems.size() > 0, 'BundleItems should be populated');
    }

    // =========================================================================
    // 4. AttributeWrapper fields correctly mapped from AttributeDefinition
    // =========================================================================
    @IsTest
    static void getProductConfig_attributeWrapperFields_areMappedCorrectly() {
        Product2 prod = TestDataFactory.createProduct('Field Map Product', 'FMAP-01', true);
        createAttributeForProduct('Storage', 'Text', true, prod.Id);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(prod.Id);
        Test.stopTest();

        System.assertEquals(1, result.attributes.size(), 'Exactly one attribute expected');

        ConfigurationService.AttributeWrapper aw = result.attributes[0];
        System.assertNotEquals(null, aw,               'AttributeWrapper must not be null');
        System.assertEquals('Storage',  aw.name,       'name ← AttributeDefinition.Name');
        System.assertEquals('Text',     aw.dataType,   'dataType ← AttributeDefinition.DataType');
        System.assertEquals(true,       aw.required,   'required ← AttributeDefinition.IsRequired');
        System.assertEquals('General',  aw.groupName,  'groupName hardcoded to General');
        System.assertNotEquals(null,    aw.attributeId,'attributeId (PAD Id) should be set');
    }

    // =========================================================================
    // 5. BundleWrapper fields correctly mapped from ProductRelatedComponent
    // =========================================================================
    @IsTest
    static void getProductConfig_bundleWrapperFields_areMappedCorrectly() {
        Product2 parent = TestDataFactory.createProduct('Map Bundle Parent', 'MBND-01', true);
        Product2 child  = TestDataFactory.createProduct('Map Bundle Child',  'MBND-02', true);
        createBundleComponent(parent.Id, child.Id, 2, 10);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(parent.Id);
        Test.stopTest();

        System.assertEquals(1, result.bundleItems.size(), 'Exactly one bundle item expected');

        ConfigurationService.BundleWrapper bw = result.bundleItems[0];
        System.assertNotEquals(null, bw,                      'BundleWrapper must not be null');
        System.assertEquals(child.Id, bw.productId,          'productId ← ChildProductId');
        System.assertEquals('Map Bundle Child', bw.name,     'name ← ChildProduct.Name');
        System.assertEquals(2,  bw.minQty,                   'minQty should be 2');
        System.assertEquals(10, bw.maxQty,                   'maxQty should be 10');
        System.assertEquals(0,  bw.price,                    'price hardcoded to 0');
    }

    // =========================================================================
    // 6. No attributes, no bundle items → empty lists returned
    // =========================================================================
    @IsTest
    static void getProductConfig_noAttributesNoBundle_returnsEmptyLists() {
        Product2 prod = TestDataFactory.createProduct('Simple Product', 'SIMPLE-01', true);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(prod.Id);
        Test.stopTest();

        System.assertNotEquals(null, result,              'Result should not be null');
        System.assertNotEquals(null, result.attributes,   'Attributes list should not be null');
        System.assertNotEquals(null, result.bundleItems,  'BundleItems list should not be null');
        System.assertEquals(0, result.attributes.size(),  'No attributes expected');
        System.assertEquals(0, result.bundleItems.size(), 'No bundle items expected');
    }

    // =========================================================================
    // 7. Null productId → empty wrapper, no exception
    // =========================================================================
    @IsTest
    static void getProductConfig_nullProductId_returnsEmptyConfig() {
        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(null);
        Test.stopTest();

        System.assertNotEquals(null, result,              'Should return empty wrapper, not null');
        System.assertEquals(0, result.attributes.size(),  'Attributes should be empty');
        System.assertEquals(0, result.bundleItems.size(), 'BundleItems should be empty');
    }

    // =========================================================================
    // 8. Deleted product Id → empty wrapper, no exception
    // =========================================================================
    @IsTest
    static void getProductConfig_nonExistentProduct_returnsEmptyConfig() {
        Product2 ghost = TestDataFactory.createProduct('Ghost', 'GHOST-01', true);
        Id ghostId = ghost.Id;
        delete ghost;

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(ghostId);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals(0, result.attributes.size());
        System.assertEquals(0, result.bundleItems.size());
    }

    // =========================================================================
    // 9. All wrapper fields are directly assignable (pure unit, no DML)
    // =========================================================================
    @IsTest
    static void getProductConfig_wrapperClassesInstantiable() {
        ConfigurationService.ProductConfigWrapper cfg =
            new ConfigurationService.ProductConfigWrapper();
        cfg.attributes  = new List<ConfigurationService.AttributeWrapper>();
        cfg.bundleItems = new List<ConfigurationService.BundleWrapper>();

        ConfigurationService.AttributeWrapper attr = new ConfigurationService.AttributeWrapper();
        attr.attributeId = null;
        attr.name        = 'Test Attr';
        attr.dataType    = 'Text';
        attr.required    = true;
        attr.groupName   = 'General';
        cfg.attributes.add(attr);

        ConfigurationService.BundleWrapper bw = new ConfigurationService.BundleWrapper();
        bw.productId = null;
        bw.name      = 'Bundle Child';
        bw.minQty    = 1;
        bw.maxQty    = 5;
        bw.price     = 0;
        cfg.bundleItems.add(bw);

        System.assertEquals(1, cfg.attributes.size(),               'One attribute added');
        System.assertEquals(1, cfg.bundleItems.size(),              'One bundle item added');
        System.assertEquals('General', cfg.attributes[0].groupName, 'groupName = General');
        System.assertEquals('Text',    cfg.attributes[0].dataType,  'dataType = Text');
        System.assertEquals(true,      cfg.attributes[0].required,  'required = true');
    }

    // =========================================================================
    // 10. Multiple attributes on one product → all returned
    // =========================================================================
    @IsTest
    static void getProductConfig_multipleAttributes_allReturned() {
        Product2 prod = TestDataFactory.createProduct('Multi Attr', 'MULT-01', true);
        createAttributeForProduct('Color',   'Text',   false, prod.Id);
        createAttributeForProduct('Size',    'Text',   false, prod.Id);
        createAttributeForProduct('Storage', 'Number', true,  prod.Id);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(prod.Id);
        Test.stopTest();

        System.assertEquals(3, result.attributes.size(), 'All 3 attributes should be returned');
    }

    // =========================================================================
    // 11. Multiple bundle children on one parent → all returned
    // =========================================================================
    @IsTest
    static void getProductConfig_multipleBundleChildren_allReturned() {
        Product2 parent = TestDataFactory.createProduct('Multi Bundle', 'MBUN-01', true);
        Product2 child1 = TestDataFactory.createProduct('Child One',    'MBUN-02', true);
        Product2 child2 = TestDataFactory.createProduct('Child Two',    'MBUN-03', true);

        createBundleComponent(parent.Id, child1.Id, 1, 2);
        createBundleComponent(parent.Id, child2.Id, 1, 4);

        Test.startTest();
        ConfigurationService.ProductConfigWrapper result =
            ConfigurationService.getProductConfig(parent.Id);
        Test.stopTest();

        System.assertEquals(2, result.bundleItems.size(), 'Both bundle children should be returned');
    }
}