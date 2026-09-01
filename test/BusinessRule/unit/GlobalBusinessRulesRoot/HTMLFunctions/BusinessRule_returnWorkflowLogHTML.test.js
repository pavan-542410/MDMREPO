const returnWorkflowLogHTML = require('../../../../../step-configs/BusinessRule/BusinessRule_returnWorkflowLogHTML');

function createEntry(timeMillis, event, toState, userID) {
  return {
    getTime: jest.fn(() => ({
      getTime: jest.fn(() => timeMillis),
    })),
    getEvent: jest.fn(() => event),
    getToState: jest.fn(() => toState),
    getUserID: jest.fn(() => userID),
  };
}

describe('BusinessRule_returnWorkflowLogHTML', () => {
  beforeEach(() => {
    global.com = {
      stibo: {
        lookuptable: {
          domain: {
            LookupTableHome: function LookupTableHome() {},
          },
        },
        core: {
          domain: {
            state: {
              log: {
                home: {
                  WorkflowLogHome: function WorkflowLogHome() {},
                },
              },
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.com;
  });

  test('groups workflow logs, skips hidden states, and renders current status by workflow', () => {
    const node = {
      isInWorkflow: jest.fn((workflowID) => workflowID === 'ProductMaintenance'),
    };
    const workflows = {
      ProductMaintenance: {
        getName: jest.fn(() => 'Product Maintenance'),
      },
      SampleAndMedia: {
        getName: jest.fn(() => 'Sample and Media'),
      },
    };
    const lookupTableHome = {
      getLookupTableValue: jest.fn((_, stateID) => ({
        TO_REVIEW: 'To Review',
        HIDDEN: 'None',
      }[stateID] || null)),
    };
    const wfLogHome = {
      queryWorkflowLogTransitionEntries: jest.fn((workflow) => ({
        asList: jest.fn(() => ({
          toArray: jest.fn(() => (workflow === workflows.ProductMaintenance
            ? [
              createEntry(Date.parse('2024-05-03T15:30:00Z'), 'MOVED_IN', 'TO_REVIEW', 'planner1'),
              createEntry(Date.parse('2024-05-02T10:00:00Z'), null, null, 'planner1'),
            ]
            : [
              createEntry(Date.parse('2024-05-01T08:00:00Z'), 'HIDDEN_EVENT', 'HIDDEN', 'planner2'),
            ])),
        })),
      })),
    };
    const userHome = {
      getUserByID: jest.fn((userID) => ({
        getName: jest.fn(() => (userID === 'planner1' ? 'Planner One' : 'Planner Two')),
      })),
    };
    const step = {
      getHome: jest.fn((homeType) => (
        homeType === global.com.stibo.lookuptable.domain.LookupTableHome
          ? lookupTableHome
          : wfLogHome
      )),
      getWorkflowHome: jest.fn(() => ({
        getWorkflowByID: jest.fn((workflowID) => workflows[workflowID] || null),
      })),
      getUserHome: jest.fn(() => userHome),
    };

    const html = returnWorkflowLogHTML.operation0(step, node);

    expect(html).toContain('Product Maintenance - In-Progress');
    expect(html).toContain('Sample and Media - Completed');
    expect(html).toContain('MOVED IN');
    expect(html).toContain('To Review');
    expect(html).toContain('Planner One');
    expect(html).not.toContain('HIDDEN EVENT');
    expect(html).not.toContain('None');
  });
});
