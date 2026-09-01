const workflowLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_WorkflowLibrary');

function createValue(simpleValue) {
  return {
    getSimpleValue: jest.fn(() => simpleValue),
  };
}

function createAssetNode(id, width, height) {
  return {
    getID: jest.fn(() => id),
    getValue: jest.fn((attributeID) => {
      if (attributeID === 'asset.pixel-width') {
        return createValue(width);
      }
      if (attributeID === 'asset.pixel-height') {
        return createValue(height);
      }
      return createValue(null);
    }),
  };
}

function createReferenceQuery(targetNodes) {
  return {
    forEach: jest.fn((callback) => {
      targetNodes.forEach((targetNode) => {
        callback({
          getTarget: jest.fn(() => targetNode),
        });
      });
    }),
  };
}

function createNode(valuesByID, targetNodes, linkedProducts) {
  return {
    getValue: jest.fn((attributeID) => createValue(valuesByID[attributeID])),
    queryReferences: jest.fn(() => createReferenceQuery(targetNodes || [])),
    queryClassificationProductLinks: jest.fn(() => ({
      forEach: jest.fn((callback) => {
        (linkedProducts || []).forEach((linkedProduct) => callback(linkedProduct));
      }),
    })),
  };
}

function createRefType(id, name) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => name || id),
  };
}

describe('BusinessRule_WorkflowLibrary', () => {
  it('returns true or the original error string through conditionReturn', () => {
    expect(workflowLibrary.conditionReturn('')).toBe(true);
    expect(workflowLibrary.conditionReturn('Error')).toBe('Error');
  });

  it('validates exact and minimum asset resolution on direct and referenced assets', () => {
    const validAsset = createAssetNode('asset-1', '100 px', '200 px');
    const invalidAsset = createAssetNode('asset-2', '80 px', '90 px');
    const node = createNode({}, [validAsset, invalidAsset], []);
    const refType = createRefType('MainImage');

    expect(workflowLibrary.identifyAsset(validAsset)).toBe('ID=asset-1');
    expect(workflowLibrary.getResolutionOfAsset(validAsset)).toEqual({ width: 100, height: 200 });
    expect(workflowLibrary.validateExactAssetsResolution(validAsset, refType, 100, 200)).toBe(true);

    expect(workflowLibrary.validateMinimumAssetsResolution(invalidAsset, refType, 100, 200)).toContain(
      'Invalid width (80) but requires minimum (100) for asset: ID=asset-2'
    );
    expect(workflowLibrary.validateMinimumAssetsResolution(invalidAsset, refType, 100, 200)).toContain(
      'Invalid height (90) but requires minimum (200) for asset: ID=asset-2'
    );

    expect(
      workflowLibrary.validateExactReferencedAssetsResolution(node, refType, 100, 200)
    ).toContain('Invalid width (80) but must equal (100) for asset: ID=asset-2');
    expect(
      workflowLibrary.validateMinimumReferencedAssetsResolution(node, refType, 100, 200)
    ).toContain('Invalid width (80) but requires minimum (100) for asset: ID=asset-2');
  });

  it('validates asset aspect ratios and reports malformed dimensions', () => {
    const validAsset = createAssetNode('asset-1', '100 px', '200 px');
    const invalidRatioAsset = createAssetNode('asset-2', '300 px', '200 px');
    const invalidDimensionAsset = createAssetNode('asset-3', 'not-a-number', '200 px');
    const node = createNode({}, [validAsset, invalidRatioAsset], []);
    const refType = createRefType('MainImage');

    expect(workflowLibrary.validateExactAssetsAspectRatio(validAsset, refType, 1, 2)).toBe(true);
    expect(workflowLibrary.validateAssetAspectRatio(invalidRatioAsset, 1, 2)).toBe(
      'Invalid aspect ratio (300x200) but have a ratio of (1x2) for asset: ID=asset-2'
    );
    expect(workflowLibrary.validateAssetAspectRatio(invalidDimensionAsset, 1, 2)).toBe(
      'Invalid height (200) or width (NaN) value for asset: ID=asset-3'
    );
    expect(
      workflowLibrary.validateExactReferencedAssetsAspectRatio(node, refType, 1, 2)
    ).toContain('Invalid aspect ratio (300x200) but have a ratio of (1x2) for asset: ID=asset-2');
  });

  it('checks required attributes and exact attribute values', () => {
    const node = createNode(
      {
        style_name: 'Slim Shirt',
        lifecycle_status: 'Active',
        missing_attr: null,
      },
      [],
      []
    );

    expect(workflowLibrary.checkRequiredAttribute(node, 'style_name')).toBe(true);
    expect(workflowLibrary.checkRequiredAttribute(node, 'missing_attr')).toBe(
      'Missing attribute (missing_attr)'
    );
    expect(
      workflowLibrary.checkRequiredAttributes(node, ['style_name', 'missing_attr'])
    ).toBe('Missing attribute (missing_attr)');
    expect(workflowLibrary.checkRequiredAttributeEquals(node, 'lifecycle_status', 'Active')).toBe(
      true
    );
    expect(workflowLibrary.checkRequiredAttributeEquals(node, 'lifecycle_status', 'Draft')).toBe(
      'Attribute (lifecycle_status) equals Active (not Draft)'
    );
  });

  it('checks required references, product links, and referenced-node attributes', () => {
    const refType = createRefType('MainImage');
    const productLinkType = createRefType('ProductLink', 'Material Link');
    const validTarget = {
      getID: jest.fn(() => 'target-1'),
      getValue: jest.fn(() => createValue('Approved')),
    };
    const invalidTarget = {
      getID: jest.fn(() => 'target-2'),
      getValue: jest.fn(() => createValue(null)),
    };
    const nodeWithRefs = createNode(
      {
        image_status: 'Required',
      },
      [validTarget, invalidTarget],
      [{}]
    );
    const nodeWithoutRefs = createNode(
      {
        image_status: 'Required',
      },
      [],
      []
    );

    expect(workflowLibrary.checkRequiredReference(nodeWithRefs, refType)).toBe(true);
    expect(workflowLibrary.checkRequiredReference(nodeWithoutRefs, refType)).toBe(
      'Missing required reference of type: MainImage'
    );
    expect(workflowLibrary.checkRequiredProductLinks(nodeWithRefs, productLinkType)).toBe(true);
    expect(workflowLibrary.checkRequiredProductLinks(nodeWithoutRefs, productLinkType)).toBe(
      'Missing required Material Link links to Products.'
    );
    expect(
      workflowLibrary.checkRequiredReferenceIfAttrEquals(
        nodeWithoutRefs,
        refType,
        'image_status',
        'Required'
      )
    ).toBe('Missing required reference of type: MainImage when image_status = Required');
    expect(
      workflowLibrary.checkRequiredReferenceIfAttrEquals(
        nodeWithoutRefs,
        refType,
        'image_status',
        'Optional'
      )
    ).toBe(true);
    expect(
      workflowLibrary.checkRequiredReferencedNodeAttribute(nodeWithRefs, refType, 'approval_status')
    ).toBe('Missing attribute (approval_status) on reference (MainImage) to: target-2');
    expect(
      workflowLibrary.checkRequiredReferencedNodeAttributeEquals(
        nodeWithRefs,
        refType,
        'approval_status',
        'Approved'
      )
    ).toBe('Attribute (approval_status) equals null (not Approved) on reference (MainImage) to: target-2');
  });
});
