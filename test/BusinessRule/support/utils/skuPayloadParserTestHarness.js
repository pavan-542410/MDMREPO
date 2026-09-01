function makeJavaHashSet(initialItems) {
    var items = [];

    function add(item) {
        if (items.indexOf(item) === -1) {
            items.push(item);
        }
    }

    (initialItems || []).forEach(add);

    return {
        add: add,
        contains: function (item) {
            return items.indexOf(item) !== -1;
        },
        toArray: function () {
            return items.slice();
        },
        iterator: function () {
            var index = 0;
            return {
                hasNext: function () {
                    return index < items.length;
                },
                next: function () {
                    return items[index++];
                }
            };
        }
    };
}

function makeAttribute(id, validObjectTypes) {
    var lovValues = {};

    return {
        getID: function () {
            return id;
        },
        toString: function () {
            return "Attribute:" + id;
        },
        getName: function () {
            return id;
        },
        isMultiValued: function () {
            return false;
        },
        isDescription: function () {
            return false;
        },
        getValidForObjectTypes: function () {
            return makeJavaHashSet((validObjectTypes || []).map(function (objectTypeID) {
                return {
                    getID: function () {
                        return objectTypeID;
                    }
                };
            }));
        },
        getListOfValues: function () {
            return {
                createListOfValuesValue: function (value, _unused, lovID) {
                    lovValues[lovID] = value;
                },
                getListOfValuesValueByID: function (lovID) {
                    return {
                        setValue: function (value) {
                            lovValues[lovID] = value;
                        },
                        getValue: function () {
                            return lovValues[lovID];
                        }
                    };
                }
            };
        },
        validObjectTypes: validObjectTypes || []
    };
}

function makeValueBag(state, attrID) {
    return {
        getSimpleValue: function () {
            return state[attrID];
        },
        setSimpleValue: function (value) {
            state[attrID] = value;
        },
        setValue: function (value) {
            state[attrID] = value;
        },
        deleteCurrent: function () {
            state[attrID] = "";
        },
        addValue: function (value) {
            if (!Array.isArray(state[attrID])) {
                state[attrID] = [];
            }
            state[attrID].push(value);
        },
        replace: function () {
            var values = [];
            return {
                addValue: function (value) {
                    values.push(value);
                },
                apply: function () {
                    state[attrID] = values.join(",");
                }
            };
        }
    };
}

function makeAttributeLink(attribute, sequence) {
    return {
        getAttribute: function () {
            return attribute;
        },
        getValue: function (attrID) {
            if (attrID === "DisplaySequence") {
                return makeValueBag({ DisplaySequence: sequence + "" }, "DisplaySequence");
            }
            return makeValueBag({}, attrID);
        }
    };
}

function makeReference(source, target, referenceType) {
    return {
        deleted: false,
        getSource: function () {
            return source;
        },
        getTarget: function () {
            return target;
        },
        getValue: function () {
            return makeValueBag({}, "metadata");
        },
        delete: function () {
            this.deleted = true;
        }
    };
}

function makeCollection(items) {
    return {
        forEach: function (callback) {
            items.slice().forEach(function (item) {
                callback(item);
            });
        },
        asList: function () {
            return {
                toArray: function () {
                    return items.slice();
                }
            };
        },
        toArray: function () {
            return items.slice();
        }
    };
}

function makeList() {
    var items = [];
    items.iterator = function () {
        var index = 0;
        return {
            hasNext: function () {
                return index < items.length;
            },
            next: function () {
                return items[index++];
            }
        };
    };
    return items;
}

function makeNode(registry, id, objectTypeID, parent, initialValues) {
    var state = Object.assign({}, initialValues || {});
    var children = makeList();
    var refsByType = {};
    var classLinksByType = {};
    var attributeLinks = [];
    var objectType = {
        getID: function () {
            return objectTypeID;
        },
        toString: function () {
            return "ObjectType:" + objectTypeID;
        }
    };
    var node = {
        _state: state,
        _refsByType: refsByType,
        _classLinksByType: classLinksByType,
        getID: function () {
            return id;
        },
        toString: function () {
            return id;
        },
        getObjectType: function () {
            return objectType;
        },
        setObjectType: function (nextObjectType) {
            objectType = nextObjectType;
        },
        getParent: function () {
            return parent;
        },
        setParent: function (nextParent) {
            if (parent && parent.getChildren) {
                var oldSiblings = parent.getChildren();
                var oldIndex = oldSiblings.indexOf(node);
                if (oldIndex !== -1) {
                    oldSiblings.splice(oldIndex, 1);
                }
            }
            parent = nextParent;
            if (nextParent && nextParent.getChildren) {
                var newSiblings = nextParent.getChildren();
                if (newSiblings.indexOf(node) === -1) {
                    newSiblings.push(node);
                }
            }
        },
        getChildren: function () {
            return children;
        },
        createProduct: function (childID, childTypeID) {
            var childInitialValues = {};
            if (childTypeID === "SKUNode" && childID) {
                childInitialValues.sku_id = (childID + "").replace(/^SKU_/, "");
            }
            return registry.createNode(childID, childTypeID, node, childInitialValues);
        },
        createEntity: function (childID, childTypeID) {
            var nextID = childID || (childTypeID + "_" + (children.length + 1));
            return registry.createNode(nextID, childTypeID, node, {});
        },
        createClassification: function (childID, childTypeID) {
            return registry.createNode(childID, childTypeID, node, {});
        },
        getValue: function (attrID) {
            if (!Object.prototype.hasOwnProperty.call(state, attrID)) {
                state[attrID] = "";
            }
            return makeValueBag(state, attrID);
        },
        setSimpleValue: function (attribute, value) {
            state[attribute.getID()] = value;
        },
        setName: function (value) {
            state.__name = value;
        },
        getName: function () {
            return state.__name || "";
        },
        createReference: function (target, referenceType) {
            if (!referenceType || !target) {
                return makeReference(node, target, referenceType || { getID: function () { return "unknown"; } });
            }
            var refTypeID = referenceType.getID();
            if (!refsByType[refTypeID]) {
                refsByType[refTypeID] = [];
            }
            var reference = makeReference(node, target, referenceType);
            refsByType[refTypeID].push(reference);
            return reference;
        },
        queryReferences: function (referenceType) {
            if (!referenceType) {
                return makeCollection([]);
            }
            return makeCollection((refsByType[referenceType.getID()] || []).filter(function (reference) {
                return !reference.deleted;
            }));
        },
        createClassificationProductLink: function (classification, linkType) {
            var linkTypeID = linkType.getID();
            if (!classLinksByType[linkTypeID]) {
                classLinksByType[linkTypeID] = [];
            }
            var link = {
                deleted: false,
                getClassification: function () {
                    return classification;
                },
                delete: function () {
                    this.deleted = true;
                }
            };
            classLinksByType[linkTypeID].push(link);
            return link;
        },
        queryClassificationProductLinks: function (linkType) {
            return makeCollection((classLinksByType[linkType.getID()] || []).filter(function (link) {
                return !link.deleted;
            }));
        },
        getAttributeLinks: function () {
            return makeCollection(attributeLinks);
        },
        setAttributeLinks: function (nextAttributeLinks) {
            attributeLinks = nextAttributeLinks.slice();
        },
        approve: function () {
            if (typeof registry.onApprove === "function") {
                registry.onApprove(this);
            }
        }
    };

    if (parent && parent.getChildren) {
        parent.getChildren().push(node);
    }
    registry.products[id] = node;
    if (objectTypeID.indexOf("Brand") !== -1 || objectTypeID.indexOf("Classification") !== -1 || objectTypeID.indexOf("StyleNode") !== -1) {
        registry.classifications[id] = node;
    }
    return node;
}

function createNode(id, objectTypeID, parent, initialValues) {
    return makeNode(this, id, objectTypeID, parent, initialValues);
}

function installJavaMocks() {
    global.java = {
        util: {
            HashMap: function () {
                var values = {};
                return {
                    put: function (key, value) {
                        values[key] = value;
                    },
                    get: function (key) {
                        return values[key];
                    }
                };
            },
            HashSet: function () {
                return makeJavaHashSet();
            }
        }
    };
    global.logger = {
        info: function () {},
        warning: jest.fn(),
        error: jest.fn()
    };
    global.log = global.logger;
}

function clearJavaMocks() {
    delete global.java;
    delete global.logger;
    delete global.log;
}

function buildContext(payload, existingProductValues, options) {
    var registry = {
        products: {},
        classifications: {},
        onApprove: options && options.onApprove
    };

    registry.createNode = createNode.bind(registry);

    var productAttributes = [
        makeAttribute("product_name", ["ProductNode"]),
        makeAttribute("vendor_style_id", ["ProductNode"]),
        makeAttribute("dmdm_vendor_style_id", ["ProductNode"])
    ];
    var colorwayAttributes = [
        makeAttribute("brand_color", ["ColorwayVariantNode", "SKUNode"]),
        makeAttribute("color", ["ColorwayVariantNode", "SKUNode"]),
        makeAttribute("colorway_variant_id", ["ColorwayVariantNode"]),
        makeAttribute("catalog_status", ["ColorwayVariantNode", "StyleVariant"]),
        makeAttribute("sample_approved_at", ["ColorwayVariantNode"]),
        makeAttribute("is_sample_approved", ["ColorwayVariantNode"])
    ];
    var styleVariantAttributes = [
        makeAttribute("ft_data_model_style_variant_id", ["StyleVariant"]),
        makeAttribute("status", ["StyleVariant"]),
        makeAttribute("style_name", ["StyleVariant", "SKUNode"]),
        makeAttribute("style_program", ["StyleVariant", "SKUNode"]),
        makeAttribute("legacy_size_id", ["StyleVariant", "SKUNode"]),
        makeAttribute("ft_status", ["StyleVariant"]),
        makeAttribute("internal_vendor_id", ["StyleVariant"])
    ];
    var skuAttributes = [
        makeAttribute("sku_id", ["SKUNode"]),
        makeAttribute("size_name", ["SKUNode"])
    ];
    var managedByFTSet = makeJavaHashSet([].concat(
        productAttributes,
        colorwayAttributes,
        styleVariantAttributes,
        skuAttributes
    ));
    var managedByUDPSet = makeJavaHashSet([].concat(
        productAttributes,
        colorwayAttributes,
        styleVariantAttributes
    ));

    var emptySet = makeJavaHashSet();
    var productSet = makeJavaHashSet(productAttributes);
    var colorwaySet = makeJavaHashSet(colorwayAttributes);
    var styleVariantSet = makeJavaHashSet(styleVariantAttributes);
    var brandsRoot = registry.createNode("Brands", "BrandRoot", null, {});
    var labelsRoot = registry.createNode("Labels", "LabelsRoot", null, {});
    var materialsRoot = registry.createNode("Materials", "MaterialsRoot", null, {});
    var sfmphRoot = registry.createNode("StitchFixMerchProductHierarchy", "ProductHierarchyRoot", null, {});
    var inboundRoot = registry.createNode("InboundFashionThingMessages", "InboundRoot", null, {});
    var unclassified = registry.createNode("UnclassifiedSKUs", "UnclassifiedRoot", null, {});
    var jackets = registry.createNode("SFMPH_CLS_JACKETS", "ProductClassificationNode", sfmphRoot, { __name: "Jackets" });
    registry.classifications.IT_CLS_100 = registry.createNode("IT_CLS_100", "ItemTypeClassification", null, {});
    registry.classifications.schema_10 = registry.createNode("schema_10", "SizeSchema", null, {});
    registry.createNode("core_size_10", "CoreSize", registry.classifications.schema_10, {
        size_name: "M",
        core_size_table_id: "10"
    });
    var sizeNameAttr = makeAttribute("size_name", ["SKUNode"]);
    registry.classifications.schema_10.setAttributeLinks([
        makeAttributeLink(sizeNameAttr, 1)
    ]);

    var productID = "PRD_" + payload.vendor_style_id;
    if (existingProductValues) {
        registry.createNode(productID, "ProductNode", jackets, initialProductValues(existingProductValues));
    }

    var messageContainer = registry.createNode("IMC_" + payload.vendor_style_id, "InboundMessageContainer", inboundRoot, {
        sku_payload: options && Object.prototype.hasOwnProperty.call(options, "rawSkuPayload")
            ? options.rawSkuPayload
            : JSON.stringify(payload),
        processing_messages: [],
        processedAt: ""
    });

    var attributesByID = {
        product_name: productAttributes[0],
        vendor_style_id: productAttributes[1],
        dmdm_vendor_style_id: productAttributes[2],
        brand_color: colorwayAttributes[0],
        color: colorwayAttributes[1],
        colorway_variant_id: colorwayAttributes[2],
        catalog_status: colorwayAttributes[3],
        sample_approved_at: colorwayAttributes[4],
        is_sample_approved: colorwayAttributes[5],
        ft_data_model_style_variant_id: styleVariantAttributes[0],
        status: styleVariantAttributes[1],
        size_name: sizeNameAttr,
        style_name: styleVariantAttributes[2],
        style_program: styleVariantAttributes[3],
        legacy_size_id: styleVariantAttributes[4],
        ft_status: styleVariantAttributes[5],
        internal_vendor_id: styleVariantAttributes[6]
    };

    var referenceTypes = {};
    ["PayloadToSKUReference", "StyleVariantToSizeSchemaReference", "external_asset_reference", "ProductToLabel"].forEach(function (id) {
        referenceTypes[id] = {
            getID: function () {
                return id;
            },
            toString: function () {
                return "ReferenceType:" + id;
            },
            getValidForObjectTypes: function () {
                return makeJavaHashSet();
            }
        };
    });

    var linkTypes = {};
    ["ProductToBrandLink", "ProductToVendorLink", "StyleVariantToStyleLink", "SKUToSizeSchemaLink"].forEach(function (id) {
        linkTypes[id] = {
            getID: function () {
                return id;
            },
            toString: function () {
                return "LinkType:" + id;
            }
        };
    });

    var homes = {
        attribute: {
            getAttributeByID: function (id) {
                if (!attributesByID[id]) {
                    attributesByID[id] = makeAttribute(id, []);
                }
                return attributesByID[id];
            }
        },
        attrGroup: {
            getAttributeGroupByID: function (id) {
                var map = {
                    ProductUpheritAttributes: productSet,
                    ManagedByFT: managedByFTSet,
                    ManagedByUDP: managedByUDPSet,
                    ColorwayUpheritAttributes: colorwaySet,
                    StyleVariantUpheritAttributes: styleVariantSet,
                    ManagedByDMDM: emptySet,
                    ElasticSearchAttributeGroup: makeJavaHashSet([
                        attributesByID.style_name
                    ])
                };
                return {
                    getAttributes: function () {
                        return map[id] || emptySet;
                    },
                    getAllAttributes: function () {
                        return map[id] || emptySet;
                    }
                };
            }
        },
        entity: {
            getEntityByID: function (id) {
                if (id === "Labels") {
                    return labelsRoot;
                }
                if (id === "Materials") {
                    return materialsRoot;
                }
                return registry.products[id] || registry.classifications[id] || null;
            }
        },
        product: {
            getProductByID: function (id) {
                return registry.products[id] || null;
            }
        },
        classification: {
            getClassificationByID: function (id) {
                return registry.classifications[id] || null;
            }
        },
        node: {
            getObjectByKey: function (key, value) {
                if (key === "SFMPHNameKey" && value === "Jackets") {
                    return jackets;
                }
                if (key === "TagSizeSchemaKey" && value === "schema_10") {
                    return registry.classifications.schema_10;
                }
                if (key === "label_key") {
                    return registry.products[value] || null;
                }
                return null;
            }
        },
        linkType: {
            getLinkTypeByID: function (id) {
                return linkTypes[id] || {
                    getID: function () {
                        return id;
                    },
                    toString: function () {
                        return "LinkType:" + id;
                    }
                };
            }
        },
        objectType: {
            getObjectTypeByID: function (id) {
                return {
                    getID: function () {
                        return id;
                    },
                    toString: function () {
                        return "ObjectType:" + id;
                    }
                };
            }
        }
    };

    var manager = {
        getProductHome: function () {
            return homes.product;
        },
        getClassificationHome: function () {
            return homes.classification;
        },
        getNodeHome: function () {
            return homes.node;
        },
        getReferenceTypeHome: function () {
            return {
                getReferenceTypeByID: function (id) {
                    return referenceTypes[id];
                }
            };
        },
        getAttributeHome: function () {
            return homes.attribute;
        },
        getAttributeGroupHome: function () {
            return homes.attrGroup;
        },
        getEntityHome: function () {
            return homes.entity;
        },
        getLinkTypeHome: function () {
            return {
                getClassificationProductLinkTypeByID: function (id) {
                    return {
                        getID: function () {
                            return id;
                        },
                        toString: function () {
                            return "LinkType:" + id;
                        }
                    };
                }
            };
        },
        getObjectTypeHome: function () {
            return homes.objectType;
        }
    };

    var sentMails = options && options.sentMails ? options.sentMails : [];
    var mailHome = {
        mail: function () {
            var message = {
                to: [],
                subject: "",
                plain: "",
                html: "",
                sent: false
            };
            sentMails.push(message);
            return {
                addTo: function (recipient) {
                    message.to.push(recipient);
                },
                subject: function (value) {
                    message.subject = value;
                },
                plainMessage: function (value) {
                    message.plain = value;
                },
                htmlMessage: function (value) {
                    message.html = value;
                },
                send: function () {
                    message.sent = true;
                }
            };
        }
    };
    var sendGenericEmail = {
        evaluate: function (params) {
            var optionsJson = params && params.get ? params.get("optionsJson") : params.optionsJson;
            var mailOptions = JSON.parse(optionsJson + "");
            var message = {
                to: (mailOptions.to || []).slice(),
                subject: mailOptions.subject || "",
                plain: mailOptions.plainBody || "",
                html: mailOptions.htmlBody || "",
                sent: true
            };
            sentMails.push(message);
            return true;
        }
    };

    var context = {
        manager: manager,
        mailHome: mailHome,
        sendGenericEmail: sendGenericEmail,
        homes: homes,
        messageContainer: messageContainer,
        sfmphRoot: sfmphRoot,
        brandsRoot: brandsRoot,
        labelsRoot: labelsRoot,
        materialsRoot: materialsRoot,
        productID: productID,
        payload: payload,
        productToClassLinkType: {
            getID: function () {
                return "ProductToClassLInk";
            },
            toString: function () {
                return "LinkType:ProductToClassLInk";
            }
        },
        styleProgramsLOV: {
            queryValidValues: function () {
                return {
                    forEach: function () {}
                };
            }
        },
        attrGroups: {
            managedByUDP: homes.attrGroup.getAttributeGroupByID("ManagedByUDP"),
            managedByFT: homes.attrGroup.getAttributeGroupByID("ManagedByFT"),
            managedByDMDM: homes.attrGroup.getAttributeGroupByID("ManagedByDMDM")
        }
    };

    if (options && typeof options.onBuildContext === "function") {
        options.onBuildContext(context, registry);
    }

    return context;
}

function makeLegacyUtil(homes) {
    return {
        initialize: function () {
            return {
                attrCache: {},
                lookUpAttrCache: {},
                refTypeCache: {},
                prodCache: {},
                classCache: {},
                linkTypeCache: {},
                attrHome: homes.attribute,
                lookUpTableHome: {},
                prodHome: homes.product,
                classHome: homes.classification,
                refTypeHome: {
                    getReferenceTypeByID: function (id) {
                        return homes.linkType.getLinkTypeByID(id);
                    }
                },
                nodeHome: homes.node,
                nodeCache: {},
                linkTypeHome: homes.linkType
            };
        },
        getClassification: function (id, classificationHome, cache) {
            if (!Object.prototype.hasOwnProperty.call(cache, id)) {
                cache[id] = classificationHome.getClassificationByID(id);
            }
            return cache[id];
        },
        getObjectByKey: function (value, keyID, nodeHome, cache) {
            var cacheKey = keyID + ":" + value;
            if (!Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
                cache[cacheKey] = nodeHome.getObjectByKey(keyID, value);
            }
            return cache[cacheKey];
        },
        getProduct: function (id, productHome, cache) {
            if (!Object.prototype.hasOwnProperty.call(cache, id)) {
                cache[id] = productHome.getProductByID(id);
            }
            return cache[id];
        },
        getRefType: function (id, refTypeHome, cache) {
            if (!Object.prototype.hasOwnProperty.call(cache, id)) {
                if (refTypeHome.getReferenceTypeByID) {
                    cache[id] = refTypeHome.getReferenceTypeByID(id);
                } else {
                    cache[id] = homes.linkType.getLinkTypeByID(id);
                }
            }
            return cache[id];
        },
        getLinkType: function (id, linkTypeHome, cache) {
            if (!Object.prototype.hasOwnProperty.call(cache, id)) {
                cache[id] = linkTypeHome.getLinkTypeByID
                    ? linkTypeHome.getLinkTypeByID(id)
                    : linkTypeHome.getClassificationProductLinkTypeByID(id);
            }
            return cache[id];
        },
        getAttr: function (id, cache, attrHome) {
            if (!Object.prototype.hasOwnProperty.call(cache, id)) {
                cache[id] = attrHome.getAttributeByID(id);
            }
            return cache[id];
        },
        getLookUpAttr: function (id) {
            var lookup = {
                vendor_style_name: "product_name",
                dmdm_pre_pcs_vendorcolorway_imageway_style_id: "dmdm_vendor_style_id"
            };
            return lookup[id] || null;
        }
    };
}

function runLegacySingleton(parserModule, payload, existingProductValues, options) {
    var context = buildContext(payload, existingProductValues, options);
    var util = makeLegacyUtil(context.homes);
    var queuedEvents = [];

    parserModule.operation0(
        context.messageContainer,
        context.sfmphRoot,
        context.manager,
        global.logger,
        {
            queueDerivedEvent: function (eventType, node) {
                queuedEvents.push({
                    eventType: eventType,
                    node: node
                });
            }
        },
        { id: "upheritEvent" },
        context.styleProgramsLOV,
        {},
        util
    );

    var product = context.homes.product.getProductByID(context.productID);
    if (product) {
        product.__testContext = context;
        product.__queuedEvents = queuedEvents;
    }
    return product;
}

function runLegacyBatch(parserModule, payload, existingProductValues, options) {
    var context = buildContext(payload, existingProductValues, options);
    var util = makeLegacyUtil(context.homes);
    var queuedEvents = [];
    var batch = {
        getEvents: function () {
            return {
                iterator: function () {
                    var emitted = false;
                    return {
                        hasNext: function () {
                            return !emitted;
                        },
                        next: function () {
                            emitted = true;
                            return {
                                getNode: function () {
                                    return context.messageContainer;
                                }
                            };
                        }
                    };
                }
            };
        }
    };

    parserModule.operation0(
        context.sfmphRoot,
        context.manager,
        {
            queueDerivedEvent: function (eventType, node) {
                queuedEvents.push({
                    eventType: eventType,
                    node: node
                });
            }
        },
        { id: "upheritEvent" },
        batch,
        context.styleProgramsLOV,
        context.attrGroups.managedByUDP,
        context.attrGroups.managedByFT,
        context.attrGroups.managedByDMDM,
        {},
        util
    );

    var product = context.homes.product.getProductByID(context.productID);
    if (product) {
        product.__testContext = context;
        product.__queuedEvents = queuedEvents;
    }
    return product;
}

function initialProductValues(values) {
    return Object.assign({
        product_name: "",
        vendor_style_id: "",
        dmdm_vendor_style_id: ""
    }, values || {});
}

function makeLibraries(homes) {
    return {
        dt: {
            nowISO: function () {
                return "2026-03-27 12:00:00";
            },
            convertToISODate: function (value) {
                return value;
            },
            getLatestDate: function (nextValue) {
                return nextValue;
            },
            getEarliestDate: function (nextValue) {
                return nextValue;
            }
        },
        core: {
            getPrimarySKU: function () {
                return null;
            },
            getPrimaryStyleVariant: function () {
                return null;
            },
            getPrimaryColorway: function () {
                return null;
            }
        },
        s: {
            getAllHomes: function () {
                return homes;
            },
            isAttrValidForObjectType: function (attribute, objectType) {
                return attribute.validObjectTypes.indexOf(objectType.getID()) !== -1;
            },
            manageLinksOrReferences: function (sourceNode, linkOrRefType, targetIDs, getTargetFunction) {
                (targetIDs || []).forEach(function (targetID) {
                    var target = getTargetFunction(targetID);
                    if (!target) {
                        return;
                    }
                    var objectTypeID = target.getObjectType ? (target.getObjectType().getID() + "") : "";
                    if (
                        objectTypeID.indexOf("Classification") !== -1 ||
                        objectTypeID === "StyleNode" ||
                        objectTypeID === "Brand" ||
                        objectTypeID === "SizeSchema"
                    ) {
                        sourceNode.createClassificationProductLink(target, linkOrRefType);
                    } else {
                        sourceNode.createReference(target, linkOrRefType);
                    }
                });
            }
        },
        wf: {}
    };
}

function runSingleton(parserModule, payload, existingProductValues, options) {
    var context = buildContext(payload, existingProductValues, options);
    var libraries = makeLibraries(context.homes);
    var isRejected = options && options.isFTManagedRejected;

    parserModule.operation0(
        context.sfmphRoot,
        context.manager,
        context.styleProgramsLOV,
        context.attrGroups.managedByUDP,
        context.attrGroups.managedByFT,
        context.attrGroups.managedByDMDM,
        { evaluate: function () { return null; } },
        context.manager.getReferenceTypeHome().getReferenceTypeByID("external_asset_reference"),
        { evaluate: function () { return []; } },
        context.productToClassLinkType,
        null,
        context.messageContainer,
        context.mailHome,
        context.sendGenericEmail,
        context.brandsRoot,
        { evaluate: function () { return { isRejected: function () { return !!isRejected; } }; } },
        libraries.dt,
        libraries.core,
        libraries.s,
        libraries.wf
    );

    var product = context.homes.product.getProductByID(context.productID);
    var result = product || context.messageContainer;
    result.__testContext = context;
    return result;
}

function runBatch(parserModule, payload, existingProductValues, options) {
    var context = buildContext(payload, existingProductValues, options);
    var libraries = makeLibraries(context.homes);
    var isRejected = options && options.isFTManagedRejected;
    var batch = {
        getEvents: function () {
            return {
                iterator: function () {
                    var emitted = false;
                    return {
                        hasNext: function () {
                            return !emitted;
                        },
                        next: function () {
                            emitted = true;
                            return {
                                getNode: function () {
                                    return context.messageContainer;
                                }
                            };
                        }
                    };
                }
            };
        }
    };

    parserModule.operation0(
        context.sfmphRoot,
        context.manager,
        batch,
        context.styleProgramsLOV,
        context.attrGroups.managedByUDP,
        context.attrGroups.managedByFT,
        context.attrGroups.managedByDMDM,
        { evaluate: function () { return null; } },
        context.manager.getReferenceTypeHome().getReferenceTypeByID("external_asset_reference"),
        { evaluate: function () { return []; } },
        context.productToClassLinkType,
        null,
        context.mailHome,
        context.sendGenericEmail,
        context.brandsRoot,
        { evaluate: function () { return { isRejected: function () { return !!isRejected; } }; } },
        libraries.dt,
        libraries.core,
        libraries.s,
        libraries.wf
    );

    var product = context.homes.product.getProductByID(context.productID);
    var result = product || context.messageContainer;
    result.__testContext = context;
    return result;
}

module.exports = {
    clearJavaMocks: clearJavaMocks,
    installJavaMocks: installJavaMocks,
    runBatch: runBatch,
    runLegacyBatch: runLegacyBatch,
    runLegacySingleton: runLegacySingleton,
    runSingleton: runSingleton
};
