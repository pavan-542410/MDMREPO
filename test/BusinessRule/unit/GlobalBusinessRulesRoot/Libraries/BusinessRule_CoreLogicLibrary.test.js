const coreLogic = require('../../../../../step-configs/BusinessRule/BusinessRule_CoreLogicLibrary');

function nodeType(typeID) {
  return {
    getObjectType: () => ({ getID: () => typeID })
  };
}

function withValueMap(values) {
  return {
    getValue: (attrID) => ({
      getSimpleValue: () => values[attrID]
    })
  };
}

describe('BusinessRule_CoreLogicLibrary', () => {
  afterEach(() => {
    delete global.logger;
  });

  test('fetchParameter returns boolean for ParameterBoolean', () => {
    const parameter = {
      getObjectType: () => ({ getID: () => 'ParameterBoolean' }),
      getValue: () => ({ getSimpleValue: () => 'true' })
    };

    const step = {
      getEntityHome: () => ({ getEntityByID: () => parameter })
    };

    expect(coreLogic.fetchParameter('param1', step)).toBe(true);
  });

  test('fetchParameter parses array for ParameterStringArray and returns null for unknown type', () => {
    const arrayParameter = {
      getObjectType: () => ({ getID: () => 'ParameterStringArray' }),
      getValue: () => ({ getSimpleValue: () => '["a","b"]' })
    };

    const unknownParameter = {
      getObjectType: () => ({ getID: () => 'SomethingElse' })
    };

    const step = {
      getEntityHome: () => ({
        getEntityByID: (id) => (id === 'arrayParam' ? arrayParameter : unknownParameter)
      })
    };

    expect(coreLogic.fetchParameter('arrayParam', step)).toEqual(['a', 'b']);
    expect(coreLogic.fetchParameter('unknown', step)).toBeNull();
  });

  test('getPayload returns first payload source from references', () => {
    const payloadA = { id: 'payloadA' };
    const payloadB = { id: 'payloadB' };

    const sku = {
      getManager: () => ({
        getReferenceTypeHome: () => ({
          getReferenceTypeByID: () => ({})
        })
      }),
      queryReferencedBy: () => ({
        forEach: (cb) => {
          const refs = [
            { getSource: () => payloadA },
            { getSource: () => payloadB }
          ];
          for (let i = 0; i < refs.length; i += 1) {
            const keepGoing = cb(refs[i]);
            if (keepGoing === false) {
              break;
            }
          }
        }
      })
    };

    expect(coreLogic.getPayload(sku)).toBe(payloadA);
  });

  test('getPrimarySKU returns first child or null when no children', () => {
    const svWithChildren = {
      getChildren: () => ({ toArray: () => [{ getID: () => 'SKU_1' }, { getID: () => 'SKU_2' }] })
    };
    const emptySv = {
      getChildren: () => ({ toArray: () => [] })
    };

    expect(coreLogic.getPrimarySKU(svWithChildren).getID()).toBe('SKU_1');
    expect(coreLogic.getPrimarySKU(emptySv)).toBeNull();
  });

  test('getPrimaryStyleVariant picks most recent first_active_at', () => {
    const sv1 = {
      getID: () => 'SV_1',
      getValue: (id) => ({
        getSimpleValue: () => (id === 'first_active_at' ? '2024-01-01 00:00:00' : '2024-01-01 00:00:00')
      })
    };
    const sv2 = {
      getID: () => 'SV_2',
      getValue: (id) => ({
        getSimpleValue: () => (id === 'first_active_at' ? '2025-01-01 00:00:00' : '2025-01-01 00:00:00')
      })
    };

    const colorway = {
      ...nodeType('ColorwayVariantNode'),
      getChildren: () => ({ toArray: () => [sv1, sv2] })
    };

    expect(coreLogic.getPrimaryStyleVariant(colorway, false).getID()).toBe('SV_2');
  });

  test('getPrimaryStyleVariant falls back to first_media_available_at when first_active_at is missing', () => {
    const sv1 = {
      getID: () => 'SV_1',
      getValue: (id) => ({
        getSimpleValue: () => (id === 'first_active_at' ? '' : '2024-06-01 00:00:00')
      })
    };
    const sv2 = {
      getID: () => 'SV_2',
      getValue: (id) => ({
        getSimpleValue: () => (id === 'first_active_at' ? '' : '2025-06-01 00:00:00')
      })
    };

    const colorway = {
      ...nodeType('ColorwayVariantNode'),
      getChildren: () => ({ toArray: () => [sv1, sv2] })
    };

    expect(coreLogic.getPrimaryStyleVariant(colorway, false).getID()).toBe('SV_2');
  });

  test('getPrimaryColorway sorts by sample_approved_at ascending then numeric ID', () => {
    const sv10 = {
      getID: () => 'SV_10',
      ...withValueMap({ sample_approved_at: '2025-01-02T00:00:00Z' })
    };
    const sv2 = {
      getID: () => 'SV_2',
      ...withValueMap({ sample_approved_at: '2025-01-02T00:00:00Z' })
    };
    const sv1 = {
      getID: () => 'SV_1',
      ...withValueMap({ sample_approved_at: '2024-12-31T00:00:00Z' })
    };

    const product = {
      ...nodeType('ProductNode'),
      getChildren: () => ({ toArray: () => [sv10, sv2, sv1] })
    };

    expect(coreLogic.getPrimaryColorway(product, false).getID()).toBe('SV_1');
  });

  test('getPrimaryColorway returns type message for non ProductNode input', () => {
    const result = coreLogic.getPrimaryColorway({ ...nodeType('ColorwayVariantNode') }, false);
    expect(result).toBe('Object provided was not of type ProductNode');
  });

  test('getPrimarySKUFromAnywhere handles object type routing including unknown type', () => {
    global.logger = { warning: jest.fn() };

    const sku = {
      ...nodeType('SKUNode'),
      getID: () => 'SKU_1'
    };

    const sv = {
      ...nodeType('StyleVariant'),
      getID: () => 'SV_1',
      getChildren: () => ({ toArray: () => [sku] })
    };

    const colorway = {
      ...nodeType('ColorwayVariantNode'),
      getID: () => 'CW_1',
      getChildren: () => ({ toArray: () => [sv] })
    };

    const colorwayFromProduct = {
      ...nodeType('ColorwayVariantNode'),
      getID: () => 'SV_1',
      ...withValueMap({ sample_approved_at: '2024-01-01T00:00:00Z' }),
      getChildren: () => ({ toArray: () => [sv] })
    };

    const product = {
      ...nodeType('ProductNode'),
      getID: () => 'P_1',
      getChildren: () => ({ toArray: () => [colorwayFromProduct] })
    };

    const unknown = {
      ...nodeType('UnknownType'),
      getID: () => 'X_1'
    };

    expect(coreLogic.getPrimarySKUFromAnywhere(sku, false).getID()).toBe('SKU_1');
    expect(coreLogic.getPrimarySKUFromAnywhere(sv, false).getID()).toBe('SKU_1');
    expect(coreLogic.getPrimarySKUFromAnywhere(colorway, false).getID()).toBe('SKU_1');
    expect(coreLogic.getPrimarySKUFromAnywhere(product, false).getID()).toBe('SKU_1');
    expect(coreLogic.getPrimarySKUFromAnywhere(unknown, false)).toBeNull();
    expect(global.logger.warning).toHaveBeenCalledWith('Unknown object type: UnknownType');
  });
});
