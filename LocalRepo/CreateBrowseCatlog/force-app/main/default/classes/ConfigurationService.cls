public with sharing class ConfigurationService {

    /* ═══════════════════════════════════════════
       WRAPPERS
    ═══════════════════════════════════════════ */

    public class ProductConfigWrapper {
        @AuraEnabled public List<AttributeWrapper>  attributes;
        @AuraEnabled public List<BundleWrapper>     bundleItems;
        @AuraEnabled public Decimal                 productPrice;
        @AuraEnabled public String                  productDescription;
    }

    public class AttributeWrapper {
        @AuraEnabled public Id      attributeId;
        @AuraEnabled public String  name;
        @AuraEnabled public String  dataType;
        @AuraEnabled public Boolean required;
        @AuraEnabled public String  groupName;
        @AuraEnabled public List<PicklistOptionWrapper> options;
    }

    public class PicklistOptionWrapper {
        @AuraEnabled public String  label;
        @AuraEnabled public String  value;
        @AuraEnabled public Boolean selected;
    }

    public class BundleWrapper {
        @AuraEnabled public Id      productId;
        @AuraEnabled public String  name;
        @AuraEnabled public String  description;
        @AuraEnabled public Decimal minQty;
        @AuraEnabled public Decimal maxQty;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String  groupName;
        @AuraEnabled public String  netAmountLabel;
        @AuraEnabled public String  attrSummary;
        @AuraEnabled public List<ChildAttributeWrapper>  childAttributes;
        @AuraEnabled public List<NestedBundleWrapper>    nestedBundleItems;
    }

    public class ChildAttributeWrapper {
        @AuraEnabled public Id      attributeId;
        @AuraEnabled public String  name;
        @AuraEnabled public String  dataType;
        @AuraEnabled public Boolean required;
        @AuraEnabled public String  value;
        @AuraEnabled public List<PicklistOptionWrapper> options;
    }

    public class NestedBundleWrapper {
        @AuraEnabled public Id      productId;
        @AuraEnabled public String  name;
        @AuraEnabled public String  description;
        @AuraEnabled public Decimal minQty;
        @AuraEnabled public Decimal maxQty;
        @AuraEnabled public Decimal price;
    }

    public class BundleLineInput {
        @AuraEnabled public Id      productId;
        @AuraEnabled public Boolean included;
        @AuraEnabled public Decimal quantity;
        @AuraEnabled public List<NestedLineInput> nestedBundleItems;
    }

    public class NestedLineInput {
        @AuraEnabled public Id      productId;
        @AuraEnabled public Boolean included;
        @AuraEnabled public Decimal quantity;
    }

    public class PriceResult {
        @AuraEnabled public Decimal oneTimeTotal;
        @AuraEnabled public String  oneTimeTotalLabel;
        @AuraEnabled public List<BundlePriceLine> lines;
    }

    public class BundlePriceLine {
        @AuraEnabled public Id      productId;
        @AuraEnabled public Decimal unitPrice;
        @AuraEnabled public Decimal quantity;
        @AuraEnabled public Decimal lineTotal;
        @AuraEnabled public String  netAmountLabel;
    }

    /* ═══════════════════════════════════════════
       1.  GET PRODUCT CONFIG
    ═══════════════════════════════════════════ */

    @AuraEnabled(cacheable=true)
    public static ProductConfigWrapper getProductConfig(Id productId) {

        ProductConfigWrapper cfg = new ProductConfigWrapper();
        cfg.attributes  = new List<AttributeWrapper>();
        cfg.bundleItems = new List<BundleWrapper>();

        List<Product2> prodList = [
            SELECT Description FROM Product2 WHERE Id = :productId LIMIT 1
        ];
        cfg.productDescription = (!prodList.isEmpty() && prodList[0].Description != null)
            ? prodList[0].Description : '';

        List<PricebookEntry> parentPbe = [
            SELECT UnitPrice FROM PricebookEntry
            WHERE  Product2Id = :productId
              AND  Pricebook2.IsStandard = true AND IsActive = true LIMIT 1
        ];
        cfg.productPrice = parentPbe.isEmpty() ? 0 : parentPbe[0].UnitPrice;

        for (ProductAttributeDefinition pad : [
            SELECT Id, AttributeDefinition.Name,
                   AttributeDefinition.DataType,
                   AttributeDefinition.IsRequired
            FROM   ProductAttributeDefinition
            WHERE  Product2Id = :productId
        ]) {
            AttributeWrapper attr = new AttributeWrapper();
            attr.attributeId = pad.Id;
            attr.name        = pad.AttributeDefinition.Name;
            attr.dataType    = pad.AttributeDefinition.DataType;
            attr.required    = pad.AttributeDefinition.IsRequired;
            attr.groupName   = 'General';
            attr.options     = new List<PicklistOptionWrapper>();
            cfg.attributes.add(attr);
        }

        List<ProductRelatedComponent> prcs = [
            SELECT Id, ChildProductId,
                   ChildProduct.Name, ChildProduct.Description,
                   MinQuantity, MaxQuantity,
                   ProductComponentGroupId
            FROM   ProductRelatedComponent
            WHERE  ParentProductId = :productId
        ];

        Set<Id> groupIds = new Set<Id>();
        for (ProductRelatedComponent prc : prcs) {
            if (prc.ProductComponentGroupId != null)
                groupIds.add(prc.ProductComponentGroupId);
        }
        Map<Id, String> groupNameMap = new Map<Id, String>();
        if (!groupIds.isEmpty()) {
            for (ProductComponentGroup pcg : [
                SELECT Id, Name FROM ProductComponentGroup WHERE Id IN :groupIds
            ]) {
                groupNameMap.put(pcg.Id, pcg.Name);
            }
        }

        Set<Id> childIds = new Set<Id>();
        for (ProductRelatedComponent prc : prcs) childIds.add(prc.ChildProductId);

        Map<Id, List<ProductAttributeDefinition>> childAttrMap =
            new Map<Id, List<ProductAttributeDefinition>>();
        for (ProductAttributeDefinition pad : [
            SELECT Id, Product2Id,
                   AttributeDefinition.Name,
                   AttributeDefinition.DataType,
                   AttributeDefinition.IsRequired
            FROM   ProductAttributeDefinition
            WHERE  Product2Id IN :childIds
        ]) {
            if (!childAttrMap.containsKey(pad.Product2Id))
                childAttrMap.put(pad.Product2Id, new List<ProductAttributeDefinition>());
            childAttrMap.get(pad.Product2Id).add(pad);
        }

        Map<Id, Decimal> childPriceMap = new Map<Id, Decimal>();
        for (PricebookEntry pbe : [
            SELECT Product2Id, UnitPrice FROM PricebookEntry
            WHERE  Product2Id IN :childIds
              AND  Pricebook2.IsStandard = true AND IsActive = true
        ]) { childPriceMap.put(pbe.Product2Id, pbe.UnitPrice); }

        Map<Id, List<ProductRelatedComponent>> nestedPrcMap =
            new Map<Id, List<ProductRelatedComponent>>();
        Set<Id> nestedChildIds = new Set<Id>();
        for (ProductRelatedComponent nprc : [
            SELECT Id, ParentProductId, ChildProductId,
                   ChildProduct.Name, ChildProduct.Description,
                   MinQuantity, MaxQuantity
            FROM   ProductRelatedComponent
            WHERE  ParentProductId IN :childIds
        ]) {
            if (!nestedPrcMap.containsKey(nprc.ParentProductId))
                nestedPrcMap.put(nprc.ParentProductId, new List<ProductRelatedComponent>());
            nestedPrcMap.get(nprc.ParentProductId).add(nprc);
            nestedChildIds.add(nprc.ChildProductId);
        }

        Map<Id, Decimal> nestedPriceMap = new Map<Id, Decimal>();
        if (!nestedChildIds.isEmpty()) {
            for (PricebookEntry pbe : [
                SELECT Product2Id, UnitPrice FROM PricebookEntry
                WHERE  Product2Id IN :nestedChildIds
                  AND  Pricebook2.IsStandard = true AND IsActive = true
            ]) { nestedPriceMap.put(pbe.Product2Id, pbe.UnitPrice); }
        }

        for (ProductRelatedComponent prc : prcs) {
            BundleWrapper bw     = new BundleWrapper();
            bw.productId         = prc.ChildProductId;
            bw.name              = prc.ChildProduct.Name;
            bw.description       = prc.ChildProduct.Description;
            bw.minQty            = prc.MinQuantity != null ? prc.MinQuantity : 1;
            bw.maxQty            = prc.MaxQuantity;
            bw.price             = childPriceMap.containsKey(prc.ChildProductId)
                                       ? childPriceMap.get(prc.ChildProductId) : 0;
            bw.groupName         = (prc.ProductComponentGroupId != null
                                    && groupNameMap.containsKey(prc.ProductComponentGroupId))
                                       ? groupNameMap.get(prc.ProductComponentGroupId)
                                       : 'General';
            bw.netAmountLabel    = 'Included';
            bw.attrSummary       = '';

            bw.childAttributes   = new List<ChildAttributeWrapper>();
            List<ProductAttributeDefinition> childPads = childAttrMap.get(prc.ChildProductId);
            if (childPads != null) {
                for (ProductAttributeDefinition cpad : childPads) {
                    ChildAttributeWrapper ca = new ChildAttributeWrapper();
                    ca.attributeId = cpad.Id;
                    ca.name        = cpad.AttributeDefinition.Name;
                    ca.dataType    = cpad.AttributeDefinition.DataType;
                    ca.required    = cpad.AttributeDefinition.IsRequired;
                    ca.value       = '';
                    ca.options     = new List<PicklistOptionWrapper>();
                    bw.childAttributes.add(ca);
                }
            }

            bw.nestedBundleItems = new List<NestedBundleWrapper>();
            List<ProductRelatedComponent> nestedPrcs = nestedPrcMap.get(prc.ChildProductId);
            if (nestedPrcs != null) {
                for (ProductRelatedComponent nprc : nestedPrcs) {
                    NestedBundleWrapper nb = new NestedBundleWrapper();
                    nb.productId   = nprc.ChildProductId;
                    nb.name        = nprc.ChildProduct.Name;
                    nb.description = nprc.ChildProduct.Description;
                    nb.minQty      = nprc.MinQuantity != null ? nprc.MinQuantity : 1;
                    nb.maxQty      = nprc.MaxQuantity;
                    nb.price       = nestedPriceMap.containsKey(nprc.ChildProductId)
                                         ? nestedPriceMap.get(nprc.ChildProductId) : 0;
                    bw.nestedBundleItems.add(nb);
                }
            }
            cfg.bundleItems.add(bw);
        }

        return cfg;
    }

    /* ═══════════════════════════════════════════
       2.  UPDATE PRICES
    ═══════════════════════════════════════════ */

    @AuraEnabled
    public static PriceResult updatePrices(
        Id                    productId,
        Decimal               parentQty,
        List<BundleLineInput> bundleLines
    ) {
        Set<Id> allIds = new Set<Id>{ productId };
        if (bundleLines != null) {
            for (BundleLineInput bl : bundleLines) {
                if (bl.productId != null) allIds.add(bl.productId);
                if (bl.nestedBundleItems != null)
                    for (NestedLineInput nl : bl.nestedBundleItems)
                        if (nl.productId != null) allIds.add(nl.productId);
            }
        }

        Map<Id, Decimal> priceMap = new Map<Id, Decimal>();
        for (PricebookEntry pbe : [
            SELECT Product2Id, UnitPrice FROM PricebookEntry
            WHERE  Product2Id IN :allIds
              AND  Pricebook2.IsStandard = true AND IsActive = true
        ]) { priceMap.put(pbe.Product2Id, pbe.UnitPrice); }

        Decimal pUnitPrice = priceMap.containsKey(productId) ? priceMap.get(productId) : 0;
        Decimal pQty       = (parentQty != null && parentQty > 0) ? parentQty : 1;
        Decimal total      = pUnitPrice * pQty;

        PriceResult result = new PriceResult();
        result.lines       = new List<BundlePriceLine>();

        if (bundleLines != null) {
            for (BundleLineInput bl : bundleLines) {
                if (bl.included != true) continue;
                Decimal uPrice    = priceMap.containsKey(bl.productId) ? priceMap.get(bl.productId) : 0;
                Decimal qty       = (bl.quantity != null && bl.quantity > 0) ? bl.quantity : 1;
                Decimal lineTotal = uPrice * qty;
                total            += lineTotal;

                BundlePriceLine line = new BundlePriceLine();
                line.productId      = bl.productId;
                line.unitPrice      = uPrice;
                line.quantity       = qty;
                line.lineTotal      = lineTotal;
                line.netAmountLabel = lineTotal > 0
                    ? '₹ ' + lineTotal.setScale(2).toPlainString() : 'Included';
                result.lines.add(line);

                if (bl.nestedBundleItems != null) {
                    for (NestedLineInput nl : bl.nestedBundleItems) {
                        if (nl.included != true) continue;
                        Decimal nUnit  = priceMap.containsKey(nl.productId) ? priceMap.get(nl.productId) : 0;
                        Decimal nQty   = (nl.quantity != null && nl.quantity > 0) ? nl.quantity : 1;
                        Decimal nTotal = nUnit * nQty;
                        total         += nTotal;

                        BundlePriceLine nLine = new BundlePriceLine();
                        nLine.productId       = nl.productId;
                        nLine.unitPrice       = nUnit;
                        nLine.quantity        = nQty;
                        nLine.lineTotal       = nTotal;
                        nLine.netAmountLabel  = nTotal > 0
                            ? '₹ ' + nTotal.setScale(2).toPlainString() : 'Included';
                        result.lines.add(nLine);
                    }
                }
            }
        }

        result.oneTimeTotal      = total;
        result.oneTimeTotalLabel = total > 0
            ? '₹ ' + total.setScale(2).toPlainString() : '-';
        return result;
    }

    /* ═══════════════════════════════════════════
       3.  SAVE BUNDLE QUANTITIES
    ═══════════════════════════════════════════ */

    @AuraEnabled
    public static void saveBundleQuantities(
        Id                    parentRecordId,
        String                recordType,
        Decimal               parentQty,
        List<BundleLineInput> bundleLines
    ) {
        if (bundleLines == null || bundleLines.isEmpty()) return;
        if (recordType == 'Order')      saveOrderItemQtys(parentRecordId, bundleLines);
        else if (recordType == 'Quote') saveQuoteLineQtys(parentRecordId, bundleLines);
    }

    private static void saveOrderItemQtys(Id orderId, List<BundleLineInput> bundleLines) {
        Map<Id, Decimal> qtyMap = buildQtyMap(bundleLines);
        List<OrderItem> toUpdate = new List<OrderItem>();
        for (OrderItem oi : [
            SELECT Id, Product2Id, Quantity FROM OrderItem
            WHERE  OrderId = :orderId AND Product2Id IN :qtyMap.keySet()
        ]) {
            Decimal newQty = qtyMap.get(oi.Product2Id);
            if (newQty != null && oi.Quantity != newQty) {
                oi.Quantity = newQty;
                toUpdate.add(oi);
            }
        }
        if (!toUpdate.isEmpty()) update toUpdate;
    }

    private static void saveQuoteLineQtys(Id quoteId, List<BundleLineInput> bundleLines) {
        Map<Id, Decimal> qtyMap = buildQtyMap(bundleLines);
        List<QuoteLineItem> toUpdate = new List<QuoteLineItem>();
        for (QuoteLineItem qli : [
            SELECT Id, Product2Id, Quantity FROM QuoteLineItem
            WHERE  QuoteId = :quoteId AND Product2Id IN :qtyMap.keySet()
        ]) {
            Decimal newQty = qtyMap.get(qli.Product2Id);
            if (newQty != null && qli.Quantity != newQty) {
                qli.Quantity = newQty;
                toUpdate.add(qli);
            }
        }
        if (!toUpdate.isEmpty()) update toUpdate;
    }

    private static Map<Id, Decimal> buildQtyMap(List<BundleLineInput> bundleLines) {
        Map<Id, Decimal> m = new Map<Id, Decimal>();
        for (BundleLineInput bl : bundleLines) {
            if (bl.included == true)
                m.put(bl.productId, (bl.quantity != null && bl.quantity > 0) ? bl.quantity : 1);
            if (bl.nestedBundleItems != null)
                for (NestedLineInput nl : bl.nestedBundleItems)
                    if (nl.included == true)
                        m.put(nl.productId, (nl.quantity != null && nl.quantity > 0) ? nl.quantity : 1);
        }
        return m;
    }

    /* ═══════════════════════════════════════════════════════════
       4.  CREATE OPP LINE ITEMS FOR BUNDLE CHILD PRODUCTS
       ─────────────────────────────────────────────────────────
       • Reads the Opportunity's active Pricebook (falls back to
         Standard Pricebook if none is set)
       • For each INCLUDED bundle child (and nested child):
           – skips products already present as a line item
           – looks up the matching PricebookEntry in that book
           – inserts a new OpportunityLineItem with the same
             UnitPrice and Quantity as configured
       • Params
           opportunityId     : Opportunity to add lines to
           parentProductId   : the parent bundle Product2 Id
                               (used for reference / future use)
           parentQty         : parent quantity (passed through)
           bundleLines       : same BundleLineInput payload used
                               by saveBundleQuantities
    ═══════════════════════════════════════════════════════════ */
    @AuraEnabled
    public static void createBundleOppLines(
        Id                    opportunityId,
        Id                    parentProductId,
        Decimal               parentQty,
        List<BundleLineInput> bundleLines
    ) {
        if (opportunityId == null || bundleLines == null || bundleLines.isEmpty()) return;

        // ── 1. Determine the pricebook on the Opportunity ───────
        Opportunity opp = [
            SELECT Id, Pricebook2Id FROM Opportunity WHERE Id = :opportunityId LIMIT 1
        ];
        Id pricebookId = opp.Pricebook2Id;

        // Fall back to Standard Pricebook if Opp has none set
        if (pricebookId == null) {
            List<Pricebook2> stdPb = [
                SELECT Id FROM Pricebook2
                WHERE IsStandard = true AND IsActive = true LIMIT 1
            ];
            if (!stdPb.isEmpty()) pricebookId = stdPb[0].Id;
        }
        if (pricebookId == null) return; // no pricebook at all — bail

        // ── 2. Collect all included child product IDs + qty map ─
        Map<Id, Decimal> includedQtyMap = new Map<Id, Decimal>();
        for (BundleLineInput bl : bundleLines) {
            if (bl.included == true && bl.productId != null) {
                Decimal qty = (bl.quantity != null && bl.quantity > 0) ? bl.quantity : 1;
                includedQtyMap.put(bl.productId, qty);
            }
            if (bl.nestedBundleItems != null) {
                for (NestedLineInput nl : bl.nestedBundleItems) {
                    if (nl.included == true && nl.productId != null) {
                        Decimal nQty = (nl.quantity != null && nl.quantity > 0) ? nl.quantity : 1;
                        includedQtyMap.put(nl.productId, nQty);
                    }
                }
            }
        }
        if (includedQtyMap.isEmpty()) return;

        // ── 3. Map ProductId → PricebookEntry for that book ──────
        Map<Id, PricebookEntry> pbeMap = new Map<Id, PricebookEntry>();
        for (PricebookEntry pbe : [
            SELECT Id, Product2Id, UnitPrice FROM PricebookEntry
            WHERE  Pricebook2Id = :pricebookId
              AND  Product2Id   IN :includedQtyMap.keySet()
              AND  IsActive      = true
        ]) {
            pbeMap.put(pbe.Product2Id, pbe);
        }

        // ── 4. Check which products already exist as OLIs ────────
        Map<Id, OpportunityLineItem> existingOliMap = new Map<Id, OpportunityLineItem>();
        for (OpportunityLineItem oli : [
            SELECT Id, Product2Id, Quantity FROM OpportunityLineItem
            WHERE  OpportunityId = :opportunityId
               AND Product2Id    IN :includedQtyMap.keySet()
        ]) {
            existingOliMap.put(oli.Product2Id, oli);
        }

        // ── 5. Split into insert vs update lists ─────────────────
        List<OpportunityLineItem> toInsert = new List<OpportunityLineItem>();
        List<OpportunityLineItem> toUpdate = new List<OpportunityLineItem>();

        for (Id productId : includedQtyMap.keySet()) {
            PricebookEntry pbe = pbeMap.get(productId);
            if (pbe == null) continue; // not in pricebook — skip

            Decimal qty = includedQtyMap.get(productId);

            if (existingOliMap.containsKey(productId)) {
                // Product already on Opp → update quantity
                OpportunityLineItem existingOli = existingOliMap.get(productId);
                if (existingOli.Quantity != qty) {
                    existingOli.Quantity = qty;
                    toUpdate.add(existingOli);
                }
            } else {
                // New product → insert
                OpportunityLineItem newOli = new OpportunityLineItem();
                newOli.OpportunityId    = opportunityId;
                newOli.Product2Id       = productId;
                newOli.PricebookEntryId = pbe.Id;
                newOli.Quantity         = qty;
                newOli.UnitPrice        = pbe.UnitPrice;
                toInsert.add(newOli);
            }
        }

        if (!toInsert.isEmpty()) insert toInsert;
        if (!toUpdate.isEmpty()) update toUpdate;
    }
}