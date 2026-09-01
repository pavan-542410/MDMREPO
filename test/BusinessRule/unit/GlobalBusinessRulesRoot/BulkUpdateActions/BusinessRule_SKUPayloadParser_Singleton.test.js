var parser = require("../../../../../step-configs/BusinessRule/BusinessRule_SKUPayloadParser_Singleton");
var harness = require("../../../support/utils/skuPayloadParserTestHarness");

function buildPayload(suffix, overrides) {
    return Object.assign({
        sku_id: "SKU_" + suffix,
        ft_data_model_style_variant_id: "SV_" + suffix,
        colorway_variant_id: "CW_" + suffix,
        vendor_style_id: "PRD_" + suffix,
        classification: "Jackets",
        status: "Pending",
        brand_id: "1000",
        brand: "Test Brand",
        vendor_style_name: "Product " + suffix,
        dmdm_pre_pcs_vendorcolorway_imageway_style_id: "DMDM_" + suffix
    }, overrides || {});
}

describe("BusinessRule_SKUPayloadParser_Singleton ProductNode coverage", function () {
    beforeEach(function () {
        harness.installJavaMocks();
    });

    afterEach(function () {
        harness.clearJavaMocks();
    });

    test("populates ProductNode attributes from payload", function () {
        var payload = buildPayload("SINGLETON");
        var product = harness.runSingleton(parser, payload);

        expect(product.getValue("product_name").getSimpleValue()).toBe("Product SINGLETON");
        expect(product.getValue("vendor_style_id").getSimpleValue()).toBe("PRD_SINGLETON");
        expect(product.getValue("dmdm_vendor_style_id").getSimpleValue()).toBe("DMDM_SINGLETON");
        expect(product.getName()).toBe("Product SINGLETON");
    });

    test("creates Colorway, StyleVariant, SKU hierarchy and wires the payload reference to SKU", function () {
        var payload = buildPayload("SINGLETON_GRAPH");
        var product = harness.runSingleton(parser, payload);
        var colorway = product.getChildren()[0];
        var styleVariant = colorway.getChildren()[0];
        var sku = styleVariant.getChildren()[0];
        var payloadRefs = product.__testContext.messageContainer._refsByType.PayloadToSKUReference;

        expect(colorway.getID()).toBe("VAR_CW_SINGLETON_GRAPH");
        expect(colorway.getObjectType().getID()).toBe("ColorwayVariantNode");
        expect(colorway.getValue("colorway_variant_id").getSimpleValue()).toBe("CW_SINGLETON_GRAPH");

        expect(styleVariant.getID()).toBe("SV_SV_SINGLETON_GRAPH");
        expect(styleVariant.getObjectType().getID()).toBe("StyleVariant");
        expect(styleVariant.getValue("ft_data_model_style_variant_id").getSimpleValue()).toBe("SV_SINGLETON_GRAPH");
        expect(styleVariant.getValue("catalog_status").getSimpleValue()).toBe("Pending");
        expect(styleVariant.getValue("status").getSimpleValue()).toBe("Receivable");

        expect(sku.getID()).toBe("SKU_SKU_SINGLETON_GRAPH");
        expect(sku.getObjectType().getID()).toBe("SKUNode");
        expect(payloadRefs).toHaveLength(1);
        expect(payloadRefs[0].getTarget().getID()).toBe("SKU_SKU_SINGLETON_GRAPH");
    });

    test("preserves existing ProductNode product_name when payload vendor_style_name is null", function () {
        var payload = buildPayload("SINGLETON_NULL", {
            vendor_style_name: null
        });
        var product = harness.runSingleton(parser, payload, {
            product_name: "Existing Product Name"
        });

        expect(product.getValue("product_name").getSimpleValue()).toBe("Existing Product Name");
        expect(product.getName()).toBe("Existing Product Name");
        expect(product.getValue("vendor_style_id").getSimpleValue()).toBe("PRD_SINGLETON_NULL");
    });

    test("rethrows approval validation exceptions so the import can halt", function () {
        var payload = buildPayload("SINGLETON_FAIL");
        var sentMails = [];

        expect(function () {
            harness.runSingleton(parser, payload, null, {
                sentMails: sentMails,
                onApprove: function (node) {
                    if (node.getObjectType().getID() === "StyleVariant") {
                        var error = new Error("Validation failed for StyleVariant");
                        error.javaException = {
                            getClass: function () {
                                return {
                                    getName: function () {
                                        return "com.stibo.core.domain.approve.ApproveValidationException";
                                    }
                                };
                            },
                            getMessage: function () {
                                return "Validation failed for StyleVariant";
                            }
                        };
                        throw error;
                    }
                }
            });
        }).toThrow("Validation failed for StyleVariant");

        expect(sentMails).toHaveLength(1);
        expect(sentMails[0].to).toContain("step-non-prod-alerts-aaaao43xqbwegseopvawzmk7xq@stitchfix.org.slack.com");
        expect(sentMails[0].subject).toContain("Inbound approval validation failed");
        expect(sentMails[0].plain).toContain("Validation failed for StyleVariant");
        expect(sentMails[0].sent).toBe(true);
    });

    test("skips processing when FT is not the buyside source of truth", function () {
        var payload = buildPayload("SINGLETON_REJECTED");
        var messageContainer = harness.runSingleton(parser, payload, null, {
            isFTManagedRejected: true
        });

        expect(messageContainer.__testContext.homes.product.getProductByID("PRD_PRD_SINGLETON_REJECTED")).toBeNull();
        expect(messageContainer.__testContext.messageContainer._refsByType.PayloadToSKUReference).toBeUndefined();
        expect(messageContainer.__testContext.messageContainer.getValue("processedAt").getSimpleValue()).toBe("");
    });

    test("returns early for malformed payload JSON and leaves the message unprocessed", function () {
        var payload = buildPayload("SINGLETON_BAD_JSON");
        var messageContainer = harness.runSingleton(parser, payload, null, {
            rawSkuPayload: "{bad-json"
        });

        expect(messageContainer.__testContext.homes.product.getProductByID("PRD_PRD_SINGLETON_BAD_JSON")).toBeNull();
        expect(messageContainer.__testContext.messageContainer._refsByType.PayloadToSKUReference).toBeUndefined();
        expect(messageContainer.__testContext.messageContainer.getValue("processedAt").getSimpleValue()).toBe("");
    });

    test("creates the StyleVariant under UnclassifiedSKUs when product and colorway parents cannot be resolved", function () {
        var payload = buildPayload("SINGLETON_UNCLASSIFIED", {
            vendor_style_id: null,
            colorway_variant_id: null
        });
        var messageContainer = harness.runSingleton(parser, payload);
        var styleVariant = messageContainer.__testContext.homes.product.getProductByID("SV_SV_SINGLETON_UNCLASSIFIED");
        var sku = messageContainer.__testContext.homes.product.getProductByID("SKU_SKU_SINGLETON_UNCLASSIFIED");

        expect(styleVariant.getParent().getID()).toBe("UnclassifiedSKUs");
        expect(sku.getParent().getID()).toBe("SV_SV_SINGLETON_UNCLASSIFIED");
        expect(messageContainer.__testContext.messageContainer._refsByType.PayloadToSKUReference[0].getTarget().getID()).toBe("SKU_SKU_SINGLETON_UNCLASSIFIED");
        expect(messageContainer.__testContext.messageContainer.getValue("processedAt").getSimpleValue()).toBe("2026-03-27 12:00:00");
    });

    test("uses override hierarchy IDs, reparents the existing SV, and copies values from legacy parents", function () {
        var payload = buildPayload("SINGLETON_OVERRIDE", {
            sku_id: "SKU_SINGLETON_OVERRIDE",
            ft_data_model_style_variant_id: "SV_SINGLETON_OVERRIDE",
            vendor_style_id: "DEST_SINGLETON",
            vendor_style_name: null,
            colorway_variant_id: "IGNORED_SINGLETON"
        });

        var product = harness.runSingleton(parser, payload, {
            product_name: ""
        }, {
            onBuildContext: function (context, registry) {
                var legacyProduct = registry.createNode("PRD_LEGACY_SINGLETON", "ProductNode", context.sfmphRoot, {
                    product_name: "Legacy Singleton Product"
                });
                var legacyColorway = registry.createNode("VAR_LEGACY_SINGLETON", "ColorwayVariantNode", legacyProduct, {
                    brand_color: "Legacy Red"
                });
                registry.createNode("SV_SV_SINGLETON_OVERRIDE", "StyleVariant", legacyColorway, {
                    udp_colorway_override: "CW_OVERRIDE_SINGLETON"
                });
                registry.createNode("VAR_CW_OVERRIDE_SINGLETON", "ColorwayVariantNode", context.homes.product.getProductByID("PRD_DEST_SINGLETON"), {
                    udp_product_override: "DEST_SINGLETON"
                });
            }
        });
        var colorway = product.getChildren()[0];
        var styleVariant = colorway.getChildren()[0];

        expect(product.getID()).toBe("PRD_DEST_SINGLETON");
        expect(product.getValue("product_name").getSimpleValue()).toBe("Legacy Singleton Product");
        expect(colorway.getID()).toBe("VAR_CW_OVERRIDE_SINGLETON");
        expect(colorway.getValue("brand_color").getSimpleValue()).toBe("Legacy Red");
        expect(styleVariant.getParent().getID()).toBe("VAR_CW_OVERRIDE_SINGLETON");
    });

    test("currently fails label creation when a new label is required because labelRoot is not initialized", function () {
        var payload = buildPayload("SINGLETON_STYLE", {
            brand_color: "Azure",
            fabric_content: "{bad-material-json",
            ft_data_model_style_id: "STYLE_SINGLETON",
            item_type_id: "100",
            legacy_size_id: "10",
            sku_labels: ["Fit Label"],
            tag_size_schema_name: "schema_10"
        });
        expect(function () {
            harness.runSingleton(parser, payload);
        }).toThrow("labelRoot is not defined");
    });
});
