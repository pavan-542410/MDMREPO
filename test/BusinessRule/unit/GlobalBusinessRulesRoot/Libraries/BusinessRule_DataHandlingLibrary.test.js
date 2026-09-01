const dataHandlingLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_DataHandlingLibrary');

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createJavaCollection(items) {
  return {
    iterator: jest.fn(() => createIterator(items)),
    size: jest.fn(() => items.length),
  };
}

function createSimpleValue(value, inherited) {
  return {
    getSimpleValue: jest.fn(() => value),
    isInherited: jest.fn(() => Boolean(inherited)),
  };
}

function createAttribute(attributeID, datatype) {
  return {
    getID: jest.fn(() => attributeID),
    toString: jest.fn(() => `Attribute:${attributeID}`),
    getValue: jest.fn((valueID) => {
      if (valueID === 'Datatype') {
        return createSimpleValue(datatype, false);
      }
      return createSimpleValue(null, false);
    }),
  };
}

function createReferenceTarget(targetID) {
  return {
    getID: jest.fn(() => targetID),
    toString: jest.fn(() => `Target:${targetID}`),
  };
}

function createReference(targetID, valuesByID) {
  const targetNode = createReferenceTarget(targetID);

  return {
    getTarget: jest.fn(() => targetNode),
    getValue: jest.fn((attributeID) => createSimpleValue(valuesByID[attributeID], false)),
    delete: jest.fn(),
  };
}

function createSourceNode(nodeID, valuesByID, inheritedByID, referencesByTypeID) {
  return {
    getID: jest.fn(() => nodeID),
    toString: jest.fn(() => `Node:${nodeID}`),
    getValue: jest.fn((attributeID) =>
      createSimpleValue(valuesByID[attributeID], inheritedByID[attributeID])
    ),
    getReferences: jest.fn((refType) =>
      createJavaCollection(referencesByTypeID[refType.getID()] || [])
    ),
  };
}

function createCurObj(nodeID, objectTypeID, children, parentNode) {
  return {
    getID: jest.fn(() => nodeID),
    toString: jest.fn(() => `Node:${nodeID}`),
    getChildren: jest.fn(() => createJavaCollection(children)),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => objectTypeID),
    })),
    getParent: jest.fn(() => parentNode),
  };
}

function createAttributeGroupHome(groupsByID) {
  return {
    getAttributeGroupByID: jest.fn((groupID) => ({
      getAttributes: jest.fn(() => createJavaCollection(groupsByID[groupID] || [])),
    })),
  };
}

function createReferenceType(refTypeID) {
  return {
    getID: jest.fn(() => refTypeID),
    getValidForObjectTypes: jest.fn(() => ({
      contains: jest.fn(() => true),
    })),
  };
}

describe('BusinessRule_DataHandlingLibrary', () => {
  beforeEach(() => {
    global.log = {
      info: jest.fn(),
    };

    global.java = {
      text: {
        SimpleDateFormat: function SimpleDateFormat() {
          this.parse = function (value) {
            const parsedDate = new Date(`${value}T00:00:00.000Z`);

            return {
              before: function (otherDate) {
                return parsedDate.getTime() < otherDate.getTime();
              },
              getTime: function () {
                return parsedDate.getTime();
              },
            };
          };
        },
      },
    };
  });

  afterEach(() => {
    delete global.log;
    delete global.java;
  });

  it('processes child attributes/references, fills caches, and republishes the parent when needed', () => {
    const brandColorAttr = createAttribute('brand_color', 'text');
    const sampleReceivedAttr = createAttribute('is_sample_received', 'text');
    const introDateAttr = createAttribute('intro_date', 'timestamp');
    const materialTagAttr = createAttribute('material_tag', 'text');

    const cottonRef = createReference('MaterialCotton', {
      material_percentage: '100',
    });
    const labelRef = createReference('LabelCare', {});

    const firstChild = createSourceNode(
      'SV_1',
      {
        brand_color: 'Blue',
        is_sample_received: 'Yes',
        intro_date: '2024-02-10',
        material_tag: 'Cotton',
      },
      {},
      {
        ProductToLabel: [labelRef],
        ProductToMaterial: [cottonRef],
      }
    );

    const secondChild = createSourceNode(
      'SV_2',
      {
        brand_color: 'Blue',
        is_sample_received: 'Yes',
        intro_date: '2024-01-20',
        material_tag: 'Linen',
      },
      {},
      {
        ProductToLabel: [labelRef],
        ProductToMaterial: [cottonRef],
      }
    );

    const parentNode = {
      getID: jest.fn(() => 'Product_100'),
    };
    const curObj = createCurObj(
      'Colorway_200000000',
      'ColorwayVariantNode',
      [firstChild, secondChild],
      parentNode
    );

    const step = {
      getEntityHome: jest.fn(() => ({
        getEntityByID: jest.fn((entityID) => ({ id: entityID })),
      })),
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn((attributeID) => createAttribute(attributeID, 'text')),
      })),
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn((refTypeID) => createReferenceType(refTypeID)),
      })),
    };
    const upheritQueue = {
      republish: jest.fn(),
    };
    const homes = {
      agHome: createAttributeGroupHome({
        ColorwayUpheritAttributes: [brandColorAttr, sampleReceivedAttr, introDateAttr],
        ItemTypeHierarchyAttributes: [materialTagAttr],
      }),
    };
    const omniCache = {};

    expect(() =>
      dataHandlingLibrary.main(
        curObj,
        step,
        upheritQueue,
        null,
        false,
        homes,
        omniCache,
        true
      )
    ).not.toThrow();

    expect(upheritQueue.republish).toHaveBeenCalledWith(parentNode);
    expect(omniCache['republished_Product_100']).toBe(true);
    expect(omniCache['fetchObjectTypeID-Colorway_200000000']).toBe('ColorwayVariantNode');
    expect(omniCache['fetchChildren-Colorway_200000000']).toBeDefined();
    expect(omniCache['fetchRefType-ProductToLabel'].getID()).toBe('ProductToLabel');
    expect(omniCache['fetchRefType-ProductToMaterial'].getID()).toBe('ProductToMaterial');
  });

  it('skips inherited values and avoids republishing when the current object is a ProductNode', () => {
    const brandColorAttr = createAttribute('brand_color', 'text');
    const childNode = createSourceNode(
      'SV_3',
      {
        brand_color: 'Inherited Blue',
      },
      {
        brand_color: true,
      },
      {
        ProductToLabel: [],
        ProductToMaterial: [],
      }
    );
    const parentNode = {
      getID: jest.fn(() => 'Product_101'),
    };
    const curObj = createCurObj('Product_101', 'ProductNode', [childNode], parentNode);
    const step = {
      getEntityHome: jest.fn(() => ({
        getEntityByID: jest.fn((entityID) => ({ id: entityID })),
      })),
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn((attributeID) => createAttribute(attributeID, 'text')),
      })),
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn((refTypeID) => createReferenceType(refTypeID)),
      })),
    };
    const upheritQueue = {
      republish: jest.fn(),
    };
    const homes = {
      agHome: createAttributeGroupHome({
        ProductUpheritAttributes: [brandColorAttr],
        ItemTypeHierarchyAttributes: [],
      }),
    };
    const omniCache = {};

    expect(() =>
      dataHandlingLibrary.main(curObj, step, upheritQueue, null, true, homes, omniCache, false)
    ).not.toThrow();

    expect(upheritQueue.republish).not.toHaveBeenCalled();
    expect(omniCache['fetchObjectTypeID-Product_101']).toBe('ProductNode');
  });

  it('evaluates conflicting, accumulated, and blank timestamp child values for non-Product nodes', () => {
    const brandColorAttr = createAttribute('brand_color', 'text');
    const introDateAttr = createAttribute('intro_date', 'timestamp');
    const sampleReadyAttr = createAttribute('is_sample_ready_for_approval', 'text');
    const stylecardImageAttr = createAttribute('stylecard_image', 'text');
    const primaryPhotoAttr = createAttribute('primary_photo_asset_id', 'text');
    const materialTagAttr = createAttribute('material_tag', 'text');

    const firstChild = createSourceNode(
      'SV_200000010',
      {
        brand_color: 'Blue',
        intro_date: '',
        is_sample_ready_for_approval: 'true',
        stylecard_image: '',
        primary_photo_asset_id: '',
        material_tag: 'Cotton',
      },
      {},
      {
        ProductToLabel: [],
        ProductToMaterial: [],
      }
    );
    const secondChild = createSourceNode(
      'SV_200000011',
      {
        brand_color: 'Red',
        intro_date: '2024-01-05',
        is_sample_ready_for_approval: '',
        stylecard_image: '',
        primary_photo_asset_id: '',
        material_tag: 'Cotton',
      },
      {},
      {
        ProductToLabel: [],
        ProductToMaterial: [],
      }
    );
    const parentNode = {
      getID: jest.fn(() => 'Product_200000001'),
    };
    const curObj = createCurObj(
      'Colorway_200000010',
      'ColorwayVariantNode',
      [firstChild, secondChild],
      parentNode
    );
    const omniCache = {};

    expect(() =>
      dataHandlingLibrary.main(
        curObj,
        {
          getEntityHome: jest.fn(() => ({
            getEntityByID: jest.fn((entityID) => ({ id: entityID })),
          })),
          getAttributeHome: jest.fn(() => ({
            getAttributeByID: jest.fn((attributeID) => createAttribute(attributeID, 'text')),
          })),
          getReferenceTypeHome: jest.fn(() => ({
            getReferenceTypeByID: jest.fn((refTypeID) => createReferenceType(refTypeID)),
          })),
        },
        { republish: jest.fn() },
        null,
        false,
        {
          agHome: createAttributeGroupHome({
            ColorwayUpheritAttributes: [
              brandColorAttr,
              introDateAttr,
              sampleReadyAttr,
              stylecardImageAttr,
              primaryPhotoAttr,
            ],
            ItemTypeHierarchyAttributes: [materialTagAttr],
          }),
        },
        omniCache,
        false
      )
    ).not.toThrow();

    expect(omniCache['fetchChildren-Colorway_200000010']).toBeDefined();
    expect(omniCache['fetchDataType-intro_date']).toBe('timestamp');
    expect(omniCache['fetchDataType-brand_color']).toBe('text');
  });
});
