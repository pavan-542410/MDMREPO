const merchSetLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_MerchSetFunctionLibrary');

function createLogger() {
  return {
    info: jest.fn()
  };
}

function createSimpleValue(value, idValue) {
  function asRhinoString(stringValue) {
    if (stringValue === null || stringValue === undefined || Array.isArray(stringValue)) {
      return stringValue;
    }

    if (typeof stringValue !== 'string') {
      return stringValue;
    }

    return {
      isEmpty: () => stringValue.length === 0,
      toString: () => stringValue,
      valueOf: () => stringValue
    };
  }

  const holder = {
    currentValue: value,
    values: [],
    getSimpleValue: () => asRhinoString(holder.currentValue),
    getID: () => idValue,
    getValues: () => ({
      toArray: () => holder.values.map((entry) => ({
        getValue: () => entry,
        getSimpleValue: () => entry,
        getID: () => entry
      }))
    }),
    addValue: (newValue) => {
      holder.values.push(newValue);
    },
    deleteCurrent: () => {
      holder.values = [];
    },
    setSimpleValue: (newValue) => {
      holder.currentValue = newValue;
    }
  };

  if (Array.isArray(value)) {
    holder.values = value.slice();
    holder.currentValue = value[0];
  }

  return holder;
}

function createNode(values) {
  const attrs = values || {};

  return {
    getValue: (attrID) => {
      if (!attrs[attrID]) {
        attrs[attrID] = createSimpleValue(null, null);
      }
      return attrs[attrID];
    },
    getRevision: () => ({
      getEditedDate: () => ({
        after: () => true
      })
    })
  };
}

function createReferenceCollection(targets) {
  return {
    asList: () => ({
      size: () => targets.length,
      toArray: () => targets.map((target) => ({
        getTarget: () => target
      }))
    }),
    forEach: (callback) => {
      targets.forEach((target) => {
        callback({
          getTarget: () => target
        });
      });
    }
  };
}

function createDataContainerEntry(attributeID, comparator, values) {
  return {
    getDataContainerObject: () => ({
      getValue: (attrID) => {
        if (attrID === 'CriteriaAttributeSelection') {
          return {
            getID: () => attributeID
          };
        }

        if (attrID === 'CriteriaComparatorSelection') {
          return {
            getSimpleValue: () => comparator
          };
        }

        return {
          getValues: () => ({
            toArray: () => values.map((value) => ({
              getID: () => value,
              getSimpleValue: () => value
            }))
          })
        };
      }
    })
  };
}

function createSearchCriteriaNode(options) {
  return {
    getObjectType: () => ({
      getID: () => 'SearchCriteriaNode'
    }),
    getValue: (attrID) => {
      if (attrID === 'CriteriaType_IncludeExclude') {
        return createSimpleValue(options.includeExclude);
      }
      return createSimpleValue(null);
    },
    queryReferences: (refType) => {
      if (refType.getID() === 'SearchCriteriaMerchHierarchyReference') {
        return createReferenceCollection(options.merchTargets || []);
      }
      return createReferenceCollection(options.itemTypeTargets || []);
    },
    getDataContainers: () => ({
      toArray: () => [{
        getDataContainerType: () => ({
          getID: () => 'SearchCriteriaAttributeData'
        }),
        getDataContainers: () => ({
          toArray: () => options.entries || []
        })
      }]
    })
  };
}

function createMerchSetNode(criteriaChildren, linkedProductsByID) {
  const existingRefs = [];

  return {
    linkedProductsByID,
    createdRefs: [],
    getChildren: () => ({
      toArray: () => criteriaChildren
    }),
    queryReferences: () => ({
      forEach: (callback) => {
        existingRefs.forEach(callback);
      }
    }),
    createReference: (target, refTypeID) => {
      const ref = {
        refTypeID,
        getTarget: () => target
      };
      existingRefs.push(ref);
      return ref;
    }
  };
}

describe('BusinessRule_MerchSetFunctionLibrary', () => {
  beforeEach(() => {
    function createConditionNode() {
      return {
        and: () => createConditionNode(),
        or: () => createConditionNode(),
        except: () => createConditionNode(),
        inherited: () => createConditionNode(),
        lov: () => createConditionNode(),
        id: () => createConditionNode(),
        eq: () => createConditionNode(),
        neq: () => createConditionNode(),
        exists: () => createConditionNode(),
        simpleBelow: () => createConditionNode()
      };
    }

    global.java = {
      text: {
        SimpleDateFormat: function SimpleDateFormat() {
          return {
            parse: () => new Date('2024-01-01T00:00:00.000Z'),
            format: () => '2024-02-03 10:20:30'
          };
        }
      }
    };

    global.com = {
      stibo: {
        query: {
          condition: {
            Conditions: {
              objectType: () => createConditionNode(),
              hierarchy: () => createConditionNode(),
              valueOf: () => createConditionNode()
            }
          }
        },
        core: {
          domain: {
            Product: 'Product',
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {}
            }
          }
        }
      }
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
  });

  test('exports key constants and serializes nested values with jsonToString helpers', () => {
    expect(merchSetLibrary.includeExcludeAttrID).toBe('CriteriaType_IncludeExclude');
    expect(merchSetLibrary.listCriteriaKeyAttrID).toBe('ListKeySelection');
    expect(merchSetLibrary.jsonToString({ ids: ['SKU_1', 2] })).toBe('{"ids" : ["SKU_1", "2"]}');
    expect(merchSetLibrary.printObject({ status: 'active' })).toBe('{"status" : "active"}');
    expect(merchSetLibrary.printArray(['A', 3])).toBe('["A", "3"]');
    expect(merchSetLibrary.printSimple('value')).toBe('"value"');
  });

  test('logs search and list criteria in the expected format', () => {
    const logger = createLogger();

    merchSetLibrary.logSearchCriteria({
      includeExclude: 'include',
      merchProductBelow: 'MERCH_1',
      itemTypeProductBelow: 'ITEM_1',
      equalsCriteria: { color: ['Blue'] },
      notEqualsCriteria: { brand: ['Acme'] }
    }, logger);

    merchSetLibrary.logListCriteria({
      includeExclude: 'exclude',
      ids: ['SKU_1', 'SKU_2']
    }, logger);

    expect(logger.info).toHaveBeenCalledWith('Criteria...');
    expect(logger.info).toHaveBeenCalledWith('Include/Exclude = include');
    expect(logger.info).toHaveBeenCalledWith('Search Below Merch Node = MERCH_1');
    expect(logger.info).toHaveBeenCalledWith('Search Below Item Type Node = ITEM_1');
    expect(logger.info).toHaveBeenCalledWith('\tcolor = Blue');
    expect(logger.info).toHaveBeenCalledWith('\tbrand = Acme');
    expect(logger.info).toHaveBeenCalledWith('Include/Exclude = exclude');
    expect(logger.info).toHaveBeenCalledWith('IDs: = SKU_1,SKU_2');
  });

  test('parses list criteria, tokenizes raw values, and resolves SKU keys through node home', () => {
    const listNode = createNode({
      CriteriaType_IncludeExclude: createSimpleValue('Include'),
      ListKeySelection: createSimpleValue('SKU ID'),
      RawSKUList: createSimpleValue('sku-1, sku-2\nmissing'),
      MatchedSKUList: createSimpleValue([]),
      UnmatchedSKUList: createSimpleValue([]),
      LastParsedDate: createSimpleValue(null)
    });

    const step = {
      getNodeHome: () => ({
        getObjectByKey: (keyID, token) => {
          if (keyID !== 'sku_key' || token === 'missing') {
            return null;
          }
          return {
            getID: () => token.toUpperCase()
          };
        }
      })
    };

    const criteria = merchSetLibrary.getListCriteriaForNode(listNode, step, createLogger());

    expect(criteria).toEqual({
      includeExclude: 'include',
      keySelection: 'sku',
      ids: ['SKU-1', 'SKU-2']
    });
    expect(listNode.getValue('UnmatchedSKUList').values).toEqual(['missing']);
    expect(listNode.getValue('LastParsedDate').getSimpleValue() + '').toBe('2024-02-03 10:20:30');
  });

  test('resolves list criteria by style variant and filters keys by object presence', () => {
    const criteria = merchSetLibrary.getResultsForListCriteria({
      keySelection: 'sv',
      ids: ['SV_1']
    }, {
      getClassificationHome: () => ({
        getClassificationByID: () => ({
          queryClassificationProductLinks: () => ({
            forEach: (callback) => {
              callback({
                getProduct: () => ({
                  getID: () => 'SKU_123'
                })
              });
            }
          })
        })
      })
    }, null, createLogger());

    expect(criteria).toEqual(['SKU_123']);
    expect(merchSetLibrary.getResultsForListCriteria({
      keySelection: 'sku',
      ids: ['SKU_999']
    }, {}, null, createLogger())).toEqual(['SKU_999']);
    expect(merchSetLibrary.checkForKeysInObject(['keep', 'drop'], { keep: true })).toEqual(['keep']);
  });

  test('collects merch and item type parentage chains', () => {
    const merchRoot = {
      getID: () => 'ROOT',
      getParent: () => null
    };
    const merchParent = {
      getID: () => 'PARENT',
      getParent: () => merchRoot
    };
    const skuNode = {
      getParent: () => merchParent
    };

    expect(merchSetLibrary.getMerchParentage(skuNode, {})).toEqual({
      PARENT: '',
      ROOT: ''
    });

    const itemRoot = {
      getID: () => 'IT_ROOT',
      getParent: () => null
    };
    const itemType = {
      getID: () => 'IT_CHILD',
      getParent: () => itemRoot
    };

    const itemTypeParentage = merchSetLibrary.getItemTypeParentage({
      queryClassificationProductLinks: () => ({
        asList: () => ({
          toArray: () => [{
            getClassification: () => itemType
          }]
        })
      })
    }, {});

    expect(itemTypeParentage).toEqual({
      IT_CHILD: '',
      IT_ROOT: ''
    });
    expect(merchSetLibrary.getItemTypeParentage({}, null)).toEqual({});
  });

  test('builds search criteria and merch-set criteria trees from criteria nodes', () => {
    const includeSearchNode = createSearchCriteriaNode({
      includeExclude: 'Include',
      merchTargets: [{ getID: () => 'MERCH_PARENT' }],
      itemTypeTargets: [{ getID: () => 'IT_PARENT' }],
      entries: [
        createDataContainerEntry('color', '=', ['Blue']),
        createDataContainerEntry('brand', '!=', ['Acme'])
      ]
    });
    const excludeSearchNode = createSearchCriteriaNode({
      includeExclude: 'Exclude',
      merchTargets: [],
      itemTypeTargets: [],
      entries: []
    });
    const includeListNode = {
      getObjectType: () => ({ getID: () => 'ListCriteriaNode' }),
      getValue: (attrID) => {
        if (attrID === 'CriteriaType_IncludeExclude') return createSimpleValue('Include');
        if (attrID === 'ListKeySelection') return createSimpleValue('SKU ID');
        if (attrID === 'RawSKUList') return createSimpleValue('');
        if (attrID === 'MatchedSKUList') return createSimpleValue(['SKU_1']);
        if (attrID === 'UnmatchedSKUList') return createSimpleValue([]);
        if (attrID === 'LastParsedDate') return createSimpleValue(null);
        return createSimpleValue(null);
      },
      getRevision: () => ({ getEditedDate: () => ({ after: () => true }) })
    };
    const step = {
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: (id) => ({ getID: () => id })
      }),
      getNodeHome: () => ({
        getObjectByKey: () => null
      })
    };

    expect(merchSetLibrary.getSearchCriteriaForNode(includeSearchNode, step, createLogger())).toEqual({
      includeExclude: 'include',
      merchProductBelow: 'MERCH_PARENT',
      itemTypeProductBelow: 'IT_PARENT',
      equalsCriteria: { color: ['Blue'] },
      notEqualsCriteria: { brand: ['Acme'] }
    });

    expect(
      merchSetLibrary.getMerchSetCriteriaForNode({
        getChildren: () => ({
          toArray: () => [includeSearchNode, excludeSearchNode, includeListNode]
        })
      }, step, createLogger())
    ).toEqual({
      includes: {
        lists: [{ includeExclude: 'include', keySelection: 'sku', ids: ['SKU_1'] }],
        searches: [{
          includeExclude: 'include',
          merchProductBelow: 'MERCH_PARENT',
          itemTypeProductBelow: 'IT_PARENT',
          equalsCriteria: { color: ['Blue'] },
          notEqualsCriteria: { brand: ['Acme'] }
        }]
      },
      excludes: {
        lists: [],
        searches: [{
          includeExclude: 'exclude',
          merchProductBelow: '',
          itemTypeProductBelow: '',
          equalsCriteria: {},
          notEqualsCriteria: {}
        }]
      }
    });
  });

  test('creates/removes SKU and product refs for merch sets and promotes product links to categories', () => {
    const staleSkuRef = { getSource: () => ({ getID: () => 'MS_OLD' }), delete: jest.fn() };
    const staleProdRef = { getSource: () => ({ getID: () => 'MS_OLD' }), delete: jest.fn() };
    const merchSet = {
      getChildren: () => ({
        toArray: () => []
      }),
      queryReferences: () => ({
        forEach: (callback) => callback({
          getTarget: () => ({ getID: () => 'PRD_EXISTING' }),
          delete: jest.fn()
        })
      }),
      createReference: jest.fn()
    };
    const productNode = {
      getID: () => 'PRD_NEW',
      queryReferencedBy: () => ({
        forEach: (callback) => {
          callback(staleProdRef);
        }
      })
    };
    const existingProductNode = {
      getID: () => 'PRD_EXISTING'
    };
    const colorwayNode = {
      getParent: () => productNode
    };
    const skuNode = {
      getParent: () => colorwayNode,
      queryReferencedBy: (refType) => ({
        forEach: (callback) => {
          callback(refType.getID() === 'MerchSetMatchedSKUs' ? staleSkuRef : staleProdRef);
        }
      })
    };
    const categoryNode = {
      createdLinks: [],
      queryReferences: () => ({
        forEach: (callback) => callback({
          getTarget: () => merchSet
        })
      }),
      queryClassificationProductLinks: () => ({
        forEach: (callback) => callback({
          getProduct: () => ({ getID: () => 'PRD_STALE' }),
          delete: jest.fn()
        })
      }),
      createClassificationProductLink: function (product, linkType) {
        this.createdLinks.push({ productID: product.getID(), linkTypeID: linkType.getID() });
      }
    };
    const productHome = {
      getProductByID: (id) => ({
        PRD_NEW: productNode,
        PRD_EXISTING: existingProductNode,
        MS_KEEP: merchSet,
        SKU_KEEP: skuNode
      })[id] || productNode
    };
    const step = {
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: (id) => ({ getID: () => id })
      }),
      getProductHome: () => productHome,
      getHome: () => ({
        getLinkTypeByID: (id) => ({ getID: () => id })
      })
    };

    merchSetLibrary.linkSKUToMerchSets(skuNode, ['MS_KEEP'], step);

    expect(staleSkuRef.delete).toHaveBeenCalledTimes(1);
    expect(staleProdRef.delete).toHaveBeenCalledTimes(1);
    expect(merchSet.createReference).toHaveBeenCalledWith(skuNode, 'MerchSetMatchedSKUs');
    expect(merchSet.createReference).toHaveBeenCalledWith(productNode, 'MerchSetMatchedProducts');

    merchSetLibrary.promoteMerchSetLinksToCategory(categoryNode, step, createLogger(), null);

    expect(categoryNode.createdLinks).toEqual([
      { productID: 'PRD_EXISTING', linkTypeID: 'CategoryToProductLink' }
    ]);
  });

  test('executes include search criteria and returns matching SKU IDs from query results', () => {
    const logger = createLogger();
    const qh = {
      queryFor: jest.fn(() => ({
        where: () => ({
          execute: () => ({
            forEach: (callback) => {
              callback({ getID: () => 'SKU_SEARCH_1' });
              callback({ getID: () => 'SKU_SEARCH_2' });
            }
          })
        })
      }))
    };
    const step = {
      getObjectTypeHome: () => ({
        getObjectTypeByID: (id) => ({ getID: () => id })
      }),
      getProductHome: () => ({
        getProductByID: (id) => ({ getID: () => id })
      }),
      getClassificationHome: () => ({
        getClassificationByID: (id) => ({ getID: () => id })
      }),
      getAttributeHome: () => ({
        getAttributeByID: (id) => ({ getID: () => id })
      })
    };

    expect(merchSetLibrary.getResultsForSearchCriteria({
      includeExclude: 'include',
      merchProductBelow: 'MERCH_PARENT',
      itemTypeProductBelow: 'ITEM_PARENT',
      equalsCriteria: { color: ['Blue', 'Navy'] },
      notEqualsCriteria: { brand: ['Acme', 'Legacy'] }
    }, step, qh, logger)).toEqual(['SKU_SEARCH_1', 'SKU_SEARCH_2']);
    expect(logger.info).toHaveBeenCalled();

    expect(merchSetLibrary.getResultsForSearchCriteria({
      includeExclude: 'exclude',
      merchProductBelow: '',
      itemTypeProductBelow: '',
      equalsCriteria: {},
      notEqualsCriteria: {}
    }, step, qh, logger)).toEqual([]);
  });

  test('selects merch sets for eligible SKUs and suppresses merch sets when exclude criteria match', () => {
    const logger = createLogger();
    const merchRoot = { getID: () => 'MERCH_ROOT', getParent: () => null };
    const merchLeaf = { getID: () => 'MERCH_LEAF', getParent: () => merchRoot };
    const skuNode = {
      getID: () => 'SKU_ELIGIBLE',
      getParent: () => merchLeaf,
      getValue: (attrID) => {
        if (attrID === 'color') {
          return createSimpleValue('Blue');
        }
        if (attrID === 'brand') {
          return createSimpleValue('Core');
        }
        return createSimpleValue(null);
      },
      queryClassificationProductLinks: () => ({
        asList: () => ({
          toArray: () => []
        })
      })
    };
    const excludedSkuNode = {
      getID: () => 'SKU_EXCLUDED',
      getParent: () => merchLeaf,
      getValue: (attrID) => {
        if (attrID === 'color') {
          return createSimpleValue('Blue');
        }
        if (attrID === 'brand') {
          return createSimpleValue('Legacy');
        }
        return createSimpleValue(null);
      },
      queryClassificationProductLinks: () => ({
        asList: () => ({
          toArray: () => []
        })
      })
    };

    function createListCriteriaNode(includeExclude, ids) {
      return {
        getObjectType: () => ({ getID: () => 'ListCriteriaNode' }),
        getValue: (attrID) => {
          if (attrID === 'CriteriaType_IncludeExclude') return createSimpleValue(includeExclude);
          if (attrID === 'ListKeySelection') return createSimpleValue('SKU ID');
          if (attrID === 'RawSKUList') return createSimpleValue('');
          if (attrID === 'MatchedSKUList') return createSimpleValue(ids);
          if (attrID === 'UnmatchedSKUList') return createSimpleValue([]);
          if (attrID === 'LastParsedDate') return createSimpleValue(null);
          return createSimpleValue(null);
        },
        getRevision: () => ({ getEditedDate: () => ({ after: () => true }) })
      };
    }

    const merchSet = {
      getID: () => 'MS_INCLUDE',
      getChildren: () => ({
        toArray: () => [
          createListCriteriaNode('Include', ['SKU_ELIGIBLE', 'SKU_EXCLUDED']),
          createSearchCriteriaNode({
            includeExclude: 'Exclude',
            merchTargets: [{ getID: () => 'MERCH_ROOT' }],
            entries: [
              createDataContainerEntry('brand', '=', ['Legacy'])
            ]
          })
        ]
      })
    };
    const step = {
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: (id) => ({ getID: () => id })
      }),
      getNodeHome: () => ({
        getObjectByKey: () => null
      }),
      getHome: () => ({
        getLinkTypeByID: (id) => ({ getID: () => id })
      }),
      getProductHome: () => ({
        getProductByID: (id) => (id === 'SKU_ELIGIBLE' ? skuNode : excludedSkuNode)
      }),
      getObjectTypeHome: () => ({
        getObjectTypeByID: (id) => ({ getID: () => id })
      })
    };
    const qh = {
      queryFor: () => ({
        where: () => ({
          execute: () => ({
            forEach: (callback) => {
              callback(merchSet);
            }
          })
        })
      })
    };

    expect(merchSetLibrary.getMerchSetsForSKU(skuNode, step, qh, logger)).toEqual(['MS_INCLUDE']);
    expect(merchSetLibrary.getMerchSetsForSKU(excludedSkuNode, step, qh, logger)).toEqual([]);
    expect(merchSetLibrary.getSKUsForMerchSet(merchSet, step, qh, logger)).toEqual(['SKU_ELIGIBLE']);
  });
});
