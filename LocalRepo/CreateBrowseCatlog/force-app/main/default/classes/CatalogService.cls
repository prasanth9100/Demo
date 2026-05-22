public with sharing class CatalogService {

    @AuraEnabled(cacheable=true)
    public static List<CatalogWrapper> getCatalogs(){

        List<CatalogWrapper> results = new List<CatalogWrapper>();

        // 🔥 CATEGORY COUNT MAP
        Map<Id, Integer> catCountMap = new Map<Id, Integer>();

        for(AggregateResult ar : [
            SELECT CatalogId cId, COUNT(Id) cnt
            FROM ProductCategory
            GROUP BY CatalogId
        ]){
            catCountMap.put(
                (Id)ar.get('cId'),
                (Integer)ar.get('cnt')
            );
        }

        // 🔥 FETCH CATALOGS
        for(ProductCatalog c : [
            SELECT Id, Name, Code, LastModifiedDate
            FROM ProductCatalog
        ]){

            CatalogWrapper w = new CatalogWrapper();

            w.catalogId = c.Id;
            w.name = c.Name;
            w.code = c.Code;
            w.lastModified = c.LastModifiedDate;

            w.categoryCount = catCountMap.containsKey(c.Id)
                ? catCountMap.get(c.Id)
                : 0;

            results.add(w);
        }

        return results;
    }

    // 🔥 WRAPPER CLASS
    public class CatalogWrapper{

        @AuraEnabled public Id catalogId;
        @AuraEnabled public String name;
        @AuraEnabled public String code;
        @AuraEnabled public Integer categoryCount;
        @AuraEnabled public DateTime lastModified;

    }
}