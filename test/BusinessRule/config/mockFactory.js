/**
 * Shared mock factory for STEP object mocks used in unit tests.
 * Provides reusable builders for nodes, managers, references, and other STEP objects.
 */

/**
 * Creates a mock STEP node with getValue/setSimpleValue support.
 * Tracks all calls for assertion.
 *
 * @param {Object} opts - Node configuration
 * @param {string} opts.id - Node ID
 * @param {string} [opts.name] - Node name
 * @param {string} [opts.objectTypeID] - Object type ID (e.g. "StyleVariant")
 * @param {Object} [opts.values] - Initial attribute values { attrID: value }
 * @param {Array} [opts.children] - Child node mocks
 * @returns {Object} Mock node with getValue, getID, getName, getObjectType, getChildren
 */
function createNode(opts) {
    var id = opts.id || "MOCK_NODE";
    var name = opts.name || id;
    var objectTypeID = opts.objectTypeID || "ProductNode";
    var values = Object.assign({}, opts.values || {});
    var children = opts.children || [];
    var calls = {};
    var references = {};

    var node = {
        _values: values,
        _calls: calls,
        getID: function () { return id; },
        getName: function () { return name; },
        setName: jest.fn(function (n) { name = n; }),
        getObjectType: function () {
            return { getID: function () { return objectTypeID; } };
        },
        getValue: function (attrID) {
            if (!calls[attrID]) calls[attrID] = { set: jest.fn(), get: jest.fn() };
            return {
                getSimpleValue: function () {
                    calls[attrID].get();
                    return values[attrID] != null ? values[attrID] : null;
                },
                setSimpleValue: function (val) {
                    calls[attrID].set(val);
                    values[attrID] = val;
                },
                setLOVValueByID: jest.fn(function (val) {
                    values[attrID] = val;
                }),
                canSetValue: function () { return true; },
                isInherited: function () { return false; }
            };
        },
        getChildren: function () {
            return {
                size: function () { return children.length; },
                get: function (i) { return children[i]; },
                toArray: function () { return children; },
                iterator: function () {
                    var idx = 0;
                    return {
                        hasNext: function () { return idx < children.length; },
                        next: function () { return children[idx++]; }
                    };
                }
            };
        },
        getParent: jest.fn(),
        createProduct: jest.fn(function (newId, objType) {
            return createNode({ id: newId, objectTypeID: objType });
        }),
        queryReferences: jest.fn(function () {
            return { asList: function () { return { toArray: function () { return []; } }; } };
        }),
        queryClassificationProductLinks: jest.fn(function () {
            return { asList: function () { return { toArray: function () { return []; } }; } };
        }),
        getClassificationProductLinks: jest.fn(function () {
            return { toArray: function () { return []; } };
        }),
        createReference: jest.fn(),
        createClassificationProductLink: jest.fn()
    };

    return node;
}

/**
 * Creates a mock STEP manager with home access.
 *
 * @param {Object} [homes] - Optional home overrides { attributeHome, productHome, classificationHome, ... }
 * @returns {Object} Mock manager
 */
function createManager(homes) {
    homes = homes || {};

    return {
        getAttributeHome: function () {
            return homes.attributeHome || {
                getAttributeByID: jest.fn(function (id) {
                    return { getID: function () { return id; }, getName: function () { return id; } };
                })
            };
        },
        getProductHome: function () {
            return homes.productHome || {
                getProductByID: jest.fn(function (id) {
                    return createNode({ id: id });
                })
            };
        },
        getClassificationHome: function () {
            return homes.classificationHome || {
                getClassificationByID: jest.fn(function (id) {
                    return { getID: function () { return id; }, getName: function () { return id; } };
                })
            };
        },
        getReferenceTypeHome: function () {
            return homes.referenceTypeHome || {
                getReferenceTypeByID: jest.fn(function (id) {
                    return { getID: function () { return id; } };
                })
            };
        },
        getNodeHome: function () {
            return homes.nodeHome || {
                getObjectByKey: jest.fn()
            };
        },
        getHome: jest.fn(function () { return {}; })
    };
}

/**
 * Creates a mock logger that captures log calls for assertion.
 * @returns {Object} Mock logger with info, warning, error methods and a logs array
 */
function createLogger() {
    var logs = [];
    return {
        logs: logs,
        info: jest.fn(function (msg) { logs.push({ level: 'info', msg: msg }); }),
        warning: jest.fn(function (msg) { logs.push({ level: 'warning', msg: msg }); }),
        error: jest.fn(function (msg) { logs.push({ level: 'error', msg: msg }); })
    };
}

module.exports = {
    createNode: createNode,
    createManager: createManager,
    createLogger: createLogger
};
