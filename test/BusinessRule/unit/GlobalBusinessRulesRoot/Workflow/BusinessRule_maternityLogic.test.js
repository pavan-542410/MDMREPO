'use strict';

const { createNode } = require('../../../config/mockFactory');

// ─── helpers ────────────────────────────────────────────────────────────────

/** Minimal getSKU mock – returns a stub SKU so the if(sku) block executes */
function makeGetSKU(skuNode) {
    var sku = skuNode || createNode({ id: 'SKU-STUB', values: {} });
    return { evaluate: jest.fn(() => sku) };
}

const sizeSchemaLink = {};

function runAutopopulate(sv) {
    jest.resetModules();
    const br = require('../../../../../step-configs/BusinessRule/BusinessRule_autopopulateStyleVariantValues');
    br.operation0(sv, {}, makeGetSKU(), sizeSchemaLink);
    return sv;
}

// ─── autopopulateStyleVariantValues – maternity logic ───────────────────────

describe('autopopulateStyleVariantValues – maternity logic', () => {
    beforeEach(() => {
        global.logger = { info: jest.fn(), warning: jest.fn(), error: jest.fn() };
    });

    afterEach(() => {
        delete global.logger;
    });

    test('sets is_maternity=true and maternity_status=Maternity Only when PCF=maternity', () => {
        const sv = createNode({
            id: 'SV-001',
            values: { primary_client_focus: 'maternity', is_maternity: null, maternity_status: null }
        });

        runAutopopulate(sv);

        expect(sv._values['is_maternity']).toBe('true');
        expect(sv._values['maternity_status']).toBe('Maternity Only');
    });

    test('sets is_maternity=false when PCF is not maternity', () => {
        const sv = createNode({
            id: 'SV-002',
            values: { primary_client_focus: 'standard', is_maternity: 'true', maternity_status: null }
        });

        runAutopopulate(sv);

        expect(sv._values['is_maternity']).toBe('false');
    });

    test('leaves maternity_status unchanged when PCF is not maternity', () => {
        const sv = createNode({
            id: 'SV-003',
            values: { primary_client_focus: 'standard', is_maternity: null, maternity_status: 'First Trimester' }
        });

        runAutopopulate(sv);

        expect(sv._values['maternity_status']).toBe('First Trimester');
    });

    test('sets is_maternity=false when PCF is null/empty', () => {
        const sv = createNode({
            id: 'SV-004',
            values: { primary_client_focus: null, is_maternity: null, maternity_status: null }
        });

        runAutopopulate(sv);

        expect(sv._values['is_maternity']).toBe('false');
    });
});

// ─── CheckMandatoryAttributesBeforeApprove – maternity alignment ─────────────

describe('CheckMandatoryAttributesBeforeApprove – maternity alignment', () => {
    let br;

    beforeEach(() => {
        global.logger = { info: jest.fn(), warning: jest.fn(), error: jest.fn(), severe: jest.fn() };
    });

    afterEach(() => {
        delete global.logger;
    });

    // Minimal stubs for binds not under test
    const sellsideAttributes = { getAllAttributes: () => ({ iterator: () => ({ hasNext: () => false }) }) };
    const enforceMandatoryChecks = { getValue: () => ({ getSimpleValue: () => 'true' }) };
    const productToClassLinkType = {};
    const step = {};
    const ui = null;
    const svHasValidImagery = { evaluate: () => ({ isRejected: () => false }) };
    const productToMaterialRefType = {};
    const verifySizeSchemaAttributes = { evaluate: () => ({ isRejected: () => false }) };

    // Base values satisfying all mandatory product attribute checks so tests isolate maternity logic
    const mandatoryBase = {
        brand_id: 'BRAND', brand_sku: 'SKU', ft_data_model_style_id: 'S1', vendor_style_id: 'V1',
        colorway_variant_id: 'CV1', class_name: 'CLASS', ft_data_model_style_variant_id: 'SV1',
        region_name: 'US', intent_name: 'FIX', business_line_name: 'MEN', item_type_division_name: 'TOP',
        department_name: 'DEPT', status: null
    };

    function runCheck(values) {
        jest.resetModules();
        br = require('../../../../../step-configs/BusinessRule/BusinessRule_CheckMandatoryAttributesBeforeApprove');
        const node = createNode({ id: 'SV-TEST', objectTypeID: 'StyleVariant', values: Object.assign({}, mandatoryBase, values) });
        // Stub out java globals used by the BR
        global.java = {
            util: {
                ArrayList: function () {
                    const items = [];
                    return { add: (v) => items.push(v), isEmpty: () => items.length === 0, toArray: () => items };
                }
            },
            lang: {
                StringBuilder: function () {
                    let s = '';
                    return { append: function (v) { s += v; }, toString: function () { return s; } };
                }
            }
        };
        global.com = {
            stibo: { core: { domain: { businessrule: {
                BusinessRuleException: function (e) { this.message = e; }
            } } } }
        };
        // Stub queryClassificationProductLinks to return a non-empty list
        node.queryClassificationProductLinks = () => ({ asList: () => ({ size: () => 1 }) });
        // Stub getReferences for materials check
        node.getReferences = () => null;
        const result = br.operation0(node, sellsideAttributes, enforceMandatoryChecks, productToClassLinkType, step, ui, svHasValidImagery, productToMaterialRefType, verifySizeSchemaAttributes);
        delete global.java;
        delete global.com;
        return result;
    }

    // PCF = maternity — valid
    test('passes when PCF=maternity with correct is_maternity and maternity_status', () => {
        const result = runCheck({
            primary_client_focus: 'maternity', is_maternity: 'true', maternity_status: 'Maternity Only',
        });
        expect(result).toBe(true);
    });

    // PCF = maternity — invalid
    test('blocks when PCF=maternity but is_maternity=false', () => {
        const result = runCheck({
            primary_client_focus: 'maternity', is_maternity: 'false', maternity_status: 'Maternity Only',
        });
        expect(result).toContain('is_maternity must be true');
    });

    test('blocks when PCF=maternity but maternity_status is wrong case / value', () => {
        const result = runCheck({
            primary_client_focus: 'maternity', is_maternity: 'true', maternity_status: 'maternity only',
        });
        expect(result).toContain('maternity_status must be Maternity Only');
    });

    test('blocks when PCF=maternity and both flags are missing', () => {
        const result = runCheck({
            primary_client_focus: 'maternity', is_maternity: null, maternity_status: null,
        });
        expect(result).toContain('is_maternity must be true');
    });

    // PCF != maternity — valid
    test('passes when PCF=standard with is_maternity=false', () => {
        const result = runCheck({
            primary_client_focus: 'standard', is_maternity: 'false', maternity_status: null,
        });
        expect(result).toBe(true);
    });

    test('passes when PCF=standard with a trimester maternity_status value', () => {
        const result = runCheck({
            primary_client_focus: 'standard', is_maternity: 'false', maternity_status: 'Second Trimester',
        });
        expect(result).toBe(true);
    });

    // PCF != maternity — invalid
    test('blocks when PCF=standard but is_maternity=true AND maternity_status=Maternity Only', () => {
        const result = runCheck({
            primary_client_focus: 'standard', is_maternity: 'true', maternity_status: 'Maternity Only',
        });
        expect(result).toContain('only valid for maternity primary client focus');
    });

    test('does not block when PCF=standard and is_maternity=true but maternity_status is not Maternity Only', () => {
        // Only the combination of both is invalid for non-maternity
        const result = runCheck({
            primary_client_focus: 'standard', is_maternity: 'true', maternity_status: 'Second Trimester',
        });
        expect(result).toBe(true);
    });
});
