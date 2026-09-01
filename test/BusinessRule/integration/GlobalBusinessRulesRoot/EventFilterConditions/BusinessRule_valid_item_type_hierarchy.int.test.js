var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_valid_item_type_hierarchy");

test('Checks if the object is ', async () =>{
    var result = "";
    await step.test((manager) => {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = colorway.createProduct("JEST_STYLVRNT_1010", "StyleVariant");
        var sku = styleVariant.createProduct("JEST_SKU_1010", "SKUNode");

        var cls = manager.getClassificationHome().getClassificationByID("IT_CLS_374");
        var style = cls.createClassification("JEST_STYL_1010", "StyleNode");

        var svTOSLinkType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("StyleVariantToStyleLink");
        styleVariant.createClassificationProductLink(style, svTOSLinkType);
        var validItemTypeHierarchy = businessRuleModule;

        return validItemTypeHierarchy;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = data.toString();
    });
    expect(result).toBeTruthy();
});
