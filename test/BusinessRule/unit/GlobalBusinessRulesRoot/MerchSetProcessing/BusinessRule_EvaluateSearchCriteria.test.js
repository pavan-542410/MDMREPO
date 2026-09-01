const evaluateSearchCriteria = require('../../../../../step-configs/BusinessRule/BusinessRule_EvaluateSearchCriteria');

function createRef(title) {
  return {
    getTarget: jest.fn(() => ({
      getTitle: jest.fn(() => title),
    })),
  };
}

function createDc(attrSelection, comparator, valueSelection) {
  return {
    getDataContainerObject: jest.fn(() => ({
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => ({
          CriteriaAttributeSelection: attrSelection,
          CriteriaComparatorSelection: comparator,
          CriteriaValueSpecification: valueSelection,
        }[attrID] || null)),
      })),
    })),
  };
}

describe('BusinessRule_EvaluateSearchCriteria', () => {
  test('builds criteria summary from item type refs, merch hierarchy refs, and nested data containers', () => {
    const criteriaSummaryValue = {
      setSimpleValue: jest.fn(),
    };
    const node = {
      queryReferences: jest.fn((refType) => ({
        forEach: jest.fn((callback) => {
          const refs = refType === 'itemTypeRefType'
            ? [createRef('Dresses'), createRef('Sweaters')]
            : [createRef('Women'), createRef('Kids')];

          refs.forEach(callback);
        }),
      })),
      getValue: jest.fn((attrID) => (attrID === 'CriteriaSummary'
        ? criteriaSummaryValue
        : {
          getSimpleValue: jest.fn(() => 'Include'),
        })),
      getDataContainers: jest.fn(() => ({
        toArray: jest.fn(() => [{
          getDataContainers: jest.fn(() => ({
            toArray: jest.fn(() => [
              createDc('brand', '=', 'abc'),
              createDc('status', '=', 'Active'),
            ]),
          })),
        }]),
      })),
    };
    const step = {
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn((id) => (id === 'SearchCriteriaItemTypeReference' ? 'itemTypeRefType' : 'merchHierRefType')),
      })),
    };
    const logger = {
      info: jest.fn(),
    };
    const lib = {
      getSearchCriteriaForNode: jest.fn(() => ({ status: 'Active' })),
      getResultsForSearchCriteria: jest.fn(() => ['SKU_1']),
      linkMerchSetToSKUs: jest.fn(),
    };

    evaluateSearchCriteria.operation0(step, node, logger, {}, lib);

    expect(lib.getSearchCriteriaForNode).toHaveBeenCalledWith(node, step, logger);
    expect(lib.getResultsForSearchCriteria).toHaveBeenCalledWith({ status: 'Active' }, step, {}, logger);
    expect(lib.linkMerchSetToSKUs).toHaveBeenCalledWith(node, ['SKU_1'], step, logger);
    expect(criteriaSummaryValue.setSimpleValue).toHaveBeenCalledWith(
      'Include - Lives Below Item Type  - Dresses, Sweaters\n'
      + 'Include - Lives Below Merch Hierarchy  - Women, Kids\n'
      + 'Include - Attribute Values : \n'
      + 'brand  = abc\n'
      + 'status  = Active'
    );
  });
});
