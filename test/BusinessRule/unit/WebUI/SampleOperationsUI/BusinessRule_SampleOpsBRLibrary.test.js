const sampleOpsLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_SampleOpsBRLibrary');

class RESTGatewayExceptionMock {
  constructor(message) {
    this.message = message;
  }

  getMessage() {
    return this.message;
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createValueStore(valuesByID) {
  const wrappers = {};

  return jest.fn((attrID) => {
    if (!wrappers[attrID]) {
      wrappers[attrID] = {
        getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          valuesByID[attrID] = value;
        }),
        deleteCurrent: jest.fn(() => {
          delete valuesByID[attrID];
        }),
        addValue: jest.fn((value) => {
          valuesByID[attrID] = valuesByID[attrID]
            ? `${valuesByID[attrID]}|${value}`
            : value;
        }),
        getID: jest.fn(() => valuesByID[attrID] || attrID),
      };
    }

    return wrappers[attrID];
  });
}

function createReference(target, valuesByID) {
  return {
    getTarget: jest.fn(() => target),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
      getID: jest.fn(() => valuesByID[attrID] || null),
      setSimpleValue: jest.fn((value) => {
        valuesByID[attrID] = value;
      }),
    })),
    delete: jest.fn(),
    __values: valuesByID,
  };
}

function createStyleVariant(options) {
  const valuesByID = Object.assign({
    sample_received_at: null,
    sample_notes: 'Needs review',
    is_made_in_usa: 'true',
    brand_sku: 'BRAND-SKU-1',
    primary_client_focus: 'women',
    garment_care: null,
    filling_material: 'Poly',
    lining: 'Cotton',
  }, options && options.valuesByID ? options.valuesByID : {});
  const refsByType = options && options.refsByType ? options.refsByType : {};
  const children = options && options.children ? options.children : [];
  const valueGetter = createValueStore(valuesByID);
  const manager = options && options.manager ? options.manager : {
    getReferenceTypeHome: jest.fn(() => ({
      getReferenceTypeByID: jest.fn((refTypeID) => refTypeID),
    })),
    getEntityHome: jest.fn(() => ({
      getEntityByID: jest.fn((entityID) => ({
        getID: jest.fn(() => entityID),
      })),
    })),
  };

  return {
    getID: jest.fn(() => options && options.id ? options.id : 'SV_1'),
    getName: jest.fn(() => options && options.name ? options.name : 'SV One'),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => 'StyleVariant'),
    })),
    getParent: jest.fn(() => options && options.parent ? options.parent : null),
    getManager: jest.fn(() => manager),
    getValue: valueGetter,
    queryReferences: jest.fn((refType) => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => refsByType[refType] || []),
        size: jest.fn(() => (refsByType[refType] || []).length),
        forEach: jest.fn((callback) => {
          (refsByType[refType] || []).forEach(callback);
        }),
      })),
      forEach: jest.fn((callback) => {
        (refsByType[refType] || []).forEach(callback);
      }),
    })),
    getChildren: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(children)),
    })),
    createReference: jest.fn((target, refType) => createReference(target, { refType })),
    approve: jest.fn(),
    __values: valuesByID,
  };
}

function createSample(options) {
  const parentUser = {
    getName: jest.fn(() => 'Jane Doe Archive'),
  };
  const parentDate = {
    getName: jest.fn(() => '2024-01-02'),
    getParent: jest.fn(() => parentUser),
  };
  const packageNode = {
    getParent: jest.fn(() => parentDate),
  };
  const valuesByID = Object.assign({
    sampleOps_sampleRecd_at: null,
    Notes_Description: null,
    SampleOps_IsMadeInUSA: null,
    sampleOps_brand_sku: null,
    sampleOps_primary_client_focus: null,
    CheckedInByUser: null,
    CheckedInDate: null,
    sampleOps_garment_care: 'Machine wash',
    ATR_COTTON: '100 %',
  }, options && options.valuesByID ? options.valuesByID : {});
  const refsByType = options && options.refsByType ? options.refsByType : {};
  const manager = {
    getReferenceTypeHome: jest.fn(() => ({
      getReferenceTypeByID: jest.fn((refTypeID) => refTypeID),
    })),
    getAttributeGroupHome: jest.fn(() => ({
      getAttributeGroupByID: jest.fn(() => ({
        getAttributes: jest.fn(() => ({
          iterator: jest.fn(() => createIterator([
            { getID: jest.fn(() => 'ATR_COTTON') },
            { getID: jest.fn(() => 'ATR_WOOL') },
          ])),
        })),
      })),
    })),
  };

  return {
    getName: jest.fn(() => options && options.name ? options.name : 'Sample One'),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => 'SampleOpsSample'),
    })),
    getParent: jest.fn(() => packageNode),
    getManager: jest.fn(() => manager),
    getValue: createValueStore(valuesByID),
    queryReferences: jest.fn((refType) => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => refsByType[refType] || []),
        size: jest.fn(() => (refsByType[refType] || []).length),
        forEach: jest.fn((callback) => {
          (refsByType[refType] || []).forEach(callback);
        }),
      })),
      forEach: jest.fn((callback) => {
        (refsByType[refType] || []).forEach(callback);
      }),
    })),
    createReference: jest.fn(),
    setName: jest.fn(),
    approve: jest.fn(),
    __values: valuesByID,
  };
}

describe('BusinessRule_SampleOpsBRLibrary', () => {
  beforeEach(() => {
    global.dt = {
      nowISO: jest.fn(() => '2024-06-01T12:00:00.000Z'),
    };
    global.g = {
      processGiepRequest: jest.fn(() => 'PDF_BASE64'),
    };
    global.wf = {
      triggerWorkflowEvent: jest.fn(),
    };
    global.logger = {
      info: jest.fn(),
    };
    global.com = {
      stibo: {
        gateway: {
          rest: {
            RESTGatewayException: RESTGatewayExceptionMock,
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.dt;
    delete global.g;
    delete global.wf;
    delete global.logger;
    delete global.com;
  });

  test('creates a sample, references the SV, enriches attributes/materials, and copies the primary image', () => {
    const primaryImage = { getID: jest.fn(() => 'IMG_1') };
    const colorway = {
      getName: jest.fn(() => 'Colorway One'),
    };
    const styleVariant = createStyleVariant({
      parent: colorway,
      refsByType: {
        ProductToMaterial: [
          createReference({ getID: jest.fn(() => 'MAT_COTTON') }, {
            material_percentage: '100 %',
          }),
        ],
        PrimaryProductImage: [
          createReference(primaryImage, {}),
        ],
      },
    });
    const sample = createSample();
    const packageObj = {
      getManager: jest.fn(() => ({
        getReferenceTypeHome: jest.fn(() => ({
          getReferenceTypeByID: jest.fn((refTypeID) => refTypeID),
        })),
      })),
      createEntity: jest.fn(() => sample),
    };

    sampleOpsLibrary.createSampleAndReference(packageObj, styleVariant, { info: jest.fn() });

    expect(packageObj.createEntity).toHaveBeenCalledWith(null, 'SampleOpsSample');
    expect(sample.createReference).toHaveBeenCalledWith(styleVariant, 'SampleToStyleVariant');
    expect(sample.createReference).toHaveBeenCalledWith(primaryImage, 'PrimaryProductImage');
    expect(sample.setName).toHaveBeenCalledWith('Colorway One');
    expect(sample.__values.ATR_COTTON).toBe('100 %');
    expect(sample.__values.CheckedInByUser).toBe('Jane Doe');
    expect(sample.__values.CheckedInDate).toBe('2024-01-02');
  });

  test('evaluates sample quality, generates hangtag payloads, and formats bad-sample messages', () => {
    const goodSample = {
      getName: jest.fn(() => 'Good Sample'),
    };
    const badSample = {
      getName: jest.fn(() => 'Bad Sample'),
    };

    expect(sampleOpsLibrary.evaluateSampleQuality(goodSample, {
      evaluate: jest.fn(() => ({
        getScore: jest.fn(() => 100),
      })),
    }, { info: jest.fn() })).toEqual({
      isGood: true,
      name: 'Good Sample',
    });
    expect(sampleOpsLibrary.evaluateSampleQuality(badSample, {
      evaluate: jest.fn(() => ({
        getScore: jest.fn(() => 50),
      })),
    }, { info: jest.fn() })).toEqual({
      isGood: false,
      name: 'Bad Sample',
    });

    const styleVariant = createStyleVariant({
      valuesByID: {
        sample_received_at: '2024-01-01T00:00:00.000Z',
      },
      parent: {
        getManager: jest.fn(),
      },
    });
    const sampleNode = createSample({
      refsByType: {
        SampleToStyleVariant: [createReference(styleVariant, {})],
      },
    });

    const jsonBatch = sampleOpsLibrary.generateHangtagJSONBatch([sampleNode], {
      evaluate: jest.fn(() => JSON.stringify({ sample_id: 'SAMPLE_1' })),
    });

    expect(jsonBatch).toEqual({
      hang_tags: [{ sample_id: 'SAMPLE_1' }],
    });
    expect(sampleOpsLibrary.generateErrorMessageForBadSamples(['Sample A', 'Sample B'])).toBe(
      'Not all samples are ready to be checked in. Please review Sample A, Sample B'
    );
  });

  test('sends hangtag payload to GIEP and converts REST gateway failures into a readable error', () => {
    expect(sampleOpsLibrary.sendToHangtagService('giep', { hang_tags: [] })).toContain('data:application/pdf;base64,PDF_BASE64');

    global.g.processGiepRequest.mockImplementationOnce(() => {
      throw {
        javaException: new RESTGatewayExceptionMock('token failed'),
      };
    });

    expect(() => sampleOpsLibrary.sendToHangtagService('giep', { hang_tags: [] }))
      .toThrow('Error getting token: token failed');

    global.g.processGiepRequest.mockImplementationOnce(() => {
      throw new Error('Unexpected failure');
    });

    expect(() => sampleOpsLibrary.sendToHangtagService('giep', { hang_tags: [] }))
      .toThrow('Unexpected failure');
  });

  test('processes a non-reprint sample by checking it in, applying materials, and setting a received timestamp when missing', () => {
    const materialEntity = {
      getID: jest.fn(() => 'MAT_COTTON'),
    };
    const manager = {
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn((refTypeID) => refTypeID),
      })),
      getEntityHome: jest.fn(() => ({
        getEntityByID: jest.fn(() => materialEntity),
      })),
    };
    const skuChild = {
      queryReferences: jest.fn(() => ({
        forEach: jest.fn((callback) => {
          [createReference({ getID: jest.fn(() => 'MAT_OLD') }, {})].forEach(callback);
        }),
      })),
    };
    const colorway = {
      getManager: jest.fn(() => manager),
      getChildren: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([skuChild])),
      })),
      getValue: createValueStore({
        filling_material: 'Old Fill',
        lining: 'Old Lining',
        garment_care: null,
        is_made_in_usa: null,
      }),
      queryReferences: jest.fn(() => ({
        forEach: jest.fn((callback) => {
          [createReference({ getID: jest.fn(() => 'MAT_OLD') }, {})].forEach(callback);
        }),
      })),
      createReference: jest.fn(() => createReference(materialEntity, {})),
      approve: jest.fn(),
      __values: {
        garment_care: null,
      },
    };
    const styleVariant = createStyleVariant({
      valuesByID: {
        sample_received_at: null,
      },
      parent: colorway,
    });
    const sample = createSample({
      refsByType: {
        SampleToStyleVariant: [createReference(styleVariant, {})],
        SampleToMaterial: [
          createReference({
            getName: jest.fn(() => 'Cotton'),
          }, {
            material_type: 'filling_material',
            material_percentage: '100 %',
          }),
        ],
      },
    });

    const result = sampleOpsLibrary.processSample(sample, {
      evaluate: jest.fn(() => JSON.stringify({ sample_id: 'SAMPLE_2' })),
    });

    expect(result).toEqual({
      sampleJSON: { sample_id: 'SAMPLE_2' },
    });
    expect(sample.__values.sampleOps_sampleRecd_at).toBe('2024-06-01T12:00:00.000Z');
    expect(styleVariant.__values.sample_received_at).toBe('2024-06-01T12:00:00.000Z');
    expect(styleVariant.__values.is_sample_received).toBe('true');
    expect(global.wf.triggerWorkflowEvent).toHaveBeenCalledWith(styleVariant, 'SampleAndMedia', 'Sample_Needed', 'Submit');
    expect(global.wf.triggerWorkflowEvent).toHaveBeenCalledWith(styleVariant, 'SampleAndMedia', 'Transfer_reqd_from_DC', 'Submit');
    expect(colorway.createReference).toHaveBeenCalledWith(materialEntity, 'ProductToMaterial');
    expect(colorway.approve).toHaveBeenCalledTimes(1);
  });

  test('detects reprints, extracts sample materials, resets current refs, and logs only when a logger is provided', () => {
    const styleVariant = createStyleVariant({
      valuesByID: {
        sample_received_at: '2024-01-01T00:00:00.000Z',
        filling_material: 'Poly',
        lining: 'Wool',
      },
      refsByType: {
        ProductToMaterial: [
          createReference({ getID: jest.fn(() => 'MAT_OLD') }, {}),
        ],
      },
      children: [{
        queryReferences: jest.fn(() => ({
          forEach: jest.fn((callback) => {
            [createReference({ getID: jest.fn(() => 'MAT_CHILD') }, {})].forEach(callback);
          }),
        })),
      }],
    });
    const sample = createSample();
    const log = {
      info: jest.fn(),
    };

    expect(sampleOpsLibrary.isReprint(styleVariant, log)).toBe(true);
    expect(sampleOpsLibrary.getMaterialsFromSample(sample)).toEqual({
      MAT_COTTON: '100 %',
    });
    expect(() => sampleOpsLibrary.resetFabricationRefs(styleVariant)).not.toThrow();
    sampleOpsLibrary.p('debug message', log);
    expect(log.info).toHaveBeenCalledWith('debug message');
  });
});
