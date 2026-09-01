var step = require("../../../config/step.js");
var parseStepResponse = step.parseResponse;
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_UtilityLibrary");

test.skip('Should return an attribute matching with the input Id.', async () => {
    var result = {};
    await step.test((step) => {
        var resultJSON = {}
        var attrID = "color";
        var attrHome = step.getAttributeHome();
        var omniCache = {};
        var result = businessRuleModule.getAttr(attrID, omniCache, attrHome);
        resultJSON["id"] = result.getID()+"";
        resultJSON["name"] = result.getName()+"";
        console.log(resultJSON);
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });
    var finalResult = result;
    expect(finalResult.name).toBe("Color");
});

test('Should return an lookup attribute Id matching with the input attribute Id.', async () => {
    var result = {};
    await step.test((step) => {
        var attrID = "dmdm_pre_pcs_vendorcolorway_imageway_style_id";
        var lookUpTableHome = step.getHome(com.stibo.lookuptable.domain.LookupTableHome);
        var omniCache = {};
        var lookupResult = businessRuleModule.getLookUpAttr(attrID, omniCache, lookUpTableHome);
        return JSON.stringify({result: lookupResult});
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });
    expect(result.result).toBe("dmdm_vendor_style_id");
});

test('Should return a classification with the input classification Id.', async () => {
    var result = {};
    await step.test((step) => {
        const resultJSON = {};
        var nodeId = "ItemTypeHierarchyRoot";
        var classHome = step.getClassificationHome();
        var omniCache = {};
        var result = businessRuleModule.getClassification(nodeId, classHome, omniCache);
        resultJSON["id"] = result.getID()+"";
        resultJSON["name"] = result.getName()+"";
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });
    var finalResult = result;
    expect(finalResult.id).toBe("ItemTypeHierarchyRoot");
    expect(finalResult.name).toBe("Item Type Hierarchy");
});

test('Should return a product with the input product Id.', async () => {
    var result = {};
    await step.test((step) => {
        const resultJSON = {};
        var nodeId = "StitchFixMerchProductHierarchy";
        var productHome = step.getProductHome();
        var omniCache = {};
        var result = businessRuleModule.getProduct(nodeId, productHome, omniCache);
        resultJSON["id"] = result.getID()+"";
        resultJSON["name"] = result.getName()+"";
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });
    var finalResult = result;
    expect(finalResult.id).toBe("StitchFixMerchProductHierarchy");
    expect(finalResult.name).toBe("Stitch Fix Merch Product Hierarchy");
});

test('Should return a reference type with the input reference type Id.', async () => {
    var result = {};
    await step.test((step) => {
        const resultJSON = {};
        // Use a broadly available reference type in test contexts.
        var referenceTypeId = "PayloadToSKUReference";
        var refTypeHome = step.getReferenceTypeHome();
        var omniCache = {};
        var result = businessRuleModule.getRefType(referenceTypeId, refTypeHome, omniCache);
        resultJSON["id"] = result.getID()+"";
        resultJSON["name"] = result.getName()+"";
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });
    expect(result.id).toBe("PayloadToSKUReference");
});
/*test('Should return a link type with the input link type Id.', async () => {
    var result = {};
    await step.test((step) => {
        const resultJSON = {};
        var linkTypeID = "StyleVariantToStyleLink";
        var linkTypeHome = step.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome);
        var omniCache = {};
        var result = businessRuleModule.getLinkType(linkTypeID, linkTypeHome, omniCache);
        resultJSON["id"] = result.getID()+"";
        resultJSON["name"] = result.getName()+"";
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data.toString());
    });
    expect(result.id).toBe("StyleVariantToStyleLink");
    expect(result.name).toBe("Style Variant To Style Link");
});*/

test('Should return an object with the input key.', async () => {
    var result = {};
    await step.test((step) => {
        const resultJSON = {};
        var nodeId = "Jackets";
        var key = "SFMPHNameKey";
        var nodeHome = step.getNodeHome();
        var omniCache = {};
        var result = businessRuleModule.getObjectByKey(nodeId, key, nodeHome, omniCache);
        resultJSON["id"] = result.getID()+"";
        resultJSON["name"] = result.getName()+"";
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });

    var finalResult = result;
    expect(finalResult.id).toBe("SFMPH_CLS_102711");
    expect(finalResult.name).toBe("Jackets");
});

test('should return the Id of the Object Type.', async () =>{
    var result = {};
    await step.test((manager) => {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = colorway.createProduct("JEST_STYLVRNT_1010", "StyleVariant");
        var sku = styleVariant.createProduct("JEST_SKU_1010", "SKUNode");
        var omniCache = {};
        var objectTypeID = businessRuleModule.getObjectTypeID(sku, sku.getID(), omniCache);
        return JSON.stringify({result: objectTypeID});
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = parseStepResponse(data);
    });
    expect(result.result).toBe("SKUNode");
});
/*test('should replace special characters with HTML entities in the input string.', async () =>{
    var result = {};
    await step.test((manager) => {
        const resultJSON = {};
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = colorway.createProduct("JEST_STYLVRNT_1010", "StyleVariant");
        var sku = styleVariant.createProduct("JEST_SKU_1010", "SKUNode");
        sku.getValue("notes").setSimpleValue("Data shows this style performs great with our &lt&30 clients!");
        sku.getValue("color").setSimpleValue("Black");
        var values = sku.getValues().toArray();
        var result = businessRuleModule.replaceSpecialCharacters(sku, values);
        var resultedValues = result.getValues().toArray();
        resultedValues.forEach((value) => {
            resultJSON[value.getAttribute().getID()+""] = value.getSimpleValue()+"";
        });
        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data.toString());
    });
    expect(result.notes).toBe("Data shows this style performs great with our <lt/>30 clients!");
    expect(result.color).toBe("Black");
});*/
/*
test('Should create and return a node with the input Id.', async () => {
    var result = {};
    await step.test((step) => {
        const resultJSON = {};
        var id = "JEST_STYLVRNT_1010";
        var sku = null;
        var productGroup = step.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = null
        var object_type = "StyleVariant";
        var status = "Receivable";
        var omniCache = {};

        styleVariant = businessRuleModule.create_node(id, styleVariant, colorway, object_type, status, omniCache);
        resultJSON["sv_id"] = styleVariant.getID()+"";
        resultJSON["sv_status"] = styleVariant.getValue("status").getSimpleValue()+"";

        id = "JEST_SKU_1010";
        object_type = "SKUNode";
        status = "Active";

        sku = businessRuleModule.create_node(id, sku, styleVariant, object_type, status, omniCache);
        resultJSON["sku_id"] = sku.getID()+"";
        resultJSON["sku_status"] = sku.getValue("status").getSimpleValue()+"";

        return JSON.stringify(resultJSON);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data.toString());
    });
    expect(result.sv_id).toBe("JEST_STYLVRNT_1010");
    expect(result.sku_id).toBe("JEST_SKU_1010");
    expect(result.sv_status).toBe("Receivable");
    expect(result.sku_status).toBe("Receivable");
});*/
