'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WORKFLOW_XML_PATH = path.resolve(
    process.cwd(),
    'step-configs/STEPWorkflow/STEPWorkflow_ProductCreation.xml'
);
const LOCAL_RULE_ID = 'acn-0ac5c3be-6afa-40eb-9a42-24eb836d4ed9';

function decodeXmlEntities(text) {
    return text
        .replace(/&#10;/g, '\n')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function extractLocalRuleJavaScript(localRuleId) {
    const workflowXml = fs.readFileSync(WORKFLOW_XML_PATH, 'utf8');
    const localRuleMatch = workflowXml.match(
        new RegExp(
            '<LocalBusinessRule ID="' + localRuleId + '"[\\s\\S]*?<Configuration>([A-Za-z0-9+/=]+)</Configuration>'
        )
    );
    if (!localRuleMatch) {
        throw new Error('Local rule not found: ' + localRuleId);
    }

    const compressed = Buffer.from(localRuleMatch[1], 'base64');
    let decodedConfig;
    try {
        decodedConfig = zlib.gunzipSync(compressed).toString('utf8');
    } catch (e) {
        decodedConfig = zlib.inflateSync(compressed).toString('utf8');
    }

    const jsParamMatch = decodedConfig.match(
        /<Parameter ID="JavaScript" Type="java\.lang\.String">([\s\S]*?)<\/Parameter>/
    );
    if (!jsParamMatch) {
        throw new Error('JavaScript parameter missing for local rule: ' + localRuleId);
    }

    return decodeXmlEntities(jsParamMatch[1]);
}

function createNodeWithValues(initialValues) {
    const store = Object.assign({}, initialValues || {});
    const wrappers = {};

    return {
        _values: store,
        getValue: function (attrId) {
            if (!wrappers[attrId]) {
                wrappers[attrId] = {
                    getSimpleValue: jest.fn(function () { return store[attrId] == null ? null : store[attrId]; }),
                    setSimpleValue: jest.fn(function (value) { store[attrId] = value; }),
                    setLOVValueByID: jest.fn(function (value) { store[attrId] = value; })
                };
            }
            return wrappers[attrId];
        }
    };
}

function createClassNodeChain(opts) {
    const level1 = {
        getID: function () { return opts.level1Id; },
        getName: function () { return opts.level1Name; },
        getParent: function () {
            return {
                getParent: function () {
                    return {
                        getID: function () { return opts.lobId || 'LOB_DEFAULT'; }
                    };
                }
            };
        }
    };
    return {
        getParent: function () { return level1; }
    };
}

describe('Local workflow rule acn-0ac5c3be-6afa-40eb-9a42-24eb836d4ed9', () => {
    let jsCode;
    let runRule;

    beforeAll(() => {
        jsCode = extractLocalRuleJavaScript(LOCAL_RULE_ID);
        runRule = new Function('node', 'step', 'getFirstClass', 'log', jsCode);
    });

    test('contains FT parity maternity default logic', () => {
        expect(jsCode).toContain('trimester_123_friendly');
        expect(jsCode).toContain('jewelry');
        expect(jsCode).toContain('footwear');
        expect(jsCode).toContain('accessories');
    });

    test('defaults maternity_status for Jewelry parent by name', () => {
        const node = createNodeWithValues({ maternity_status: null, primary_client_focus: null });
        const getFirstClass = {
            evaluate: jest.fn(function () {
                return createClassNodeChain({ level1Id: 'X1', level1Name: 'Jewelry', lobId: 'LOB_OTHER' });
            })
        };

        runRule(node, {}, getFirstClass, { info: jest.fn() });

        expect(node.getValue('maternity_status').setLOVValueByID).toHaveBeenCalledWith('trimester_123_friendly');
        expect(node._values.maternity_status).toBe('trimester_123_friendly');
    });

    test('defaults maternity_status for fallback department ID', () => {
        const node = createNodeWithValues({ maternity_status: null, primary_client_focus: null });
        const getFirstClass = {
            evaluate: jest.fn(function () {
                return createClassNodeChain({ level1Id: 'IT_DEP_90', level1Name: 'SomeName', lobId: 'LOB_OTHER' });
            })
        };

        runRule(node, {}, getFirstClass, { info: jest.fn() });

        expect(node.getValue('maternity_status').setLOVValueByID).toHaveBeenCalledWith('trimester_123_friendly');
        expect(node._values.maternity_status).toBe('trimester_123_friendly');
    });

    test('does not overwrite imported maternity_status', () => {
        const node = createNodeWithValues({ maternity_status: 'Maternity Only', primary_client_focus: null });
        const getFirstClass = {
            evaluate: jest.fn(function () {
                return createClassNodeChain({ level1Id: 'IT_DEP_9', level1Name: 'Jewelry', lobId: 'LOB_OTHER' });
            })
        };

        runRule(node, {}, getFirstClass, { info: jest.fn() });

        expect(node.getValue('maternity_status').setLOVValueByID).not.toHaveBeenCalled();
        expect(node._values.maternity_status).toBe('Maternity Only');
    });

    test('does not set maternity_status for non-target parents', () => {
        const node = createNodeWithValues({ maternity_status: null, primary_client_focus: null });
        const getFirstClass = {
            evaluate: jest.fn(function () {
                return createClassNodeChain({ level1Id: 'IT_DEP_777', level1Name: 'Womens', lobId: 'LOB_OTHER' });
            })
        };

        runRule(node, {}, getFirstClass, { info: jest.fn() });

        expect(node.getValue('maternity_status').setLOVValueByID).not.toHaveBeenCalled();
        expect(node._values.maternity_status).toBeNull();
    });
});
