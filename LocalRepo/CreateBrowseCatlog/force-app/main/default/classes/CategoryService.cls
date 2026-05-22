public with sharing class CategoryService {

    @AuraEnabled(cacheable=true)
    public static List<ProductCategory> getCategories(Id catalogId){

        System.debug('CatalogId received: ' + catalogId);

        List<ProductCategory> categories = new List<ProductCategory>();

        // 🔥 PRIMARY: FILTER BY CATALOG
        categories = [
            SELECT Id, Name, ParentCategoryId
            FROM ProductCategory
            WHERE CatalogId = :catalogId
            ORDER BY Name
        ];

        // 🔥 FALLBACK: IF NO DATA, LOAD ALL
        if(categories.isEmpty()){

            System.debug('No categories found for catalog → loading all');

            categories = [
                SELECT Id, Name, ParentCategoryId
                FROM ProductCategory
                ORDER BY Name
            ];
        }

        return categories;
    }
}