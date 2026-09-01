const isSellsideWorkflowEligible = require('../../../../../step-configs/BusinessRule/BusinessRule_isSellsideWorkflowEligible');

function createNode(stylecardImage) {
  return {
    getValue: jest.fn(() => ({
      getSimpleValue: jest.fn(() => stylecardImage),
    })),
  };
}

function createSvHasImage(result) {
  return {
    evaluate: jest.fn(() => ({
      booleanValue: jest.fn(() => result),
    })),
  };
}

describe('BusinessRule_isSellsideWorkflowEligible', () => {
  test('returns true when the SV has no valid image result or no stylecard image', () => {
    expect(isSellsideWorkflowEligible.operation0(
      createSvHasImage(false),
      createNode('https://images/stylecard.jpg')
    )).toBe(true);

    expect(isSellsideWorkflowEligible.operation0(
      createSvHasImage(true),
      createNode('')
    )).toBe(true);
  });

  test('returns false only when both image checks are satisfied', () => {
    expect(isSellsideWorkflowEligible.operation0(
      createSvHasImage(true),
      createNode('https://images/stylecard.jpg')
    )).toBe(false);
  });
});
