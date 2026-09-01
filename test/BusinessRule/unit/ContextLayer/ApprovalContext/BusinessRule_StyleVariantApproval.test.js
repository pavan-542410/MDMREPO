const styleVariantApproval = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApproval');

class HashMapMock {
  constructor() {
    this._values = {};
  }

  put(key, value) {
    this._values[key] = value;
  }
}

class HashSetMock {
  constructor() {
    this._values = [];
  }

  add(value) {
    if (this._values.indexOf(value) === -1) {
      this._values.push(value);
    }
  }
}

class ArrayListMock {
  constructor(hashSet) {
    this._values = hashSet._values.slice();
  }

  size() {
    return this._values.length;
  }
}

describe('BusinessRule_StyleVariantApproval', () => {
  beforeEach(() => {
    global.java = {
      util: {
        HashMap: HashMapMock,
        HashSet: HashSetMock,
        ArrayList: ArrayListMock,
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            businessrule: {
              BusinessRuleHome: function BusinessRuleHome() {},
            },
          },
        },
      },
    };
    global.logger = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.logger;
  });

  test('executes routed actions when detected deltas intersect configured triggers', () => {
    const node = {
      getID: jest.fn(() => 'SV_1'),
    };
    const executeA = jest.fn();
    const executeB = jest.fn(() => {
      throw new Error('boom');
    });
    const manager = {
      getHome: jest.fn(() => ({
        getBusinessActionByID: jest.fn((id) => ({
          ActionA: { execute: executeA },
          ActionB: { execute: executeB },
        }[id] || null)),
      })),
    };
    const returnChangedData = {
      evaluate: jest.fn(() => JSON.stringify({
        attributes: [{ attrID: 'style_name' }],
        references: [{ refTypeID: 'CopyMedia' }],
        links: [],
      })),
    };
    const styleVariantApprovalConfig = {
      evaluate: jest.fn(() => JSON.stringify({
        ActionA: {
          attributes: ['style_name'],
        },
        ActionB: {
          references: ['CopyMedia'],
        },
        MissingAction: {
          links: ['ProductToBrandLink'],
        },
      })),
    };

    styleVariantApproval.operation0(
      node,
      manager,
      {},
      returnChangedData,
      styleVariantApprovalConfig
    );

    expect(executeA).toHaveBeenCalledWith(node);
    expect(executeB).toHaveBeenCalledWith(node);
    expect(global.logger.info).toHaveBeenCalledWith(
      "ERROR: Failed to execute Business Action 'ActionB'. Error: boom"
    );
  });

  test('returns early for invalid config, empty changes, and invalid delta JSON', () => {
    const node = {
      getID: jest.fn(() => 'SV_2'),
    };
    const manager = {
      getHome: jest.fn(),
    };

    styleVariantApproval.operation0(node, manager, {}, {
      evaluate: jest.fn(),
    }, {
      evaluate: jest.fn(() => '{bad-config'),
    });
    expect(manager.getHome).not.toHaveBeenCalled();

    styleVariantApproval.operation0(node, manager, {}, {
      evaluate: jest.fn(() => ''),
    }, {
      evaluate: jest.fn(() => JSON.stringify({
        ActionA: { attributes: ['style_name'] },
      })),
    });
    expect(manager.getHome).not.toHaveBeenCalled();

    styleVariantApproval.operation0(node, manager, {}, {
      evaluate: jest.fn(() => '{bad-delta'),
    }, {
      evaluate: jest.fn(() => JSON.stringify({
        ActionA: { attributes: ['style_name'] },
      })),
    });
    expect(manager.getHome).not.toHaveBeenCalled();
  });
});
